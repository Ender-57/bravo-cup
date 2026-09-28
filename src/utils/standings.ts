import { Match, PlayerPair, StandingRow } from '../types';

export function calculateStandings(
  teams: PlayerPair[],
  matches: Match[]
): StandingRow[] {
  const map = new Map<string, StandingRow>();

  // Initialize row for all teams in the group
  teams.forEach(team => {
    map.set(team.id, {
      team,
      played: 0,
      won: 0,
      lost: 0,
      setsWon: 0,
      setsLost: 0,
      setDiff: 0,
      pointsWon: 0,
      pointsLost: 0,
      pointDiff: 0,
      standingPoints: 0,
    });
  });

  // Process completed matches only
  const finishedMatches = matches.filter(m => m.status === 'finished');

  finishedMatches.forEach(m => {
    const rowA = map.get(m.teamAId);
    const rowB = map.get(m.teamBId);

    if (!rowA || !rowB) return;

    rowA.played += 1;
    rowB.played += 1;

    let setsWonA = 0;
    let setsWonB = 0;

    m.sets.forEach(set => {
      if (set.completed || set.scoreA > 0 || set.scoreB > 0) {
        rowA.pointsWon += set.scoreA;
        rowA.pointsLost += set.scoreB;
        rowB.pointsWon += set.scoreB;
        rowB.pointsLost += set.scoreA;

        if (set.completed) {
          if (set.scoreA > set.scoreB) setsWonA += 1;
          else if (set.scoreB > set.scoreA) setsWonB += 1;
        }
      }
    });

    rowA.setsWon += setsWonA;
    rowA.setsLost += setsWonB;
    rowB.setsWon += setsWonB;
    rowB.setsLost += setsWonA;

    if (m.winnerTeamId === m.teamAId || setsWonA > setsWonB) {
      rowA.won += 1;
      rowA.standingPoints += 2;
      rowB.lost += 1;
    } else if (m.winnerTeamId === m.teamBId || setsWonB > setsWonA) {
      rowB.won += 1;
      rowB.standingPoints += 2;
      rowA.lost += 1;
    }
  });

  // Calculate diffs and sort
  const rows = Array.from(map.values()).map(row => {
    row.setDiff = row.setsWon - row.setsLost;
    row.pointDiff = row.pointsWon - row.pointsLost;
    return row;
  });

  rows.sort((a, b) => {
    // 1. Peringkat ditentukan berdasarkan jumlah poin (PTS)
    if (b.standingPoints !== a.standingPoints) {
      return b.standingPoints - a.standingPoints;
    }
    // 2. Apabila poin sama, ditentukan berdasarkan selisih poin (contoh: 30 vs 12 => +18 vs -18)
    if (b.pointDiff !== a.pointDiff) {
      return b.pointDiff - a.pointDiff;
    }
    // 3. Total poin memasukkan (points won)
    if (b.pointsWon !== a.pointsWon) {
      return b.pointsWon - a.pointsWon;
    }
    // 4. Selisih set
    if (b.setDiff !== a.setDiff) {
      return b.setDiff - a.setDiff;
    }
    // 5. Head-to-Head jika pernah bertanding
    const h2h = finishedMatches.find(
      m => (m.teamAId === a.team.id && m.teamBId === b.team.id) ||
           (m.teamAId === b.team.id && m.teamBId === a.team.id)
    );
    if (h2h) {
      if (h2h.winnerTeamId === a.team.id) return -1;
      if (h2h.winnerTeamId === b.team.id) return 1;
    }
    return 0;
  });

  // Assign ranks
  return rows.map((r, i) => ({
    ...r,
    rank: i + 1,
  }));
}
