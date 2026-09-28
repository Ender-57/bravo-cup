import React, { useState } from 'react';
import { 
  Trophy, Lock, Unlock, Users, Settings, 
  RotateCcw, Download, Upload, Shield, Calendar, History
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenPinModal: () => void;
  onOpenTeamManager: () => void;
  tournamentName: string;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScrollToSection?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenPinModal,
  onOpenTeamManager,
  tournamentName,
  onResetData,
  onExportData,
  onImportData,
  onScrollToSection,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleScroll = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Tournament Name */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#007DCC] to-[#0098f7] text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <span className="text-xl">🏸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Badminton Biro Advokasi Cup
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px] sm:max-w-none">
                {tournamentName}
              </p>
            </div>
          </div>

          {/* Mobile Admin PIN shortcut */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={onOpenPinModal}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-amber-100 text-[#B2054C] border border-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isAdmin ? <Unlock size={15} /> : <Lock size={15} />}
              <span>{isAdmin ? 'Admin' : 'PIN'}</span>
            </button>
          </div>
        </div>

        {/* Quick Section Anchors for 1-Page Navigation */}
        <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-2xl w-full sm:w-auto justify-center overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleScroll('klasemen-putra')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#007DCC] hover:bg-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <Trophy size={13} className="text-[#007DCC]" />
            <span>Peringkat Putra</span>
          </button>
          <button
            onClick={() => handleScroll('klasemen-putri')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#D10056] hover:bg-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <Trophy size={13} className="text-[#D10056]" />
            <span>Peringkat Putri</span>
          </button>
          <button
            onClick={() => handleScroll('jadwal-pertandingan')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#007DCC] hover:bg-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <Calendar size={13} className="text-[#007DCC]" />
            <span>Jadwal</span>
          </button>
          <button
            onClick={() => handleScroll('riwayat-pertandingan')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#007DCC] hover:bg-white transition-all flex items-center gap-1.5 shrink-0"
          >
            <History size={13} className="text-[#007DCC]" />
            <span>Riwayat</span>
          </button>
        </div>

        {/* Action Controls & Admin Authentication */}
        <div className="hidden md:flex items-center gap-2">
          {/* Kelola Pemain - Admin only */}
          {isAdmin && (
            <button
              onClick={onOpenTeamManager}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200"
            >
              <Users size={14} className="text-[#007DCC]" />
              <span>Kelola Tim</span>
            </button>
          )}

          {/* Admin Login / Logout Badge */}
          <button
            onClick={onOpenPinModal}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              isAdmin
                ? 'bg-amber-100 text-[#B2054C] border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
            <span>{isAdmin ? 'Mode Wasit / Admin' : 'Admin PIN'}</span>
          </button>

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              title="Pengaturan Turnamen & Backup"
            >
              <Settings size={18} />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs text-slate-700">
                <div className="px-3 py-2 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Menu Data Cadangan
                </div>

                <button
                  onClick={() => {
                    onExportData();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <Download size={14} className="text-[#007DCC]" />
                  <span>Unduh Cadangan (Backup JSON)</span>
                </button>

                <label className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer">
                  <Upload size={14} className="text-[#007DCC]" />
                  <span>Pulihkan Data (Import JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={e => {
                      onImportData(e);
                      setShowSettingsMenu(false);
                    }}
                    className="hidden"
                  />
                </label>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#D10056] hover:bg-rose-50 flex items-center gap-2 transition font-medium"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Data ke Awal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IN-APP RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#D10056] mx-auto flex items-center justify-center mb-3">
              <RotateCcw size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Reset Semua Data?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Semua pertandingan dan perubahan tim akan dikembalikan ke data awal sistem 30 poin.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 px-3 bg-[#D10056] hover:bg-[#b2054c] active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
