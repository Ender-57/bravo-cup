import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Check, AlertCircle, Calendar, 
  Clock, Hash, Sparkles, CheckSquare, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Category, Match, PlayerPair } from '../types';

interface DirectScoreInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatch: Match | null; // null if creating a new match or selecting from list
  allMatches: Match[];
  teams: PlayerPair[];
  category: Category;
  onSaveMatchResult: (match: Match) => void;
}

export const DirectScoreInputModal: React.FC<DirectScoreInputModalProps> = ({
  isOpen,
  onClose,
  targetMatch,
  allMatches,
  teams,
  category: defaultCategory,
  onSaveMatchResult,
}) => {
  // Mode: if targetMatch exists, we edit that specific match.
  // Otherwise, user can pick an existing scheduled match OR pick two teams to create and finish.
  const [selectedMatchId, setSelectedMatchId] = useState<string>(targetMatch?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<Category>(targetMatch?.category || defaultCategory);
  const [selectedGroup, setSelectedGroup] = useState<string>(targetMatch?.group || 'Grup A');

  // Teams
  const [teamAId, setTeamAId] = useState<string>(targetMatch?.teamAId || '');
  const [teamBId, setTeamBId] = useState<string>(targetMatch?.teamBId || '');

  // Scores
  const [scoreA, setScoreA] = useState<number>(() => {
    if (targetMatch && targetMatch.sets[0]) return targetMatch.sets[0].scoreA || 30;
    return 30;
  });
  const [scoreB, setScoreB] = useState<number>(() => {
    if (targetMatch && targetMatch.sets[0]) return targetMatch.sets[0].scoreB || 0;
    return 20;
  });

  // Court & Time
  const [court, setCourt] = useState<string>(targetMatch?.court || 'Lapangan 1');
  const [matchDate, setMatchDate] = useState<string>(() => {
    const timestamp = targetMatch?.finishedAt || targetMatch?.startedAt || Date.now();
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const [notes, setNotes] = useState<string>(targetMatch?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Team mapping
  const teamMap = new Map<string, PlayerPair>();
  teams.forEach(t => teamMap.set(t.id, t));

  // Sync state whenever modal opens or targetMatch changes
  useEffect(() => {
    if (targetMatch) {
      setSelectedMatchId(targetMatch.id);
      setSelectedCategory(targetMatch.category);
      setSelectedGroup(targetMatch.group);
      setTeamAId(targetMatch.teamAId);
      setTeamBId(targetMatch.teamBId);
      setCourt(targetMatch.court || 'Lapangan 1');
      const firstSet = targetMatch.sets[0] || { scoreA: 30, scoreB: 20 };
      setScoreA(firstSet.scoreA || 30);
      setScoreB(firstSet.scoreB || 20);
      setNotes(targetMatch.notes || '');

      const timestamp = targetMatch.finishedAt || targetMatch.startedAt || Date.now();
      const d = new Date(timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setMatchDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setSelectedMatchId('');
      setSelectedCategory(defaultCategory);
      setScoreA(30);
      setScoreB(20);
      setErrorMsg('');
    }
  }, [targetMatch, isOpen, defaultCategory]);

  // When selectedMatchId changes from dropdown (when targetMatch was null)
  const handleSelectScheduledMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    if (!matchId) return;

    const found = allMatches.find(m => m.id === matchId);
    if (found) {
      setSelectedCategory(found.category);
      setSelectedGroup(found.group);
      setTeamAId(found.teamAId);
      setTeamBId(found.teamBId);
      setCourt(found.court || 'Lapangan 1');
      const set0 = found.sets[0] || { scoreA: 30, scoreB: 20 };
      setScoreA(set0.scoreA || 30);
      setScoreB(set0.scoreB || 20);
      setNotes(found.notes || '');
    }
  };

  if (!isOpen) return null;

  // Filter scheduled matches
  const scheduledList = allMatches.filter(m => m.status === 'scheduled');
  const categoryTeams = teams.filter(t => t.category === selectedCategory);
  const groups = Array.from(new Set(categoryTeams.map(t => t.group))).sort();

  const teamA = teamMap.get(teamAId);
  const teamB = teamMap.get(teamBId);

  // Common score presets
  const presets = [
    { a: 30, b: 20 },
    { a: 30, b: 22 },
    { a: 30, b: 25 },
    { a: 30, b: 28 },
    { a: 30, b: 29 },
    { a: 20, b: 30 },
    { a: 22, b: 30 },
    { a: 25, b: 30 },
    { a: 28, b: 30 },
    { a: 29, b: 30 },
  ];

  const pointDiff = Math.abs(scoreA - scoreB);
  const winnerSide: 'A' | 'B' | null = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : null;
  const winnerTeam = winnerSide === 'A' ? teamA : winnerSide === 'B' ? teamB : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamAId || !teamBId) {
      setErrorMsg('Pilih Tim A dan Tim B terlebih dahulu!');
      return;
    }

    if (teamAId === teamBId) {
      setErrorMsg('Tim A dan Tim B tidak boleh sama!');
      return;
    }

    if (scoreA < 0 || scoreB < 0) {
      setErrorMsg('Skor tidak boleh kurang dari 0!');
      return;
    }

    if (scoreA > 30 || scoreB > 30) {
      setErrorMsg('Sistem skor turnamen ini maksimal 30 poin!');
      return;
    }

    if (scoreA === scoreB) {
      setErrorMsg('Dalam badminton tidak ada skor imbang/seri. Harus ada tim pemenang!');
      return;
    }

    // Parse date
    const parsedTime = matchDate ? new Date(matchDate).getTime() : Date.now();
    const finalWinnerId = scoreA > scoreB ? teamAId : teamBId;

    // Check if we are updating an existing match or creating a new finished match
    let finalMatch: Match;

    const existingMatch = targetMatch || allMatches.find(m => m.id === selectedMatchId);

    if (existingMatch) {
      finalMatch = {
        ...existingMatch,
        teamAId,
        teamBId,
        court,
        group: selectedGroup,
        category: selectedCategory,
        status: 'finished',
        currentSet: 0,
        sets: [
          {
            scoreA,
            scoreB,
            completed: true,
            winner: scoreA > scoreB ? 'A' : 'B',
          },
        ],
        winnerTeamId: finalWinnerId,
        startedAt: existingMatch.startedAt || parsedTime - (25 * 60 * 1000),
        finishedAt: parsedTime,
        notes: notes.trim() || `Selesai: ${scoreA} - ${scoreB} (Selisih: ${pointDiff})`,
      };
    } else {
      // New finished match
      const generatedCode = `${selectedCategory}-${selectedGroup.replace(/\s+/g, '').slice(-1)}${Math.floor(10 + Math.random() * 90)}`;
      finalMatch = {
        id: `match-direct-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        code: generatedCode,
        category: selectedCategory,
        group: selectedGroup,
        teamAId,
        teamBId,
        court,
        status: 'finished',
        currentSet: 0,
        sets: [
          {
            scoreA,
            scoreB,
            completed: true,
            winner: scoreA > scoreB ? 'A' : 'B',
          },
        ],
        maxPoints: 30,
        servingTeam: 'A',
        winnerTeamId: finalWinnerId,
        startedAt: parsedTime - (25 * 60 * 1000),
        finishedAt: parsedTime,
        notes: notes.trim() || `Input langsung: ${scoreA} - ${scoreB} (Selisih: ${pointDiff})`,
        history: [],
      };
    }

    onSaveMatchResult(finalMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl my-auto text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shadow-xs">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Input Hasil Pertandingan Langsung</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Maks. 30 Poin
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Ketik skor akhir secara langsung tanpa harus memulai laga court live
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Match Selection Dropdown (if not launched from specific match) */}
          {!targetMatch && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Pilih Jadwal yang Sudah Ada (Opsional):</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {scheduledList.length} laga terjadwal
                </span>
              </label>

              <select
                value={selectedMatchId}
                onChange={e => handleSelectScheduledMatch(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#007DCC]"
              >
                <option value="">-- Buat Baru / Pilih Tim Manual --</option>
                {scheduledList.map(m => {
                  const tA = teamMap.get(m.teamAId);
                  const tB = teamMap.get(m.teamBId);
                  return (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {tA ? tA.name : 'Tim A'} vs {tB ? tB.name : 'Tim B'} ({m.group} - {m.court})
                    </option>
                  );
                })}
              </select>

              {/* If creating new / manual teams */}
              {!selectedMatchId && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Kategori:</label>
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('MD');
                          setTeamAId('');
                          setTeamBId('');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                          selectedCategory === 'MD'
                            ? 'bg-[#007DCC] text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        👨‍🦱 Putra
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('WD');
                          setTeamAId('');
                          setTeamBId('');
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                          selectedCategory === 'WD'
                            ? 'bg-[#D10056] text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        👩‍🦱 Putri
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Grup:</label>
                    <select
                      value={selectedGroup}
                      onChange={e => {
                        setSelectedGroup(e.target.value);
                        setTeamAId('');
                        setTeamBId('');
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      {groups.length === 0 ? (
                        <option value="Grup A">Grup A</option>
                      ) : (
                        groups.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Selectors (if not locked by targetMatch or if creating new) */}
          {(!targetMatch && !selectedMatchId) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007DCC]"></span>
                  <span>Tim A (Biru):</span>
                </label>
                <select
                  value={teamAId}
                  onChange={e => setTeamAId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#007DCC]"
                  required
                >
                  <option value="">-- Pilih Tim A --</option>
                  {categoryTeams.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === teamBId}>
                      {t.name} ({t.player1} & {t.player2})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D10056]"></span>
                  <span>Tim B (Merah):</span>
                </label>
                <select
                  value={teamBId}
                  onChange={e => setTeamBId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#D10056]"
                  required
                >
                  <option value="">-- Pilih Tim B --</option>
                  {categoryTeams.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                      {t.name} ({t.player1} & {t.player2})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* BIG DIRECT SCORE INPUT SECTION */}
          <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="text-center mb-3">
              <span className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase">
                Ketik Langsung Skor Pertandingan (Maksimal 30 Poin)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              {/* TIM A BOX */}
              <div className={`p-4 rounded-2xl border-2 transition text-center ${
                winnerSide === 'A' 
                  ? 'bg-blue-50/70 border-[#007DCC] shadow-sm' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#007DCC]"></span>
                  <p className="text-xs font-black text-slate-900 truncate max-w-[140px]">
                    {teamA ? teamA.name : 'Tim A'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 truncate mb-2">
                  {teamA ? `${teamA.player1} & ${teamA.player2}` : 'Pemain Tim A'}
                </p>

                {/* Number Input */}
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={scoreA}
                  onChange={e => setScoreA(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full py-2 bg-white border-2 border-slate-300 focus:border-[#007DCC] rounded-xl text-center font-['Teko',sans-serif] text-5xl font-bold text-[#007DCC] focus:outline-none shadow-xs"
                />

                {/* Score Steppers */}
                <div className="flex gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => setScoreA(prev => Math.max(0, prev - 1))}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreA(prev => Math.min(30, prev + 1))}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreA(30)}
                    className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-[11px] font-black text-[#007DCC]"
                  >
                    30
                  </button>
                </div>
              </div>

              {/* TIM B BOX */}
              <div className={`p-4 rounded-2xl border-2 transition text-center ${
                winnerSide === 'B' 
                  ? 'bg-rose-50/70 border-[#D10056] shadow-sm' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#D10056]"></span>
                  <p className="text-xs font-black text-slate-900 truncate max-w-[140px]">
                    {teamB ? teamB.name : 'Tim B'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 truncate mb-2">
                  {teamB ? `${teamB.player1} & ${teamB.player2}` : 'Pemain Tim B'}
                </p>

                {/* Number Input */}
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={scoreB}
                  onChange={e => setScoreB(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full py-2 bg-white border-2 border-slate-300 focus:border-[#D10056] rounded-xl text-center font-['Teko',sans-serif] text-5xl font-bold text-[#D10056] focus:outline-none shadow-xs"
                />

                {/* Score Steppers */}
                <div className="flex gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => setScoreB(prev => Math.max(0, prev - 1))}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreB(prev => Math.min(30, prev + 1))}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreB(30)}
                    className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-[11px] font-black text-[#D10056]"
                  >
                    30
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK SCORE PRESETS */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles size={13} className="text-[#007DCC]" />
                <span>Pilih Cepat Skor Populer (30 Poin):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setScoreA(p.a);
                      setScoreB(p.b);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                      scoreA === p.a && scoreB === p.b
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {p.a} - {p.b}
                  </button>
                ))}
              </div>
            </div>

            {/* WINNER & POINT DIFFERENCE PREVIEW */}
            <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Trophy size={16} className={winnerSide ? 'text-amber-500' : 'text-slate-300'} />
                <div>
                  <span className="font-bold text-slate-800">
                    {winnerTeam ? `Pemenang: ${winnerTeam.name}` : 'Belum ada pemenang'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {winnerSide === 'A' ? (
                      <span>Tim A: <strong className="text-emerald-700">+{pointDiff}</strong> • Tim B: <strong className="text-[#D10056]">-{pointDiff}</strong></span>
                    ) : winnerSide === 'B' ? (
                      <span>Tim B: <strong className="text-emerald-700">+{pointDiff}</strong> • Tim A: <strong className="text-[#D10056]">-{pointDiff}</strong></span>
                    ) : (
                      'Skor masih sama (30 poin wajib ada pemenang)'
                    )}
                  </p>
                </div>
              </div>

              {winnerSide && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  Selisih: {pointDiff} Poin
                </span>
              )}
            </div>
          </div>

          {/* Court, Time, and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <span>Lapangan:</span>
              </label>
              <select
                value={court}
                onChange={e => setCourt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Lapangan 1">Lapangan 1</option>
                <option value="Lapangan 2">Lapangan 2</option>
                <option value="Lapangan 3">Lapangan 3</option>
                <option value="Lapangan Utama">Lapangan Utama</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock size={12} />
                <span>Waktu Pertandingan Selesai:</span>
              </label>
              <input
                type="datetime-local"
                value={matchDate}
                onChange={e => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 mb-1 block">
              Catatan Laga (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Babak penyisihan seru, rubber deuce, WO, dsb."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#007DCC]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-[#D10056]">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Check size={16} />
              <span>Simpan Hasil Pertandingan (Selesai)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
