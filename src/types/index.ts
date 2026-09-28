export type Category = 'MD' | 'WD'; // MD: Ganda Putra, WD: Ganda Putri

export interface PlayerPair {
  id: string;
  name: string; // display alias or e.g. "Fajar / Rian"
  player1: string;
  player2: string;
  category: Category;
  group: string; // e.g. 'Grup A', 'Grup B'
  clubOrOrigin?: string;
  avatarColor?: string;
}

export interface MatchSet {
  scoreA: number;
  scoreB: number;
  completed: boolean;
  winner?: 'A' | 'B';
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface ScoreHistoryItem {
  timestamp: number;
  action: string;
  setIndex: number;
  scoreA: number;
  scoreB: number;
  servingTeam?: 'A' | 'B';
}

export interface Match {
  id: string;
  code: string;
  category: Category;
  group: string;
  teamAId: string;
  teamBId: string;
  court: string;
  status: MatchStatus;
  currentSet: number; // 0-indexed: 0 = set 1, 1 = set 2, 2 = set 3
  sets: MatchSet[];
  maxPoints: number; // default 30
  servingTeam: 'A' | 'B';
  winnerTeamId?: string;
  startedAt?: number;
  finishedAt?: number;
  history: ScoreHistoryItem[];
  courtSwapped?: boolean; // toggle visually
  notes?: string;
}

export interface StandingRow {
  team: PlayerPair;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
  pointsWon: number;
  pointsLost: number;
  pointDiff: number; // Selisih poin: pointsWon - pointsLost
  standingPoints: number; // Poin kemenangan klasemen
  rank?: number;
}

export interface AppSettings {
  adminPin: string;
  tournamentName: string;
  soundEnabled: boolean;
  defaultMaxPoints: number; // 30
  defaultBestOf: number; // 1 or 3
}
