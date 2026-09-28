import { Match, PlayerPair, StandingRow } from '../types';

export function formatMatchScoreForWA(
  match: Match,
  teamA: PlayerPair,
  teamB: PlayerPair,
  tournamentName: string = 'Turnamen Badminton'
): string {
  const categoryLabel = match.category === 'MD' ? '🏸 Ganda Putra (MD)' : '🏸 Ganda Putri (WD)';
  const winner = match.winnerTeamId === teamA.id ? teamA : match.winnerTeamId === teamB.id ? teamB : null;

  // Format sets: e.g., Set 1: 21-18 | Set 2: 19-21 | Set 3: 21-17
  const setDetails = match.sets
    .slice(0, match.currentSet + (match.status === 'finished' ? 1 : 1))
    .filter(s => s.scoreA > 0 || s.scoreB > 0 || s.completed)
    .map((s, idx) => `Set ${idx + 1}: *${s.scoreA}* - *${s.scoreB}*`)
    .join('  |  ');

  // Count sets won
  let setsWonA = 0;
  let setsWonB = 0;
  match.sets.forEach(s => {
    if (s.completed) {
      if (s.scoreA > s.scoreB) setsWonA++;
      else if (s.scoreB > s.scoreA) setsWonB++;
    }
  });

  const statusLabel = match.status === 'finished' ? '✅ *HASIL AKHIR PERTANDINGAN*' : '🔴 *LIVE SCORE PERTANDINGAN*';
  const durationMinutes = match.startedAt && match.finishedAt 
    ? Math.max(1, Math.round((match.finishedAt - match.startedAt) / 60000))
    : match.startedAt
    ? Math.max(1, Math.round((Date.now() - match.startedAt) / 60000))
    : null;

  const dateStr = new Date(match.finishedAt || match.startedAt || Date.now()).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let text = `${statusLabel}\n`;
  text += `🏆 *${tournamentName}*\n`;
  text += `📌 ${categoryLabel} • ${match.group} (${match.court})\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `🔵 *${teamA.name}* (${teamA.player1} & ${teamA.player2})\n`;
  text += `VS\n`;
  text += `🔴 *${teamB.name}* (${teamB.player1} & ${teamB.player2})\n\n`;

  text += `📊 *SKOR GAME:*\n`;
  text += `👉 ${setDetails || 'Belum dimulai'}\n`;
  text += `👉 Skor Set: *${setsWonA} - ${setsWonB}*\n\n`;

  if (winner) {
    text += `🥇 *PEMENANG:* *${winner.name}* (${winner.player1} & ${winner.player2})\n`;
  }

  if (durationMinutes) {
    text += `⏱️ Durasi: ~${durationMinutes} Menit\n`;
  }
  text += `🗓️ Waktu: ${dateStr}\n`;
  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Dicatat otomatis via Badminton Arena Pro_ 🏸🔥`;

  return text;
}

export function formatStandingsForWA(
  groupName: string,
  category: 'MD' | 'WD',
  standings: StandingRow[],
  tournamentName: string = 'Turnamen Badminton'
): string {
  const categoryLabel = category === 'MD' ? 'Ganda Putra' : 'Ganda Putri';

  let text = `🏸 *KLASEMEN SEMENTARA (SISTEM 30 POIN)*\n`;
  text += `🏆 *${tournamentName.toUpperCase()}*\n`;
  text += `📌 *Kategori*: ${categoryLabel} - ${groupName}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Pos | Pasangan | M | K | Poin Masuk-Kalah | Selisih Poin\n`;
  text += `-------------------------------------\n`;

  standings.forEach((row, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    const pointDiffFormatted = row.pointDiff > 0 ? `+${row.pointDiff}` : `${row.pointDiff}`;
    text += `${medal} *${row.team.name}*\n`;
    text += `   Main: ${row.played} | Menang: ${row.won} | Kalah: ${row.lost}\n`;
    text += `   Poin: ${row.pointsWon} - ${row.pointsLost} | *Selisih Poin: ${pointDiffFormatted}*\n\n`;
  });

  text += `ℹ️ _Peringkat dihitung dari Jumlah Kemenangan & Selisih Poin_\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🗓️ Update: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}\n`;
  text += `_Badminton Arena Pro_ 🏸`;

  return text;
}

export function openWhatsAppShare(text: string) {
  const encoded = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
