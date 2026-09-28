import { StandingRow } from '../types';

interface DrawPosterOptions {
  tournamentName: string;
  currentDateStr: string;
  currentTimeStr: string;
  mdStandingsA: StandingRow[];
  mdStandingsB: StandingRow[];
  wdStandingsA: StandingRow[];
  wdStandingsB: StandingRow[];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function generateStandingsCanvasPoster(options: DrawPosterOptions): {
  dataUrl: string;
  blobPromise: Promise<Blob | null>;
} {
  const {
    tournamentName,
    currentDateStr,
    currentTimeStr,
    mdStandingsA,
    mdStandingsB,
    wdStandingsA,
    wdStandingsB,
  } = options;

  const logicalWidth = 820;
  const logicalHeight = 670;
  const scale = 2; // Retina / HD

  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * scale;
  canvas.height = logicalHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Scale all drawing operations for ultra-sharp Retina output
  ctx.scale(scale, scale);

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Outer border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  roundRect(ctx, 10, 10, logicalWidth - 20, logicalHeight - 20, 16);
  ctx.stroke();

  // 2. Header Area
  const padX = 28;
  let curY = 32;

  // Shuttlecock + Title
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#090d16';
  ctx.fillText(`🏸 ${tournamentName.toUpperCase()}`, padX, curY);

  curY += 20;
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#007DCC';
  ctx.fillText('REKAP KLASEMEN RESMI SELURUH POOL • SISTEM SKOR MAKSIMAL 30 POIN', padX, curY);

  // Top Right Official Update Badge
  const badgeRight = logicalWidth - padX;
  const badgeW = 90;
  const badgeH = 20;
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, badgeRight - badgeW, 20, badgeW, badgeH, 5);
  ctx.fill();

  ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('UPDATE RESMI', badgeRight - badgeW / 2, 33);

  ctx.textAlign = 'right';
  ctx.font = '600 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(currentDateStr, badgeRight, 54);

  ctx.font = '400 9.5px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Pukul ${currentTimeStr} WIB`, badgeRight, 67);

  // Reset alignment
  ctx.textAlign = 'left';

  // Divider Line
  curY += 20;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(logicalWidth - padX, curY);
  ctx.stroke();

  // Draw Table Helper
  const drawGroupTable = (
    startX: number,
    startY: number,
    tableWidth: number,
    groupTitle: string,
    teamCountLabel: string,
    headerBg: string,
    standings: StandingRow[]
  ) => {
    let tY = startY;

    // Header Card
    ctx.fillStyle = headerBg;
    roundRectTop(ctx, startX, tY, tableWidth, 24, 8);
    ctx.fill();

    ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(groupTitle, startX + 10, tY + 16);

    ctx.font = '500 9.5px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = headerBg === '#0f172a' ? '#94a3b8' : '#fecdd3';
    ctx.textAlign = 'right';
    ctx.fillText(teamCountLabel, startX + tableWidth - 10, tY + 16);

    tY += 24;

    // Table Column Headers
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(startX, tY, tableWidth, 20);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, tY, tableWidth, 20);

    ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';

    const colRankX = startX + 16;
    const colNameX = startX + 32;
    const colMNX = startX + tableWidth - 165;
    const colMX = startX + tableWidth - 135;
    const colKX = startX + tableWidth - 105;
    const colPtsX = startX + tableWidth - 62;
    const colDiffX = startX + tableWidth - 18;

    ctx.fillStyle = '#475569';
    ctx.fillText('#', colRankX, tY + 14);

    ctx.textAlign = 'left';
    ctx.fillText('PASANGAN', colNameX, tY + 14);

    ctx.textAlign = 'center';
    ctx.fillText('MN', colMNX, tY + 14);

    ctx.fillStyle = '#047857';
    ctx.fillText('M', colMX, tY + 14);

    ctx.fillStyle = '#be123c';
    ctx.fillText('K', colKX, tY + 14);

    ctx.fillStyle = '#475569';
    ctx.fillText('POIN', colPtsX, tY + 14);

    ctx.fillStyle = '#0f172a';
    ctx.fillText('+/-', colDiffX, tY + 14);

    tY += 20;

    // Rows
    const rowH = 34;
    standings.forEach((row, idx) => {
      const isTop = idx === 0;
      const isAlt = idx % 2 === 1;

      ctx.fillStyle = isTop ? '#fef9c3' : isAlt ? '#f8fafc' : '#ffffff';
      ctx.fillRect(startX, tY, tableWidth, rowH);

      // Bottom Row Border
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(startX, tY + rowH);
      ctx.lineTo(startX + tableWidth, tY + rowH);
      ctx.stroke();

      // Rank Medal / Number
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
      ctx.font = idx < 3 ? '12px -apple-system, sans-serif' : 'bold 11px -apple-system, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText(medal, colRankX, tY + 21);

      // Team Name & Players
      ctx.textAlign = 'left';
      ctx.font = isTop
        ? 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif'
        : '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#0f172a';
      
      // Truncate name if needed
      let teamName = row.team.name;
      if (teamName.length > 20) teamName = teamName.slice(0, 19) + '…';
      ctx.fillText(teamName, colNameX, tY + 14);

      ctx.font = '400 9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#64748b';
      let players = `${row.team.player1} & ${row.team.player2}`;
      if (players.length > 22) players = players.slice(0, 21) + '…';
      ctx.fillText(players, colNameX, tY + 27);

      // Numbers
      ctx.textAlign = 'center';
      ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(String(row.played), colMNX, tY + 21);

      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#047857';
      ctx.fillText(String(row.won), colMX, tY + 21);

      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#be123c';
      ctx.fillText(String(row.lost), colKX, tY + 21);

      ctx.font = '500 10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`${row.pointsWon}-${row.pointsLost}`, colPtsX, tY + 21);

      const diffStr = row.pointDiff > 0 ? `+${row.pointDiff}` : String(row.pointDiff);
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle =
        row.pointDiff > 0 ? '#047857' : row.pointDiff < 0 ? '#be123c' : '#64748b';
      ctx.fillText(diffStr, colDiffX, tY + 21);

      tY += rowH;
    });

    // Outer table border box
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    roundRect(ctx, startX, startY, tableWidth, tY - startY, 8);
    ctx.stroke();

    return tY;
  };

  const colWidth = (logicalWidth - padX * 2 - 16) / 2; // ~374px

  // 3. SECTION 1: GANDA PUTRA (MD)
  curY += 14;

  // Category Banner
  ctx.fillStyle = '#eff6ff';
  roundRect(ctx, padX, curY, logicalWidth - padX * 2, 24, 6);
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  roundRect(ctx, padX, curY, logicalWidth - padX * 2, 24, 6);
  ctx.stroke();

  ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#007DCC';
  ctx.textAlign = 'left';
  ctx.fillText("🏸 KATEGORI GANDA PUTRA (MEN'S DOUBLES - MD)", padX + 10, curY + 16);

  curY += 30;

  // Two columns for MD
  drawGroupTable(
    padX,
    curY,
    colWidth,
    'GRUP A (PUTRA)',
    '4 Pasangan',
    '#0f172a',
    mdStandingsA
  );

  drawGroupTable(
    padX + colWidth + 16,
    curY,
    colWidth,
    'GRUP B (PUTRA)',
    '4 Pasangan',
    '#0f172a',
    mdStandingsB
  );

  // Move Y past 4 rows of MD
  curY += 24 + 20 + 4 * 34 + 14;

  // 4. SECTION 2: GANDA PUTRI (WD)
  ctx.fillStyle = '#fff1f2';
  roundRect(ctx, padX, curY, logicalWidth - padX * 2, 24, 6);
  ctx.fill();
  ctx.strokeStyle = '#fecdd3';
  ctx.lineWidth = 1;
  roundRect(ctx, padX, curY, logicalWidth - padX * 2, 24, 6);
  ctx.stroke();

  ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#d10056';
  ctx.textAlign = 'left';
  ctx.fillText("🏸 KATEGORI GANDA PUTRI (WOMEN'S DOUBLES - WD)", padX + 10, curY + 16);

  curY += 30;

  // Two columns for WD
  drawGroupTable(
    padX,
    curY,
    colWidth,
    'GRUP A (PUTRI)',
    '3 Pasangan',
    '#d10056',
    wdStandingsA
  );

  drawGroupTable(
    padX + colWidth + 16,
    curY,
    colWidth,
    'GRUP B (PUTRI)',
    '3 Pasangan',
    '#d10056',
    wdStandingsB
  );

  // Move Y past 3 rows of WD
  curY += 24 + 20 + 3 * 34 + 14;

  // 5. FOOTER
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(logicalWidth - padX, curY);
  ctx.stroke();

  curY += 15;
  ctx.font = '500 9.5px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText(
    'Aturan Penentuan Peringkat: 1. Jumlah Kemenangan (M)  •  2. Selisih Poin (+/-) = Poin Masuk - Poin Lawan',
    padX,
    curY
  );

  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'right';
  ctx.fillText('Badminton Biro Advokasi Cup (Bravo Cup) 🏸', logicalWidth - padX, curY);

  // Convert to DataURL and Blob
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const blobPromise = new Promise<Blob | null>(res => {
    canvas.toBlob(b => res(b), 'image/png', 1.0);
  });

  return { dataUrl, blobPromise };
}
