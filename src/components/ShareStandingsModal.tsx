import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Download, Share2, Copy, Check, Sparkles, 
  AlertCircle, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Match, PlayerPair, StandingRow } from '../types';
import { calculateStandings } from '../utils/standings';

interface ShareStandingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: PlayerPair[];
  matches: Match[];
  tournamentName: string;
}

export const ShareStandingsModal: React.FC<ShareStandingsModalProps> = ({
  isOpen,
  onClose,
  teams,
  matches,
  tournamentName,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Standings Calculation
  const mdTeamsA = teams.filter(t => t.category === 'MD' && t.group === 'Grup A');
  const mdMatchesA = matches.filter(m => m.category === 'MD' && m.group === 'Grup A');
  const mdStandingsA = calculateStandings(mdTeamsA, mdMatchesA);

  const mdTeamsB = teams.filter(t => t.category === 'MD' && t.group === 'Grup B');
  const mdMatchesB = matches.filter(m => m.category === 'MD' && m.group === 'Grup B');
  const mdStandingsB = calculateStandings(mdTeamsB, mdMatchesB);

  const wdTeamsA = teams.filter(t => t.category === 'WD' && t.group === 'Grup A');
  const wdMatchesA = matches.filter(m => m.category === 'WD' && m.group === 'Grup A');
  const wdStandingsA = calculateStandings(wdTeamsA, wdMatchesA);

  const wdTeamsB = teams.filter(t => t.category === 'WD' && t.group === 'Grup B');
  const wdMatchesB = matches.filter(m => m.category === 'WD' && m.group === 'Grup B');
  const wdStandingsB = calculateStandings(wdTeamsB, wdMatchesB);

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentTimeStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Capture function using html2canvas
  const generatePngImage = async (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    if (!posterRef.current) return null;
    setIsGenerating(true);
    setInfoMessage(null);

    try {
      // Small pause to guarantee styles and images are fully rendered
      await new Promise(resolve => setTimeout(resolve, 150));

      const targetEl = posterRef.current;
      const fullWidth = 780;
      const fullHeight = targetEl.scrollHeight || targetEl.offsetHeight;

      const canvas = await html2canvas(targetEl, {
        scale: 2, // 2x high resolution retina
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 850,
        width: fullWidth,
        height: fullHeight,
        onclone: (_clonedDoc, clonedEl) => {
          clonedEl.style.width = `${fullWidth}px`;
          clonedEl.style.height = 'auto';
          clonedEl.style.maxHeight = 'none';
          clonedEl.style.overflow = 'visible';
          clonedEl.style.transform = 'none';
          clonedEl.style.boxSizing = 'border-box';
        },
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const blob = await new Promise<Blob | null>(res => {
        canvas.toBlob(b => res(b), 'image/png', 1.0);
      });

      setIsGenerating(false);

      if (blob && dataUrl) {
        setGeneratedImgUrl(dataUrl);
        setGeneratedBlob(blob);
        return { blob, dataUrl };
      }
      return null;
    } catch (err) {
      console.error('Failed to generate PNG image with html2canvas:', err);
      setIsGenerating(false);
      setInfoMessage('Gagal menghasilkan gambar PNG. Silakan coba lagi.');
      return null;
    }
  };

  // Auto-generate on open
  useEffect(() => {
    if (isOpen) {
      setGeneratedImgUrl(null);
      setGeneratedBlob(null);
      const timer = setTimeout(() => {
        generatePngImage();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, teams, matches]);

  if (!isOpen) return null;

  // Text summary for WA caption
  const buildAllStandingsText = () => {
    let text = `🏸 *KLASEMEN LENGKAP ${tournamentName.toUpperCase()}*\n`;
    text += `🗓️ _Update: ${currentDateStr}, ${currentTimeStr} WIB_\n`;
    text += `📌 *Sistem Skor Maksimal 30 Poin*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const formatGroup = (title: string, groupStandings: StandingRow[]) => {
      let grpText = `🏆 *${title}*\n`;
      grpText += `-------------------------------------\n`;
      groupStandings.forEach((row, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const diff = row.pointDiff > 0 ? `+${row.pointDiff}` : `${row.pointDiff}`;
        grpText += `${medal} *${row.team.name}*\n`;
        grpText += `   Main: ${row.played} | Menang: ${row.won} | Kalah: ${row.lost}\n`;
        grpText += `   Poin: ${row.pointsWon}-${row.pointsLost} | Selisih: *${diff}*\n`;
      });
      grpText += `\n`;
      return grpText;
    };

    text += formatGroup('GANDA PUTRA (MD) - GRUP A', mdStandingsA);
    text += formatGroup('GANDA PUTRA (MD) - GRUP B', mdStandingsB);
    text += formatGroup('GANDA PUTRI (WD) - GRUP A', wdStandingsA);
    text += formatGroup('GANDA PUTRI (WD) - GRUP B', wdStandingsB);

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `ℹ️ _Peringkat dihitung berdasarkan Kemenangan & Selisih Poin_\n`;
    text += `🏸 *Badminton Biro Advokasi Cup*`;
    return text;
  };

  // Download PNG file directly
  const handleDownloadPng = async () => {
    let dataUrl = generatedImgUrl;
    if (!dataUrl) {
      const res = await generatePngImage();
      dataUrl = res ? res.dataUrl : null;
    }
    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Klasemen-Lengkap-Bravo-Cup-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setInfoMessage('✅ Gambar PNG lengkap berhasil diunduh ke galeri/file!');
    }
  };

  // Share directly to WhatsApp
  const handleShareToWhatsApp = async () => {
    const textCaption = buildAllStandingsText();
    let blob = generatedBlob;
    let dataUrl = generatedImgUrl;

    if (!blob || !dataUrl) {
      const res = await generatePngImage();
      if (res) {
        blob = res.blob;
        dataUrl = res.dataUrl;
      }
    }

    if (!blob || !dataUrl) {
      setInfoMessage('Gagal menyiapkan gambar PNG.');
      return;
    }

    const fileName = `Klasemen-Lengkap-Bravo-Cup-${new Date().toISOString().slice(0, 10)}.png`;
    const imageFile = new File([blob], fileName, { type: 'image/png' });

    // Use Web Share API if supported on mobile (iOS Safari / Android Chrome)
    if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      try {
        await navigator.share({
          files: [imageFile],
          title: `Klasemen Lengkap ${tournamentName}`,
          text: `📊 Klasemen Lengkap ${tournamentName} (MD & WD)`,
        });
        setInfoMessage('Berhasil membuka menu share WhatsApp!');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error fallback:', err);
        }
      }
    }

    // Fallback for browsers that don't support file sharing (e.g. desktop):
    // 1. Download image automatically
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Open WhatsApp with formatted text
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textCaption)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setInfoMessage(
      '📥 Gambar PNG telah otomatis diunduh! Silakan tempelkan/lampirkan file gambar ke chat WhatsApp yang baru terbuka.'
    );
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildAllStandingsText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      setInfoMessage('Gagal menyalin teks ke clipboard.');
    }
  };

  // Render Table Rows with fixed styling
  const renderTableRows = (rows: StandingRow[]) => {
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-2.5 text-slate-400 text-xs italic">
            Belum ada pasangan terdaftar
          </td>
        </tr>
      );
    }

    return rows.map((r, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
      const diffFormatted = r.pointDiff > 0 ? `+${r.pointDiff}` : `${r.pointDiff}`;
      const isTop = i === 0;

      return (
        <tr
          key={r.team.id}
          className={`border-b border-slate-200 text-xs ${
            isTop ? 'bg-amber-50/60 font-semibold' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
          }`}
        >
          <td className="py-2 px-2 text-center font-bold text-slate-700">{medal}</td>
          <td className="py-2 px-2.5 font-bold text-slate-900 truncate max-w-[150px]">
            <div>{r.team.name}</div>
            <div className="text-[10px] text-slate-500 font-normal truncate">
              {r.team.player1} & {r.team.player2}
            </div>
          </td>
          <td className="py-2 px-2 text-center text-slate-600 font-medium">{r.played}</td>
          <td className="py-2 px-2 text-center font-bold text-emerald-700">{r.won}</td>
          <td className="py-2 px-2 text-center font-bold text-rose-700">{r.lost}</td>
          <td className="py-2 px-2 text-center text-slate-600 text-[11px] font-medium">
            {r.pointsWon}-{r.pointsLost}
          </td>
          <td className="py-2 px-2 text-center font-black text-xs">
            <span
              className={
                r.pointDiff > 0
                  ? 'text-emerald-700'
                  : r.pointDiff < 0
                  ? 'text-rose-700'
                  : 'text-slate-500'
              }
            >
              {diffFormatted}
            </span>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 sm:p-6 my-auto max-h-[94vh] flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Bagikan Rekap Klasemen 1 Halaman (PNG)
                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                  WhatsApp Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Gambar lengkap tidak terpotong (Ganda Putra & Putri seluruh pool)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary WA Share Button */}
            <button
              onClick={handleShareToWhatsApp}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Share2 size={16} />
              <span>{isGenerating ? 'Menyiapkan Gambar...' : 'Kirim Gambar ke WhatsApp'}</span>
            </button>

            {/* Direct Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="px-3.5 py-2 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={15} />
              <span>Unduh PNG</span>
            </button>

            {/* Re-generate */}
            <button
              onClick={generatePngImage}
              disabled={isGenerating}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              title="Perbarui Gambar PNG"
            >
              <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
              <span>Perbarui</span>
            </button>

            {/* Copy Text Summary */}
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              {copySuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copySuccess ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>Format PNG Resolusi Penuh</span>
          </div>
        </div>

        {/* Feedback / Info Banner */}
        {infoMessage && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertCircle size={15} className="text-emerald-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
          {/* If image is already generated, show the true rendered PNG image */}
          {generatedImgUrl ? (
            <div className="w-full flex flex-col items-center">
              <div className="mb-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                <span>Hasil Preview PNG (Siap Kirim & Tidak Terpotong):</span>
              </div>
              <img
                src={generatedImgUrl}
                alt="Rekap Klasemen Lengkap"
                className="w-full max-w-[780px] rounded-2xl shadow-md border border-slate-300 bg-white"
              />
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center text-slate-400">
              <RefreshCw size={28} className="animate-spin text-[#007DCC] mb-3" />
              <p className="text-xs font-semibold text-slate-600">Menyusun dan merender gambar PNG resolusi penuh...</p>
              <p className="text-[11px] text-slate-400 mt-1">Harap tunggu sebentar.</p>
            </div>
          )}

          {/* HIDDEN FIXED-LAYOUT POSTER ELEMENT (Target of html2canvas) */}
          {/* Placed in an invisible container so it always has pure 780px width & unclipped layout on ALL devices */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: '-9999px',
              width: '780px',
              backgroundColor: '#ffffff',
              zIndex: -9999,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <div
              ref={posterRef}
              style={{
                width: '780px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '28px',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Poster Header */}
              <div className="border-b-2 border-slate-900 pb-3.5 mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🏸</span>
                    <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                      {tournamentName}
                    </h2>
                  </div>
                  <p className="text-xs font-bold text-[#007DCC] tracking-wide uppercase">
                    Rekap Klasemen Resmi Seluruh Pool • Sistem Skor Maksimal 30 Poin
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[10px] rounded-md tracking-wider">
                    UPDATE RESMI
                  </span>
                  <p className="text-[11px] font-semibold text-slate-700 mt-1">
                    {currentDateStr}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pukul {currentTimeStr} WIB
                  </p>
                </div>
              </div>

              {/* SECTION 1: GANDA PUTRA (MENS DOUBLES - MD) */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                  <span className="text-sm">🏸</span>
                  <h3 className="text-xs font-black text-[#007DCC] uppercase tracking-wider">
                    Kategori Ganda Putra (Men&apos;s Doubles - MD)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* MD GRUP A */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between">
                      <span className="font-extrabold text-[11px] tracking-wide">GRUP A (PUTRA)</span>
                      <span className="text-[10px] font-medium text-slate-300">4 Pasangan</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black text-slate-600 uppercase border-b border-slate-200">
                          <th className="py-1 px-2 text-center w-8">#</th>
                          <th className="py-1 px-2.5">Pasangan</th>
                          <th className="py-1 px-2 text-center w-8">MN</th>
                          <th className="py-1 px-2 text-center w-8 text-emerald-700">M</th>
                          <th className="py-1 px-2 text-center w-8 text-rose-700">K</th>
                          <th className="py-1 px-2 text-center w-14">Poin</th>
                          <th className="py-1 px-2 text-center w-12 font-black">+/-</th>
                        </tr>
                      </thead>
                      <tbody>{renderTableRows(mdStandingsA)}</tbody>
                    </table>
                  </div>

                  {/* MD GRUP B */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between">
                      <span className="font-extrabold text-[11px] tracking-wide">GRUP B (PUTRA)</span>
                      <span className="text-[10px] font-medium text-slate-300">4 Pasangan</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black text-slate-600 uppercase border-b border-slate-200">
                          <th className="py-1 px-2 text-center w-8">#</th>
                          <th className="py-1 px-2.5">Pasangan</th>
                          <th className="py-1 px-2 text-center w-8">MN</th>
                          <th className="py-1 px-2 text-center w-8 text-emerald-700">M</th>
                          <th className="py-1 px-2 text-center w-8 text-rose-700">K</th>
                          <th className="py-1 px-2 text-center w-14">Poin</th>
                          <th className="py-1 px-2 text-center w-12 font-black">+/-</th>
                        </tr>
                      </thead>
                      <tbody>{renderTableRows(mdStandingsB)}</tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECTION 2: GANDA PUTRI (WOMENS DOUBLES - WD) */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <span className="text-sm">🏸</span>
                  <h3 className="text-xs font-black text-[#D10056] uppercase tracking-wider">
                    Kategori Ganda Putri (Women&apos;s Doubles - WD)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* WD GRUP A */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-[#D10056] text-white px-3 py-1.5 flex items-center justify-between">
                      <span className="font-extrabold text-[11px] tracking-wide">GRUP A (PUTRI)</span>
                      <span className="text-[10px] font-medium text-rose-100">3 Pasangan</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black text-slate-600 uppercase border-b border-slate-200">
                          <th className="py-1 px-2 text-center w-8">#</th>
                          <th className="py-1 px-2.5">Pasangan</th>
                          <th className="py-1 px-2 text-center w-8">MN</th>
                          <th className="py-1 px-2 text-center w-8 text-emerald-700">M</th>
                          <th className="py-1 px-2 text-center w-8 text-rose-700">K</th>
                          <th className="py-1 px-2 text-center w-14">Poin</th>
                          <th className="py-1 px-2 text-center w-12 font-black">+/-</th>
                        </tr>
                      </thead>
                      <tbody>{renderTableRows(wdStandingsA)}</tbody>
                    </table>
                  </div>

                  {/* WD GRUP B */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-[#D10056] text-white px-3 py-1.5 flex items-center justify-between">
                      <span className="font-extrabold text-[11px] tracking-wide">GRUP B (PUTRI)</span>
                      <span className="text-[10px] font-medium text-rose-100">3 Pasangan</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-[10px] font-black text-slate-600 uppercase border-b border-slate-200">
                          <th className="py-1 px-2 text-center w-8">#</th>
                          <th className="py-1 px-2.5">Pasangan</th>
                          <th className="py-1 px-2 text-center w-8">MN</th>
                          <th className="py-1 px-2 text-center w-8 text-emerald-700">M</th>
                          <th className="py-1 px-2 text-center w-8 text-rose-700">K</th>
                          <th className="py-1 px-2 text-center w-14">Poin</th>
                          <th className="py-1 px-2 text-center w-12 font-black">+/-</th>
                        </tr>
                      </thead>
                      <tbody>{renderTableRows(wdStandingsB)}</tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Poster Footer */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <p>
                  <strong>Aturan Penentuan Peringkat:</strong> 1. Jumlah Kemenangan (M) • 2. Selisih Poin (+/-) = Poin Masuk - Poin Lawan.
                </p>
                <p className="font-bold text-slate-700">
                  Badminton Biro Advokasi Cup (Bravo Cup) 🏸
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            💡 <em>Pilih <strong>&quot;Kirim Gambar ke WhatsApp&quot;</strong> atau <strong>&quot;Unduh PNG&quot;</strong> untuk menyimpan gambar rekap.</em>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
