import React, { useState, useEffect, useTransition } from 'react';
import { 
  X, Download, Share2, Copy, Check, Sparkles, 
  AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { Match, PlayerPair, StandingRow } from '../types';
import { calculateStandings } from '../utils/standings';
import { generateStandingsCanvasPoster } from '../utils/canvasPoster';

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
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  // Fast Instant Render via HTML5 Direct Canvas 2D
  const renderPosterInstantly = () => {
    try {
      const { dataUrl, blobPromise } = generateStandingsCanvasPoster({
        tournamentName,
        currentDateStr,
        currentTimeStr,
        mdStandingsA,
        mdStandingsB,
        wdStandingsA,
        wdStandingsB,
      });

      setGeneratedImgUrl(dataUrl);

      blobPromise.then(blob => {
        if (blob) setGeneratedBlob(blob);
      });
    } catch (err) {
      console.error('Fast render failed:', err);
      setInfoMessage('Gagal merender gambar.');
    }
  };

  // Instant render upon modal opening
  useEffect(() => {
    if (isOpen) {
      renderPosterInstantly();
    }
  }, [isOpen, teams, matches]);

  if (!isOpen) return null;

  // Build Text Summary for WA
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
    if (!generatedImgUrl) {
      renderPosterInstantly();
    }
    if (generatedImgUrl) {
      const a = document.createElement('a');
      a.href = generatedImgUrl;
      a.download = `Klasemen-Lengkap-Bravo-Cup-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setInfoMessage('✅ Gambar PNG resolusi tinggi berhasil diunduh!');
    }
  };

  // Share directly to WhatsApp
  const handleShareToWhatsApp = async () => {
    let blob = generatedBlob;
    let dataUrl = generatedImgUrl;

    if (!blob || !dataUrl) {
      renderPosterInstantly();
      return;
    }

    const textCaption = buildAllStandingsText();
    const fileName = `Klasemen-Lengkap-Bravo-Cup-${new Date().toISOString().slice(0, 10)}.png`;
    const imageFile = new File([blob], fileName, { type: 'image/png' });

    // Use Web Share API on mobile (iOS / Android)
    if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      try {
        await navigator.share({
          files: [imageFile],
          title: `Klasemen Lengkap ${tournamentName}`,
          text: `📊 Klasemen Lengkap ${tournamentName} (MD & WD)`,
        });
        setInfoMessage('Berhasil membuka menu bagikan WhatsApp!');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share sheet dismissed or fallback:', err);
        }
      }
    }

    // Fallback: auto download + open WhatsApp web/app
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textCaption)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setInfoMessage(
      '📥 Gambar PNG telah otomatis diunduh! Silakan tempelkan file gambar ke chat WhatsApp yang terbuka.'
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
                Bagikan Rekap Klasemen
              </h3>
              <p className="text-xs text-slate-500">
                Format gambar 1 halaman penuh (Ganda Putra &amp; Ganda Putri semua pool)
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
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={16} />
              <span>Kirim Gambar ke WhatsApp</span>
            </button>

            {/* Direct Download PNG Button */}
            <button
              onClick={handleDownloadPng}
              className="px-3.5 py-2 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} />
              <span>Unduh PNG</span>
            </button>

            {/* Re-generate */}
            <button
              onClick={renderPosterInstantly}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Perbarui Gambar PNG"
            >
              <RefreshCw size={14} />
              <span>Segarkan</span>
            </button>

            {/* Copy Text Summary */}
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              {copySuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copySuccess ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>Resolusi Tinggi HD • Ringan &amp; Cepat</span>
          </div>
        </div>

        {/* Feedback / Info Banner */}
        {infoMessage && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertCircle size={15} className="text-emerald-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-start">
          {generatedImgUrl ? (
            <div className="w-full flex flex-col items-center">
              <div className="mb-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                <span>Pratinjau Gambar PNG (Siap Kirim ke WhatsApp):</span>
              </div>
              <img
                src={generatedImgUrl}
                alt="Rekap Klasemen Lengkap"
                className="w-full max-w-[820px] rounded-2xl shadow-md border border-slate-300 bg-white"
              />
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center text-slate-400">
              <RefreshCw size={28} className="animate-spin text-[#007DCC] mb-3" />
              <p className="text-xs font-semibold text-slate-600">Menyusun gambar...</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            💡 <em>Pilih <strong>&quot;Kirim Gambar ke WhatsApp&quot;</strong> untuk mengirim rekap gambar langsung.</em>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
