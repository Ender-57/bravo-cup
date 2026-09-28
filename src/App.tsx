/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, History, Play, Users, Lock, Unlock, 
  Share2, Plus, Sparkles, AlertCircle
} from 'lucide-react';
import { Category, Match, PlayerPair, AppSettings } from './types';
import { 
  loadTeams, saveTeams, loadMatches, saveMatches, 
  loadSettings, saveSettings, resetAllData 
} from './utils/storage';
import { 
  subscribeToSettings, 
  subscribeToTeams, 
  subscribeToMatches, 
  seedFirestoreIfEmpty, 
  saveMatchToFirestore, 
  deleteMatchFromFirestore, 
  saveTeamToFirestore, 
  saveTeamsToFirestore, 
  deleteTeamFromFirestore, 
  saveSettingsToFirestore, 
  resetFirestoreToDefaults 
} from './utils/firestoreService';
import { Navbar } from './components/Navbar';
import { AdminPinModal } from './components/AdminPinModal';
import { TeamManagerModal } from './components/TeamManagerModal';
import { ScorekeeperModal } from './components/ScorekeeperModal';
import { CreateMatchModal } from './components/CreateMatchModal';
import { StandingsTable } from './components/StandingsTable';
import { MatchSchedule } from './components/MatchSchedule';
import { MatchHistory } from './components/MatchHistory';
import { ShareStandingsModal } from './components/ShareStandingsModal';

export default function App() {
  // App State
  const [teams, setTeams] = useState<PlayerPair[]>(() => loadTeams());
  const [matches, setMatches] = useState<Match[]>(() => loadMatches());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  
  // Navigation & Category
  const [currentCategory, setCurrentCategory] = useState<Category>('MD');
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings' | 'history'>('schedule');

  // Admin Auth State (Persist in sessionStorage)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('badminton_admin_logged') === 'true';
  });

  // Modals
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState<boolean>(false);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState<boolean>(false);
  const [isShareStandingsOpen, setIsShareStandingsOpen] = useState<boolean>(false);
  const [activeScorekeeperMatch, setActiveScorekeeperMatch] = useState<Match | null>(null);

  // In-App Toast (Replaces window.alert)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Initial Firestore synchronization and real-time listeners
  useEffect(() => {
    seedFirestoreIfEmpty();

    const unsubSettings = subscribeToSettings((s) => {
      setSettings(s);
      saveSettings(s);
    });

    const unsubTeams = subscribeToTeams((t) => {
      setTeams(t);
      saveTeams(t);
    });

    const unsubMatches = subscribeToMatches((m) => {
      setMatches(m);
      saveMatches(m);
    });

    return () => {
      unsubSettings();
      unsubTeams();
      unsubMatches();
    };
  }, []);

  // Auto-Save whenever teams, matches, or settings change locally
  useEffect(() => {
    saveTeams(teams);
  }, [teams]);

  useEffect(() => {
    saveMatches(matches);
  }, [matches]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Keep active scorekeeper match in sync with matches state
  useEffect(() => {
    if (activeScorekeeperMatch) {
      const fresh = matches.find(m => m.id === activeScorekeeperMatch.id);
      if (fresh) {
        setActiveScorekeeperMatch(fresh);
      }
    }
  }, [matches]);

  // Admin Handlers
  const handleAdminLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('badminton_admin_logged', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('badminton_admin_logged');
  };

  const handleUpdatePin = (newPin: string) => {
    const updated = { ...settings, adminPin: newPin };
    setSettings(updated);
    saveSettingsToFirestore(updated);
  };

  // Team Handlers
  const handleSaveTeam = (team: PlayerPair) => {
    setTeams(prev => {
      const exists = prev.some(t => t.id === team.id);
      if (exists) {
        return prev.map(t => t.id === team.id ? team : t);
      }
      return [...prev, team];
    });
    saveTeamToFirestore(team);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setMatches(prev => prev.filter(m => m.teamAId !== teamId && m.teamBId !== teamId));
    deleteTeamFromFirestore(teamId);
  };

  // Match Handlers
  const handleAddMatch = (newMatch: Match) => {
    setMatches(prev => [newMatch, ...prev]);
    saveMatchToFirestore(newMatch);
    if (newMatch.status === 'live') {
      setActiveScorekeeperMatch(newMatch);
    }
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    saveMatchToFirestore(updatedMatch);
    setActiveScorekeeperMatch(updatedMatch);
    showToast(`Pertandingan ${updatedMatch.code} berhasil diperbarui!`, 'success');
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    deleteMatchFromFirestore(matchId);
    if (activeScorekeeperMatch?.id === matchId) {
      setActiveScorekeeperMatch(null);
    }
  };

  const handleStartMatch = (match: Match) => {
    const started: Match = {
      ...match,
      status: 'live',
      startedAt: match.startedAt || Date.now(),
    };
    handleUpdateMatch(started);
    setActiveScorekeeperMatch(started);
  };

  // Round-Robin Match Generator for a Group
  const handleGenerateRoundRobin = (groupName: string, cat: Category) => {
    const groupTeams = teams.filter(t => t.category === cat && t.group === groupName);
    if (groupTeams.length < 2) {
      showToast(`Minimal butuh 2 tim di ${groupName} untuk membuat jadwal round-robin.`, 'error');
      return;
    }

    const newMatches: Match[] = [];
    let matchCounter = 1;

    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const team1 = groupTeams[i];
        const team2 = groupTeams[j];

        const exists = matches.some(
          m => m.category === cat && m.group === groupName &&
          ((m.teamAId === team1.id && m.teamBId === team2.id) ||
           (m.teamAId === team2.id && m.teamBId === team1.id))
        );

        if (!exists) {
          const courtNumber = (matchCounter % 2 === 1) ? 'Lapangan 1' : 'Lapangan 2';
          newMatches.push({
            id: `match-rr-${Date.now()}-${i}-${j}`,
            code: `${cat}-${groupName.replace(/\s+/g, '').slice(-1)}${String(matchCounter).padStart(2, '0')}`,
            category: cat,
            group: groupName,
            teamAId: team1.id,
            teamBId: team2.id,
            court: courtNumber,
            status: 'scheduled',
            currentSet: 0,
            sets: [
              { scoreA: 0, scoreB: 0, completed: false },
            ],
            maxPoints: 30, // 30 points max
            servingTeam: 'A',
            history: [],
          });
          matchCounter++;
        }
      }
    }

    if (newMatches.length === 0) {
      showToast(`Semua kombinasi pertandingan di ${groupName} sudah ada!`, 'info');
      return;
    }

    setMatches(prev => [...newMatches, ...prev]);
    newMatches.forEach(m => saveMatchToFirestore(m));
    showToast(`Berhasil membuat ${newMatches.length} pertandingan baru (Skor 30 Poin) untuk ${groupName}!`, 'success');
  };

  // Reset to initial demo data
  const handleResetData = () => {
    resetAllData();
    resetFirestoreToDefaults();
    setTeams(loadTeams());
    setMatches(loadMatches());
    setSettings(loadSettings());
    setActiveScorekeeperMatch(null);
    showToast('Data turnamen berhasil direset ke bawaan.', 'info');
  };

  // Export JSON backup
  const handleExportData = () => {
    const data = {
      teams,
      matches,
      settings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badminton_turnamen_30pt_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File backup turnamen berhasil diunduh.', 'success');
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.teams && parsed.matches) {
          setTeams(parsed.teams);
          setMatches(parsed.matches);
          if (parsed.settings) setSettings(parsed.settings);
          saveTeamsToFirestore(parsed.teams);
          parsed.matches.forEach((m: Match) => saveMatchToFirestore(m));
          if (parsed.settings) saveSettingsToFirestore(parsed.settings);
          showToast('Data turnamen berhasil dipulihkan!', 'success');
        } else {
          showToast('Format file cadangan JSON tidak valid.', 'error');
        }
      } catch {
        showToast('Gagal membaca file JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Current active teams for scorekeeper modal
  const teamAForModal = activeScorekeeperMatch
    ? teams.find(t => t.id === activeScorekeeperMatch.teamAId)
    : null;
  const teamBForModal = activeScorekeeperMatch
    ? teams.find(t => t.id === activeScorekeeperMatch.teamBId)
    : null;

  // Active Category Teams
  const categoryTeams = teams.filter(t => t.category === currentCategory);
  const categoryMatches = matches.filter(m => m.category === currentCategory);
  const liveCount = categoryMatches.filter(m => m.status === 'live').length;
  const finishedCount = categoryMatches.filter(m => m.status === 'finished').length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        isAdmin={isAdmin}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onOpenTeamManager={() => setIsTeamManagerOpen(true)}
        tournamentName={settings.tournamentName}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Banner & Stats Bar (Putra & Putri) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏸 🏆</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Turnamen Badminton Ganda Putra & Putri
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sistem Skor Maksimal <strong className="text-[#007DCC]">30 Poin</strong> • Klasemen Lengkap Putra & Putri dalam 1 Halaman
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-blue-50/80 px-3.5 py-2 rounded-2xl border border-blue-200 text-center min-w-[70px]">
              <p className="text-[10px] uppercase font-bold text-[#007DCC]">Tim Putra</p>
              <p className="text-lg font-black text-slate-900 leading-none mt-1">
                {teams.filter(t => t.category === 'MD').length}
              </p>
            </div>

            <div className="bg-rose-50/80 px-3.5 py-2 rounded-2xl border border-rose-200 text-center min-w-[70px]">
              <p className="text-[10px] uppercase font-bold text-[#D10056]">Tim Putri</p>
              <p className="text-lg font-black text-slate-900 leading-none mt-1">
                {teams.filter(t => t.category === 'WD').length}
              </p>
            </div>

            <div className="bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200 text-center min-w-[70px]">
              <p className="text-[10px] uppercase font-bold text-[#B2054C]">Live Skor</p>
              <p className="text-lg font-black text-[#D10056] leading-none mt-1">{liveCount}</p>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-center min-w-[70px]">
              <p className="text-[10px] uppercase font-bold text-slate-600">Selesai</p>
              <p className="text-lg font-black text-slate-900 leading-none mt-1">{finishedCount}</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsCreateMatchOpen(true)}
                className="px-4 py-2.5 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xs font-black rounded-2xl transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Buat Laga Baru</span>
              </button>
            )}

            <button
              onClick={() => setIsTeamManagerOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <Users size={15} className="text-[#007DCC]" />
              <span>Kelola Pasangan</span>
            </button>
          </div>
        </div>

        {/* Quick Anchor Navigation Strip */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setIsShareStandingsOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white shadow-xs transition flex items-center gap-1.5 shrink-0"
            title="Bagikan gambar PNG seluruh klasemen MD & WD dalam 1 halaman ke WhatsApp"
          >
            <Share2 size={14} />
            <span>📸 Share Semua Klasemen (PNG WA)</span>
          </button>
          <a
            href="#klasemen-putra"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:text-[#007DCC] shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Trophy size={14} className="text-[#007DCC]" />
            <span>1. Klasemen Ganda Putra</span>
          </a>
          <a
            href="#klasemen-putri"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:text-[#D10056] shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Trophy size={14} className="text-[#D10056]" />
            <span>2. Klasemen Ganda Putri</span>
          </a>
          <a
            href="#jadwal-pertandingan"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:text-[#007DCC] shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Play size={14} className="text-[#007DCC]" />
            <span>3. Jadwal & Skor Langsung</span>
            {liveCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D10056] animate-pulse"></span>
            )}
          </a>
          <a
            href="#riwayat-pertandingan"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:text-[#007DCC] shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <History size={14} className="text-[#007DCC]" />
            <span>4. Riwayat Pertandingan ({finishedCount})</span>
          </a>
        </div>

        {/* 1. SECTION: TABEL PERINGKAT PALING ATAS - GANDA PUTRA */}
        <section id="klasemen-putra" className="scroll-mt-24 space-y-2">
          <StandingsTable
            teams={teams}
            matches={matches}
            category="MD"
            tournamentName={settings.tournamentName}
            onOpenShareAllStandings={() => setIsShareStandingsOpen(true)}
          />
        </section>

        {/* 2. SECTION: TABEL PERINGKAT BAWAHNYA - GANDA PUTRI */}
        <section id="klasemen-putri" className="scroll-mt-24 space-y-2">
          <StandingsTable
            teams={teams}
            matches={matches}
            category="WD"
            tournamentName={settings.tournamentName}
            onOpenShareAllStandings={() => setIsShareStandingsOpen(true)}
          />
        </section>

        {/* 3. SECTION: JADWAL & LIVE SCORE */}
        <section id="jadwal-pertandingan" className="scroll-mt-24">
          <MatchSchedule
            matches={matches}
            teams={teams}
            category="ALL"
            onOpenScorekeeper={m => setActiveScorekeeperMatch(m)}
            onStartMatch={handleStartMatch}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            isAdmin={isAdmin}
            onOpenCreateMatch={() => setIsCreateMatchOpen(true)}
          />
        </section>

        {/* 4. SECTION: RIWAYAT PERTANDINGAN */}
        <section id="riwayat-pertandingan" className="scroll-mt-24">
          <MatchHistory
            matches={matches}
            teams={teams}
            category={currentCategory}
            tournamentName={settings.tournamentName}
            onOpenMatch={m => setActiveScorekeeperMatch(m)}
            onDeleteMatch={handleDeleteMatch}
            onUpdateMatch={handleUpdateMatch}
            isAdmin={isAdmin}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Badminton Biro Advokasi Cup • Sistem Skor Maksimal 30 Poin & Klasemen Selisih Poin</p>
          <p className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
            <span>Tersimpan otomatis • Share cepat WhatsApp</span> 🏸
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Admin PIN Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={handleAdminLogin}
        onLogout={handleAdminLogout}
        currentPin={settings.adminPin}
        onUpdatePin={handleUpdatePin}
      />

      {/* 2. Team Manager Modal */}
      <TeamManagerModal
        isOpen={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
        teams={teams}
        onSaveTeam={handleSaveTeam}
        onDeleteTeam={handleDeleteTeam}
        initialCategory={currentCategory}
      />

      {/* 3. Create Match Modal */}
      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        teams={teams}
        category={currentCategory}
        onAddMatch={handleAddMatch}
        onGenerateRoundRobin={handleGenerateRoundRobin}
      />

      {/* 4. Scorekeeper Modal */}
      {activeScorekeeperMatch && teamAForModal && teamBForModal && (
        <ScorekeeperModal
          isOpen={true}
          onClose={() => setActiveScorekeeperMatch(null)}
          match={activeScorekeeperMatch}
          teamA={teamAForModal}
          teamB={teamBForModal}
          tournamentName={settings.tournamentName}
          onUpdateMatch={handleUpdateMatch}
          isAdmin={isAdmin}
        />
      )}

      {/* 5. Share All Standings PNG to WhatsApp Modal */}
      <ShareStandingsModal
        isOpen={isShareStandingsOpen}
        onClose={() => setIsShareStandingsOpen(false)}
        teams={teams}
        matches={matches}
        tournamentName={settings.tournamentName}
      />

      {/* Floating In-App Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 text-white ${
            toast.type === 'error'
              ? 'bg-[#D10056] border-rose-300'
              : toast.type === 'info'
              ? 'bg-[#007DCC] border-blue-300'
              : 'bg-emerald-600 border-emerald-400'
          }`}>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
