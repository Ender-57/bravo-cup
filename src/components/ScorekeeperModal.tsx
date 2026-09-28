import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, RotateCcw, ArrowLeftRight, Trophy, Share2, 
  Volume2, VolumeX, CheckCircle, Flag, Clock
} from 'lucide-react';
import { Match, MatchStatus, PlayerPair } from '../types';
import { sound } from '../utils/sound';
import { formatMatchScoreForWA, openWhatsAppShare } from '../utils/whatsapp';
import { CourtView } from './CourtView';

interface ScorekeeperModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  teamA: PlayerPair;
  teamB: PlayerPair;
  tournamentName: string;
  onUpdateMatch: (updatedMatch: Match) => void;
  isAdmin: boolean;
}

export const ScorekeeperModal: React.FC<ScorekeeperModalProps> = ({
  isOpen,
  onClose,
  match,
  teamA,
  teamB,
  tournamentName,
  onUpdateMatch,
  isAdmin,
}) => {
  const [soundMuted, setSoundMuted] = useState(!sound.enabled);
  const [courtSwapped, setCourtSwapped] = useState(match.courtSwapped || false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  if (!isOpen) return null;

  const currentSetIdx = match.currentSet || 0;
  const currentSet = match.sets[currentSetIdx] || { scoreA: 0, scoreB: 0, completed: false };
  const scoreA = currentSet.scoreA;
  const scoreB = currentSet.scoreB;
  const max = match.maxPoints || 30; // Max 30 points

  // Calculate sets won
  let setsWonA = 0;
  let setsWonB = 0;
  match.sets.forEach(s => {
    if (s.completed) {
      if (s.scoreA > s.scoreB) setsWonA++;
      else if (s.scoreB > s.scoreA) setsWonB++;
    }
  });

  // 30-point alerts: Match Point at 29 (or max - 1)
  const isMatchPointA = scoreA === max - 1;
  const isMatchPointB = scoreB === max - 1;
  const isInterval = (scoreA === 15 || scoreB === 15) && Math.abs(scoreA - scoreB) >= 0;

  // Toggle audio
  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundMuted(!sound.enabled);
  };

  // Check if set is won in 30 points system
  const checkSetWon = (newScoreA: number, newScoreB: number): 'A' | 'B' | null => {
    if (newScoreA >= max) return 'A';
    if (newScoreB >= max) return 'B';
    return null;
  };

  // Add Point
  const handleAddPoint = (team: 'A' | 'B') => {
    if (!isAdmin || match.status === 'finished') return;

    sound.playPointBeep();

    const nextScoreA = team === 'A' ? scoreA + 1 : scoreA;
    const nextScoreB = team === 'B' ? scoreB + 1 : scoreB;

    const winnerOfSet = checkSetWon(nextScoreA, nextScoreB);

    const updatedSets = [...match.sets];
    let nextCurrentSet = currentSetIdx;
    let nextStatus: MatchStatus = match.status;
    let winnerTeamId = match.winnerTeamId;
    let finishedAt = match.finishedAt;

    if (winnerOfSet) {
      sound.playWhistle();
      updatedSets[currentSetIdx] = {
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        completed: true,
        winner: winnerOfSet,
      };

      const currentSetsWonA = setsWonA + (winnerOfSet === 'A' ? 1 : 0);
      const currentSetsWonB = setsWonB + (winnerOfSet === 'B' ? 1 : 0);
      const requiredSetsToWin = Math.ceil(match.sets.length / 2);

      if (currentSetsWonA >= requiredSetsToWin) {
        nextStatus = 'finished';
        winnerTeamId = teamA.id;
        finishedAt = Date.now();
        sound.playVictory();
        triggerConfetti();
      } else if (currentSetsWonB >= requiredSetsToWin) {
        nextStatus = 'finished';
        winnerTeamId = teamB.id;
        finishedAt = Date.now();
        sound.playVictory();
        triggerConfetti();
      } else {
        nextCurrentSet = Math.min(currentSetIdx + 1, match.sets.length - 1);
        setCourtSwapped(prev => !prev);
      }
    } else {
      updatedSets[currentSetIdx] = {
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        completed: false,
      };

      if (nextScoreA === max - 1 || nextScoreB === max - 1) {
        sound.playGamePointChime();
      }
    }

    const historyItem = {
      timestamp: Date.now(),
      action: `Poin ${team === 'A' ? teamA.name : teamB.name} (${nextScoreA}-${nextScoreB})`,
      setIndex: currentSetIdx,
      scoreA: nextScoreA,
      scoreB: nextScoreB,
      servingTeam: team,
    };

    onUpdateMatch({
      ...match,
      status: nextStatus === 'scheduled' ? 'live' : nextStatus,
      startedAt: match.startedAt || Date.now(),
      finishedAt,
      currentSet: nextCurrentSet,
      sets: updatedSets,
      servingTeam: team,
      winnerTeamId,
      courtSwapped,
      history: [historyItem, ...match.history],
    });
  };

  // Undo Last Action
  const handleUndo = () => {
    if (!isAdmin || match.history.length === 0) return;
    sound.playUndo();

    const previousHistory = [...match.history];
    previousHistory.shift();

    if (previousHistory.length === 0) {
      const resetSets = match.sets.map(() => ({ scoreA: 0, scoreB: 0, completed: false }));
      onUpdateMatch({
        ...match,
        currentSet: 0,
        sets: resetSets,
        status: 'live',
        winnerTeamId: undefined,
        finishedAt: undefined,
        history: [],
      });
      return;
    }

    const last = previousHistory[0];
    const targetSetIdx = last.setIndex;
    const restoredSets = match.sets.map((s, idx) => {
      if (idx === targetSetIdx) {
        return {
          scoreA: last.scoreA,
          scoreB: last.scoreB,
          completed: false,
        };
      }
      if (idx > targetSetIdx) {
        return { scoreA: 0, scoreB: 0, completed: false };
      }
      return s;
    });

    onUpdateMatch({
      ...match,
      currentSet: targetSetIdx,
      sets: restoredSets,
      servingTeam: last.servingTeam || 'A',
      status: 'live',
      winnerTeamId: undefined,
      finishedAt: undefined,
      history: previousHistory,
    });
  };

  // Swap Serve
  const handleToggleServe = () => {
    if (!isAdmin || match.status === 'finished') return;
    const nextServe = match.servingTeam === 'A' ? 'B' : 'A';
    onUpdateMatch({
      ...match,
      servingTeam: nextServe,
    });
  };

  // Swap Court
  const handleSwapCourt = () => {
    const next = !courtSwapped;
    setCourtSwapped(next);
    onUpdateMatch({
      ...match,
      courtSwapped: next,
    });
  };

  // Force Finish Match
  const handleForceFinish = (winnerSide: 'A' | 'B') => {
    if (!isAdmin) return;
    const winnerId = winnerSide === 'A' ? teamA.id : teamB.id;
    const updatedSets = [...match.sets];
    updatedSets[currentSetIdx] = {
      ...updatedSets[currentSetIdx],
      completed: true,
      winner: winnerSide,
    };
    sound.playVictory();
    triggerConfetti();

    onUpdateMatch({
      ...match,
      status: 'finished',
      winnerTeamId: winnerId,
      finishedAt: Date.now(),
      sets: updatedSets,
    });
    setConfirmFinish(false);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  const handleShareWA = () => {
    const waText = formatMatchScoreForWA(match, teamA, teamB, tournamentName);
    openWhatsAppShare(waText);
  };

  const isLeftTeamA = !courtSwapped;
  const leftTeam = isLeftTeamA ? teamA : teamB;
  const rightTeam = isLeftTeamA ? teamB : teamA;
  const leftScore = isLeftTeamA ? scoreA : scoreB;
  const rightScore = isLeftTeamA ? scoreB : scoreA;
  const leftSideKey = isLeftTeamA ? 'A' : 'B';
  const rightSideKey = isLeftTeamA ? 'B' : 'A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 sm:p-6 my-auto max-h-[96vh] flex flex-col text-slate-800">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              match.status === 'finished' 
                ? 'bg-slate-100 text-slate-600' 
                : 'bg-rose-100 text-[#D10056] border border-rose-200 animate-pulse'
            }`}>
              {match.status === 'finished' ? 'Selesai' : '🔴 Sedang Tanding'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {match.category === 'MD' ? 'Ganda Putra' : 'Ganda Putri'} • {match.group} • {match.court} • Skor Maks. {max}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWA}
              title="Share Hasil ke WhatsApp"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Share2 size={14} />
              <span>Share WA</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
              title={soundMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            >
              {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Set & Target 30 Header */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Clock size={13} /> Target:
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB900]/25 text-[#B2054C] font-extrabold text-xs">
              Maksimal 30 Poin
            </span>
            {match.sets.length > 1 && match.sets.map((set, idx) => {
              const isCurrent = idx === currentSetIdx && match.status !== 'finished';
              return (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#007DCC] text-white shadow-sm'
                      : set.completed
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span>Set {idx + 1}</span>
                  <span>({set.scoreA}-{set.scoreB})</span>
                  {set.completed && <CheckCircle size={12} className="text-emerald-600" />}
                </div>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-600">
            Selisih Saat Ini: <span className="text-slate-900 text-sm font-extrabold">
              {Math.abs(scoreA - scoreB)} Poin
            </span>
          </div>
        </div>

        {/* Alerts Banner (Match Point, Interval) */}
        {(isMatchPointA || isMatchPointB || isInterval) && match.status !== 'finished' && (
          <div className="mb-4">
            {isMatchPointA || isMatchPointB ? (
              <div className="p-2.5 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 rounded-2xl text-center text-xs font-black text-amber-900 tracking-wider uppercase animate-pulse">
                🔥 MATCH POINT (POIN KE-29) UNTUK {isMatchPointA ? teamA.name.toUpperCase() : teamB.name.toUpperCase()}!
              </div>
            ) : isInterval ? (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-2xl text-center text-xs font-black text-[#007DCC] tracking-wider uppercase">
                ⏸️ INTERVAL 15 POIN (Setengah Laga 30 Poin)
              </div>
            ) : null}
          </div>
        )}

        {/* Winner Banner if Finished */}
        {match.status === 'finished' && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-[#FFB900] rounded-2xl text-center shadow-sm">
            <Trophy className="mx-auto text-[#FFB900] mb-1" size={32} />
            <h4 className="text-lg font-black text-slate-900">
              PEMENANG:{' '}
              <span className="text-[#B2054C]">
                {match.winnerTeamId === teamA.id ? teamA.name : teamB.name}
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Skor Akhir: {scoreA} - {scoreB} (Selisih Poin: {Math.abs(scoreA - scoreB)})
            </p>
          </div>
        )}

        {/* MAIN DUAL SCOREBOARD DISPLAY */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 my-2">
          {/* LEFT TEAM SCORE PANEL */}
          <div
            className={`relative rounded-3xl p-4 sm:p-6 transition-all duration-200 border-2 flex flex-col items-center justify-between text-center select-none ${
              match.servingTeam === leftSideKey
                ? 'bg-blue-50/70 border-[#007DCC] shadow-md shadow-blue-500/10'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Team Header */}
            <div className="w-full">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#007DCC] text-white">
                  {leftSideKey === 'A' ? 'Tim 1' : 'Tim 2'}
                </span>
                {match.servingTeam === leftSideKey && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-[#FFB900] text-slate-950 px-2 py-0.5 rounded-full shadow-xs animate-bounce">
                    🏸 Servis
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 truncate max-w-full">
                {leftTeam.name}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {leftTeam.player1} • {leftTeam.player2}
              </p>
            </div>

            {/* Giant Score Digital Display */}
            <div className="my-3 sm:my-5">
              <span className="font-['Teko',sans-serif] text-7xl sm:text-9xl font-bold tracking-tight text-slate-900 leading-none">
                {leftScore}
              </span>
            </div>

            {/* Point Action Button */}
            {isAdmin && match.status !== 'finished' ? (
              <div className="w-full">
                <button
                  onClick={() => handleAddPoint(leftSideKey)}
                  className="w-full py-4 sm:py-5 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>+1 POIN</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">
                {match.status === 'finished' ? 'Laga Selesai' : 'Mode penonton'}
              </div>
            )}
          </div>

          {/* RIGHT TEAM SCORE PANEL */}
          <div
            className={`relative rounded-3xl p-4 sm:p-6 transition-all duration-200 border-2 flex flex-col items-center justify-between text-center select-none ${
              match.servingTeam === rightSideKey
                ? 'bg-rose-50/70 border-[#D10056] shadow-md shadow-rose-500/10'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Team Header */}
            <div className="w-full">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#D10056] text-white">
                  {rightSideKey === 'A' ? 'Tim 1' : 'Tim 2'}
                </span>
                {match.servingTeam === rightSideKey && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-[#FFB900] text-slate-950 px-2 py-0.5 rounded-full shadow-xs animate-bounce">
                    🏸 Servis
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 truncate max-w-full">
                {rightTeam.name}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {rightTeam.player1} • {rightTeam.player2}
              </p>
            </div>

            {/* Giant Score Digital Display */}
            <div className="my-3 sm:my-5">
              <span className="font-['Teko',sans-serif] text-7xl sm:text-9xl font-bold tracking-tight text-slate-900 leading-none">
                {rightScore}
              </span>
            </div>

            {/* Point Action Button */}
            {isAdmin && match.status !== 'finished' ? (
              <div className="w-full">
                <button
                  onClick={() => handleAddPoint(rightSideKey)}
                  className="w-full py-4 sm:py-5 bg-[#D10056] hover:bg-[#b2054c] active:scale-95 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>+1 POIN</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">
                {match.status === 'finished' ? 'Laga Selesai' : 'Mode penonton'}
              </div>
            )}
          </div>
        </div>

        {/* Referee Controls Bar (Admin Only) */}
        {isAdmin && match.status !== 'finished' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 pb-3">
            <button
              onClick={handleUndo}
              disabled={match.history.length === 0}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <RotateCcw size={15} /> Undo Poin
            </button>

            <button
              onClick={handleToggleServe}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <ArrowLeftRight size={15} /> Ganti Servis
            </button>

            <button
              onClick={handleSwapCourt}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <ArrowLeftRight size={15} /> Pindah Lapangan
            </button>

            <button
              onClick={() => setConfirmFinish(true)}
              className="col-span-3 sm:col-span-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-[#B2054C] border border-rose-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Flag size={15} /> Akhiri Laga
            </button>
          </div>
        )}

        {/* Force Finish Confirmation Dialog */}
        {confirmFinish && (
          <div className="my-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800">
            <div className="text-center sm:text-left text-xs">
              <p className="font-bold text-[#B2054C]">Konfirmasi Selesai Pertandingan Lebih Awal?</p>
              <p className="text-slate-600">Pilih tim yang ditetapkan sebagai pemenang:</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleForceFinish('A')}
                className="px-3 py-1.5 bg-[#007DCC] hover:bg-[#006bb0] text-white text-xs font-bold rounded-lg transition"
              >
                {teamA.name} Menang
              </button>
              <button
                onClick={() => handleForceFinish('B')}
                className="px-3 py-1.5 bg-[#D10056] hover:bg-[#b2054c] text-white text-xs font-bold rounded-lg transition"
              >
                {teamB.name} Menang
              </button>
              <button
                onClick={() => setConfirmFinish(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Badminton Court Visualizer */}
        <div className="mt-2">
          <CourtView
            teamA={teamA}
            teamB={teamB}
            scoreA={scoreA}
            scoreB={scoreB}
            servingTeam={match.servingTeam}
            courtSwapped={courtSwapped}
          />
        </div>
      </div>
    </div>
  );
};
