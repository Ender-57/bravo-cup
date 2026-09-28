import { AppSettings, Match, PlayerPair } from '../types';

const STORAGE_KEYS = {
  TEAMS: 'badminton_bravo_teams_v3',
  MATCHES: 'badminton_bravo_matches_v3',
  SETTINGS: 'badminton_bravo_settings_v3',
  ADMIN_SESSION: 'badminton_bravo_admin_session_v3',
};

export const INITIAL_SETTINGS: AppSettings = {
  adminPin: '1234',
  tournamentName: 'Badminton Biro Advokasi Cup (Bravo Cup)',
  soundEnabled: true,
  defaultMaxPoints: 30,
  defaultBestOf: 1,
};

export const INITIAL_TEAMS: PlayerPair[] = [
  // Ganda Putra (Mens Double) - Grup A
  {
    id: 'md-a1',
    name: 'Rory / Franklin',
    player1: 'Rory',
    player2: 'Franklin',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'Grup A',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'md-a2',
    name: 'Ahid / Arif',
    player1: 'Ahid',
    player2: 'Arif',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'Grup A',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'md-a3',
    name: 'Aboy / Dwight',
    player1: 'Aboy',
    player2: 'Dwight',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'Grup A',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'md-a4',
    name: 'Dhika / Ikko',
    player1: 'Dhika',
    player2: 'Ikko',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'Grup A',
    avatarColor: 'from-rose-500 to-pink-600',
  },

  // Ganda Putra (Mens Double) - Grup B
  {
    id: 'md-b1',
    name: 'Will / Mora',
    player1: 'Will',
    player2: 'Mora',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'Grup B',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'md-b2',
    name: 'Christian / Hendra',
    player1: 'Christian',
    player2: 'Hendra',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'Grup B',
    avatarColor: 'from-violet-500 to-purple-600',
  },
  {
    id: 'md-b3',
    name: 'Vicky / Khalis',
    player1: 'Vicky',
    player2: 'Khalis',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'Grup B',
    avatarColor: 'from-lime-500 to-green-600',
  },
  {
    id: 'md-b4',
    name: 'Sukarjo / Made',
    player1: 'Sukarjo',
    player2: 'Made',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'Grup B',
    avatarColor: 'from-teal-500 to-cyan-600',
  },

  // Ganda Putri (Womens Double) - Grup A (Senin sore)
  {
    id: 'wd-a1',
    name: 'Kice / Nurul',
    player1: 'Kice',
    player2: 'Nurul',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'Senin Sore',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'wd-a2',
    name: 'Mala / Arlina',
    player1: 'Mala',
    player2: 'Arlina',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'Senin Sore',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'wd-a3',
    name: 'Gesa / Nabila',
    player1: 'Gesa',
    player2: 'Nabila',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'Senin Sore',
    avatarColor: 'from-teal-500 to-emerald-600',
  },

  // Ganda Putri (Womens Double) - Grup B (Rabu pagi)
  {
    id: 'wd-b1',
    name: 'Fatih / Tika',
    player1: 'Fatih',
    player2: 'Tika',
    category: 'WD',
    group: 'Grup B',
    clubOrOrigin: 'Rabu Pagi',
    avatarColor: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'wd-b2',
    name: 'Reta / Amel',
    player1: 'Reta',
    player2: 'Amel',
    category: 'WD',
    group: 'Grup B',
    clubOrOrigin: 'Rabu Pagi',
    avatarColor: 'from-orange-500 to-red-600',
  },
  {
    id: 'wd-b3',
    name: 'Ana / Isti',
    player1: 'Ana',
    player2: 'Isti',
    category: 'WD',
    group: 'Grup B',
    clubOrOrigin: 'Rabu Pagi',
    avatarColor: 'from-sky-500 to-cyan-600',
  },
];

export const INITIAL_MATCHES: Match[] = [
  // --- Mens Double - Grup A ---
  {
    id: 'match-md-a1',
    code: 'MD-A01',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-a1', // Rory / Franklin
    teamBId: 'md-a2', // Ahid / Arif
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-a2',
    code: 'MD-A02',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-a3', // Aboy / Dwight
    teamBId: 'md-a4', // Dhika / Ikko
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-a3',
    code: 'MD-A03',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-a1', // Rory / Franklin
    teamBId: 'md-a3', // Aboy / Dwight
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-a4',
    code: 'MD-A04',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-a2', // Ahid / Arif
    teamBId: 'md-a4', // Dhika / Ikko
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-a5',
    code: 'MD-A05',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-a1', // Rory / Franklin
    teamBId: 'md-a4', // Dhika / Ikko
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-a6',
    code: 'MD-A06',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-a2', // Ahid / Arif
    teamBId: 'md-a3', // Aboy / Dwight
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },

  // --- Mens Double - Grup B ---
  {
    id: 'match-md-b1',
    code: 'MD-B01',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-b1', // Will / Mora
    teamBId: 'md-b2', // Christian / Hendra
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-b2',
    code: 'MD-B02',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-b3', // Vicky / Khalis
    teamBId: 'md-b4', // Sukarjo / Made
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-b3',
    code: 'MD-B03',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-b1', // Will / Mora
    teamBId: 'md-b3', // Vicky / Khalis
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-b4',
    code: 'MD-B04',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-b2', // Christian / Hendra
    teamBId: 'md-b4', // Sukarjo / Made
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-b5',
    code: 'MD-B05',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-b1', // Will / Mora
    teamBId: 'md-b4', // Sukarjo / Made
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-md-b6',
    code: 'MD-B06',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-b2', // Christian / Hendra
    teamBId: 'md-b3', // Vicky / Khalis
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },

  // --- Womens Double - Grup A (Senin Sore) ---
  {
    id: 'match-wd-a1',
    code: 'WD-A01',
    category: 'WD',
    group: 'Grup A',
    teamAId: 'wd-a1', // Kice / Nurul
    teamBId: 'wd-a2', // Mala / Arlina
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
    notes: 'Jadwal: Senin Sore',
  },
  {
    id: 'match-wd-a2',
    code: 'WD-A02',
    category: 'WD',
    group: 'Grup A',
    teamAId: 'wd-a1', // Kice / Nurul
    teamBId: 'wd-a3', // Gesa / Nabila
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
    notes: 'Jadwal: Senin Sore',
  },
  {
    id: 'match-wd-a3',
    code: 'WD-A03',
    category: 'WD',
    group: 'Grup A',
    teamAId: 'wd-a2', // Mala / Arlina
    teamBId: 'wd-a3', // Gesa / Nabila
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
    notes: 'Jadwal: Senin Sore',
  },

  // --- Womens Double - Grup B (Rabu Pagi) ---
  {
    id: 'match-wd-b1',
    code: 'WD-B01',
    category: 'WD',
    group: 'Grup B',
    teamAId: 'wd-b1', // Fatih / Tika
    teamBId: 'wd-b2', // Reta / Amel
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
    notes: 'Jadwal: Rabu Pagi',
  },
  {
    id: 'match-wd-b2',
    code: 'WD-B02',
    category: 'WD',
    group: 'Grup B',
    teamAId: 'wd-b1', // Fatih / Tika
    teamBId: 'wd-b3', // Ana / Isti
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
    notes: 'Jadwal: Rabu Pagi',
  },
  {
    id: 'match-wd-b3',
    code: 'WD-B03',
    category: 'WD',
    group: 'Grup B',
    teamAId: 'wd-b2', // Reta / Amel
    teamBId: 'wd-b3', // Ana / Isti
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [{ scoreA: 0, scoreB: 0, completed: false }],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
    notes: 'Jadwal: Rabu Pagi',
  },
];

export function loadTeams(): PlayerPair[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!raw) {
      saveTeams(INITIAL_TEAMS);
      return INITIAL_TEAMS;
    }
    const parsed = JSON.parse(raw);
    // If old roster was saved, migrate to new roster
    if (Array.isArray(parsed) && parsed.some(p => p.id === 'md-team-1' || p.player1 === 'Fajar Alfian')) {
      saveTeams(INITIAL_TEAMS);
      return INITIAL_TEAMS;
    }
    return parsed;
  } catch {
    return INITIAL_TEAMS;
  }
}

export function saveTeams(teams: PlayerPair[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to save teams to localStorage', e);
  }
}

export function loadMatches(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (!raw) {
      saveMatches(INITIAL_MATCHES);
      return INITIAL_MATCHES;
    }
    const parsed = JSON.parse(raw);
    // If old matches were saved, migrate to new matches
    if (Array.isArray(parsed) && parsed.some(m => m.id === 'match-1' || m.teamAId === 'md-team-1')) {
      saveMatches(INITIAL_MATCHES);
      return INITIAL_MATCHES;
    }
    return parsed;
  } catch {
    return INITIAL_MATCHES;
  }
}

export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save matches to localStorage', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getAdminSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(isAuthenticated: boolean): void {
  try {
    if (isAuthenticated) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to set admin session', e);
  }
}

export function resetAllData(): void {
  saveTeams(INITIAL_TEAMS);
  saveMatches(INITIAL_MATCHES);
  saveSettings(INITIAL_SETTINGS);
}
