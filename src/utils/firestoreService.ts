import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { AppSettings, Match, PlayerPair } from '../types';
import { INITIAL_MATCHES, INITIAL_SETTINGS, INITIAL_TEAMS } from './storage';

const COLLECTIONS = {
  SETTINGS: 'settings',
  TEAMS: 'teams',
  MATCHES: 'matches',
};

const SETTINGS_DOC_ID = 'global_settings';

/**
 * Subscribe to real-time updates for tournament settings
 */
export function subscribeToSettings(onData: (settings: AppSettings) => void) {
  const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data() as AppSettings);
    }
  }, (err) => {
    console.warn("Firestore settings subscription notice:", err.message);
  });
}

/**
 * Subscribe to real-time updates for teams
 */
export function subscribeToTeams(onData: (teams: PlayerPair[]) => void) {
  const colRef = collection(db, COLLECTIONS.TEAMS);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const teams = snapshot.docs.map(d => d.data() as PlayerPair);
      onData(teams);
    }
  }, (err) => {
    console.warn("Firestore teams subscription notice:", err.message);
  });
}

/**
 * Subscribe to real-time updates for matches
 */
export function subscribeToMatches(onData: (matches: Match[]) => void) {
  const colRef = collection(db, COLLECTIONS.MATCHES);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const matches = snapshot.docs.map(d => d.data() as Match);
      onData(matches);
    }
  }, (err) => {
    console.warn("Firestore matches subscription notice:", err.message);
  });
}

// In-memory flags to prevent redundant calls and quota exhaustion
let isSeeding = false;
let hasCheckedSeed = false;
const matchDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Seed Firestore with initial tournament data if empty or migrate if old roster detected
 */
export async function seedFirestoreIfEmpty() {
  if (hasCheckedSeed || isSeeding) return;
  isSeeding = true;
  try {
    const teamsSnap = await getDocs(collection(db, COLLECTIONS.TEAMS));
    const hasOldRoster = !teamsSnap.empty && teamsSnap.docs.some(d => d.id === 'md-team-1' || (d.data() as any).player1 === 'Fajar Alfian');

    if (teamsSnap.empty || hasOldRoster) {
      console.log("Seeding / migrating Firestore to Bravo Cup roster...");
      const batch = writeBatch(db);

      // Clean up old teams if migrating
      if (hasOldRoster) {
        teamsSnap.docs.forEach(d => batch.delete(d.ref));
        const matchesSnap = await getDocs(collection(db, COLLECTIONS.MATCHES));
        matchesSnap.docs.forEach(d => batch.delete(d.ref));
      }

      // Seed settings
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      batch.set(settingsRef, INITIAL_SETTINGS);

      // Seed teams
      INITIAL_TEAMS.forEach(team => {
        const teamRef = doc(db, COLLECTIONS.TEAMS, team.id);
        batch.set(teamRef, team);
      });

      // Seed matches
      INITIAL_MATCHES.forEach(match => {
        const matchRef = doc(db, COLLECTIONS.MATCHES, match.id);
        batch.set(matchRef, match);
      });

      await batch.commit();
      console.log("Firestore Bravo Cup roster migration completed.");
    }
    hasCheckedSeed = true;
  } catch (error) {
    console.warn("Firestore seeding check:", error);
  } finally {
    isSeeding = false;
  }
}

/**
 * Save or update a match in Firestore with debouncing
 * (Protects against rapid writes during live score updates exceeding Firestore rate limits)
 */
export async function saveMatchToFirestore(match: Match, immediate = false) {
  if (immediate) {
    if (matchDebounceTimers[match.id]) {
      clearTimeout(matchDebounceTimers[match.id]);
      delete matchDebounceTimers[match.id];
    }
    try {
      const matchRef = doc(db, COLLECTIONS.MATCHES, match.id);
      await setDoc(matchRef, match);
    } catch (error) {
      console.warn("Error saving match to Firestore:", error);
    }
    return;
  }

  // Debounce writes by 400ms to ensure rapid point clicks don't flood Firestore
  if (matchDebounceTimers[match.id]) {
    clearTimeout(matchDebounceTimers[match.id]);
  }

  matchDebounceTimers[match.id] = setTimeout(async () => {
    delete matchDebounceTimers[match.id];
    try {
      const matchRef = doc(db, COLLECTIONS.MATCHES, match.id);
      await setDoc(matchRef, match);
    } catch (error) {
      console.warn("Error saving match to Firestore (rate/quota guard):", error);
    }
  }, 400);
}

/**
 * Delete a match from Firestore
 */
export async function deleteMatchFromFirestore(matchId: string) {
  try {
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    await deleteDoc(matchRef);
  } catch (error) {
    console.error("Error deleting match from Firestore:", error);
  }
}

/**
 * Save or update a team in Firestore
 */
export async function saveTeamToFirestore(team: PlayerPair) {
  try {
    const teamRef = doc(db, COLLECTIONS.TEAMS, team.id);
    await setDoc(teamRef, team);
  } catch (error) {
    console.error("Error saving team to Firestore:", error);
  }
}

/**
 * Save multiple teams in Firestore
 */
export async function saveTeamsToFirestore(teams: PlayerPair[]) {
  try {
    const batch = writeBatch(db);
    teams.forEach(team => {
      const teamRef = doc(db, COLLECTIONS.TEAMS, team.id);
      batch.set(teamRef, team);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error batch saving teams to Firestore:", error);
  }
}

/**
 * Delete a team from Firestore
 */
export async function deleteTeamFromFirestore(teamId: string) {
  try {
    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    await deleteDoc(teamRef);
  } catch (error) {
    console.error("Error deleting team from Firestore:", error);
  }
}

/**
 * Save settings to Firestore
 */
export async function saveSettingsToFirestore(settings: AppSettings) {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
    await setDoc(settingsRef, settings);
  } catch (error) {
    console.error("Error saving settings to Firestore:", error);
  }
}

/**
 * Reset all data in Firestore to initial default
 */
export async function resetFirestoreToDefaults() {
  try {
    const batch = writeBatch(db);

    // Delete existing matches
    const matchesSnap = await getDocs(collection(db, COLLECTIONS.MATCHES));
    matchesSnap.docs.forEach(d => batch.delete(d.ref));

    // Delete existing teams
    const teamsSnap = await getDocs(collection(db, COLLECTIONS.TEAMS));
    teamsSnap.docs.forEach(d => batch.delete(d.ref));

    // Set default settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
    batch.set(settingsRef, INITIAL_SETTINGS);

    // Re-insert initial teams
    INITIAL_TEAMS.forEach(team => {
      const teamRef = doc(db, COLLECTIONS.TEAMS, team.id);
      batch.set(teamRef, team);
    });

    // Re-insert initial matches
    INITIAL_MATCHES.forEach(match => {
      const matchRef = doc(db, COLLECTIONS.MATCHES, match.id);
      batch.set(matchRef, match);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error resetting Firestore data:", error);
  }
}
