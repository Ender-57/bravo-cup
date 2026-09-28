import { AppSettings, Match, PlayerPair } from '../types';

const STORAGE_KEYS = {
  TEAMS: 'badminton_arena_teams_v2',
  MATCHES: 'badminton_arena_matches_v2',
  SETTINGS: 'badminton_arena_settings_v2',
  ADMIN_SESSION: 'badminton_arena_admin_session_v2',
};

export const INITIAL_SETTINGS: AppSettings = {
  adminPin: '1234',
  tournamentName: 'Turnamen Badminton Antar Warga 2026',
  soundEnabled: true,
  defaultMaxPoints: 30,
  defaultBestOf: 1,
};

export const INITIAL_TEAMS: PlayerPair[] = [
  // Ganda Putra - Grup A
  {
    id: 'md-team-1',
    name: 'Fajar / Rian',
    player1: 'Fajar Alfian',
    player2: 'M. Rian Ardianto',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'PB Tangkas',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'md-team-2',
    name: 'Hendra / Ahsan',
    player1: 'Hendra Setiawan',
    player2: 'Mohammad Ahsan',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'PB Jaya Raya',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'md-team-3',
    name: 'Leo / Bagas',
    player1: 'Leo Rolly Carnando',
    player2: 'Bagas Maulana',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'PB Djarum',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'md-team-4',
    name: 'Sabar / Reza',
    player1: 'Sabar Karyaman',
    player2: 'Moh. Reza Pahlevi',
    category: 'MD',
    group: 'Grup A',
    clubOrOrigin: 'PB Sukun',
    avatarColor: 'from-rose-500 to-pink-600',
  },

  // Ganda Putra - Grup B
  {
    id: 'md-team-5',
    name: 'Kevin / Marcus',
    player1: 'Kevin Sanjaya',
    player2: 'Marcus Gideon',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'PB Djarum',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'md-team-6',
    name: 'Daniel / Shohibul',
    player1: 'Daniel Marthin',
    player2: 'M. Shohibul Fikri',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'PB Jaya Raya',
    avatarColor: 'from-violet-500 to-purple-600',
  },
  {
    id: 'md-team-7',
    name: 'Rahmat / Yeremia',
    player1: 'Rahmat Hidayat',
    player2: 'Yeremia Rambitan',
    category: 'MD',
    group: 'Grup B',
    clubOrOrigin: 'PB Exist',
    avatarColor: 'from-lime-500 to-green-600',
  },

  // Ganda Putri - Grup A
  {
    id: 'wd-team-1',
    name: 'Apriyani / Fadia',
    player1: 'Apriyani Rahayu',
    player2: 'Siti Fadia Silva',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'PB Jaya Raya',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'wd-team-2',
    name: 'Febriana / Amallia',
    player1: 'Febriana Dwipuji',
    player2: 'Amallia Cahaya',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'PB Djarum',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'wd-team-3',
    name: 'Lanny / Rachel',
    player1: 'Lanny Tria Mayasari',
    player2: 'Rachel Allessya Rose',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'PB Djarum',
    avatarColor: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'wd-team-4',
    name: 'Jesita / Febi',
    player1: 'Jesita Putri Miantoro',
    player2: 'Febi Setianingrum',
    category: 'WD',
    group: 'Grup A',
    clubOrOrigin: 'PB Exist',
    avatarColor: 'from-yellow-500 to-amber-600',
  },

  // Ganda Putri - Grup B
  {
    id: 'wd-team-5',
    name: 'Ribka / Meilysa',
    player1: 'Ribka Sugiarto',
    player2: 'Meilysa Trias',
    category: 'WD',
    group: 'Grup B',
    clubOrOrigin: 'PB Jaya Raya',
    avatarColor: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'wd-team-6',
    name: 'Kelly / Siti',
    player1: 'Kelly Larissa',
    player2: 'Siti Sarah Azzahra',
    category: 'WD',
    group: 'Grup B',
    clubOrOrigin: 'PB Tangkas',
    avatarColor: 'from-orange-500 to-red-600',
  },
  {
    id: 'wd-team-7',
    name: 'Arlya / Zahra',
    player1: 'Arlya Nabila',
    player2: 'Zahra Rahmawati',
    category: 'WD',
    group: 'Grup B',
    clubOrOrigin: 'PB Mutiara Cardinal',
    avatarColor: 'from-sky-500 to-cyan-600',
  },
];

export const INITIAL_MATCHES: Match[] = [
  // 1. Finished Match (Ganda Putra - Grup A) - Contoh spesifik pengguna: 30 vs 12
  {
    id: 'match-1',
    code: 'MD-A01',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-team-1', // Fajar / Rian
    teamBId: 'md-team-2', // Hendra / Ahsan
    court: 'Lapangan 1',
    status: 'finished',
    currentSet: 0,
    sets: [
      { scoreA: 30, scoreB: 12, completed: true, winner: 'A' },
    ],
    maxPoints: 30,
    servingTeam: 'A',
    winnerTeamId: 'md-team-1',
    startedAt: Date.now() - 3600000 * 2.5,
    finishedAt: Date.now() - 3600000 * 1.8,
    history: [],
    notes: 'Skor 30 vs 12: Selisih poin Fajar/Rian (+18), Hendra/Ahsan (-18)',
  },
  // 2. Finished Match (Ganda Putra - Grup A)
  {
    id: 'match-2',
    code: 'MD-A02',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-team-3', // Leo / Bagas
    teamBId: 'md-team-4', // Sabar / Reza
    court: 'Lapangan 2',
    status: 'finished',
    currentSet: 0,
    sets: [
      { scoreA: 30, scoreB: 24, completed: true, winner: 'A' },
    ],
    maxPoints: 30,
    servingTeam: 'A',
    winnerTeamId: 'md-team-3',
    startedAt: Date.now() - 3600000 * 4,
    finishedAt: Date.now() - 3600000 * 3.4,
    history: [],
    notes: 'Skor 30 vs 24: Selisih poin Leo/Bagas (+6), Sabar/Reza (-6)',
  },
  // 3. Finished Match (Ganda Putri - Grup A)
  {
    id: 'match-3',
    code: 'WD-A01',
    category: 'WD',
    group: 'Grup A',
    teamAId: 'wd-team-1', // Apriyani / Fadia
    teamBId: 'wd-team-2', // Febriana / Amallia
    court: 'Lapangan 1',
    status: 'finished',
    currentSet: 0,
    sets: [
      { scoreA: 30, scoreB: 19, completed: true, winner: 'A' },
    ],
    maxPoints: 30,
    servingTeam: 'A',
    winnerTeamId: 'wd-team-1',
    startedAt: Date.now() - 3600000 * 1.5,
    finishedAt: Date.now() - 3600000 * 1,
    history: [],
    notes: 'Skor 30 vs 19: Selisih poin Apriyani/Fadia (+11)',
  },
  // 4. Live Match in progress (Ganda Putra - Grup B)
  {
    id: 'match-4',
    code: 'MD-B01',
    category: 'MD',
    group: 'Grup B',
    teamAId: 'md-team-5', // Kevin / Marcus
    teamBId: 'md-team-6', // Daniel / Shohibul
    court: 'Lapangan 1 (Utama)',
    status: 'live',
    currentSet: 0,
    sets: [
      { scoreA: 26, scoreB: 24, completed: false },
    ],
    maxPoints: 30,
    servingTeam: 'B',
    startedAt: Date.now() - 1000 * 60 * 20,
    history: [
      { timestamp: Date.now() - 120000, action: 'Point Daniel / Shohibul', setIndex: 0, scoreA: 26, scoreB: 23, servingTeam: 'A' },
      { timestamp: Date.now() - 60000, action: 'Point Daniel / Shohibul', setIndex: 0, scoreA: 26, scoreB: 24, servingTeam: 'B' },
    ],
  },
  // 5. Scheduled Matches
  {
    id: 'match-5',
    code: 'MD-A03',
    category: 'MD',
    group: 'Grup A',
    teamAId: 'md-team-1',
    teamBId: 'md-team-3',
    court: 'Lapangan 1',
    status: 'scheduled',
    currentSet: 0,
    sets: [
      { scoreA: 0, scoreB: 0, completed: false },
    ],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-6',
    code: 'WD-A02',
    category: 'WD',
    group: 'Grup A',
    teamAId: 'wd-team-3',
    teamBId: 'wd-team-4',
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [
      { scoreA: 0, scoreB: 0, completed: false },
    ],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
  {
    id: 'match-7',
    code: 'WD-B01',
    category: 'WD',
    group: 'Grup B',
    teamAId: 'wd-team-5',
    teamBId: 'wd-team-6',
    court: 'Lapangan 2',
    status: 'scheduled',
    currentSet: 0,
    sets: [
      { scoreA: 0, scoreB: 0, completed: false },
    ],
    maxPoints: 30,
    servingTeam: 'A',
    history: [],
  },
];

export function loadTeams(): PlayerPair[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!raw) {
      saveTeams(INITIAL_TEAMS);
      return INITIAL_TEAMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEAMS;
  }
}

export function saveTeams(teams: PlayerPair[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.error('Error saving teams', e);
  }
}

export function loadMatches(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (!raw) {
      saveMatches(INITIAL_MATCHES);
      return INITIAL_MATCHES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MATCHES;
  }
}

export function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  } catch (e) {
    console.error('Error saving matches', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function resetAllData(): void {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
}
