import React, { useState } from 'react';
import { X, Play, Calendar, Zap, AlertCircle, Clock, CheckSquare, Trophy } from 'lucide-react';
import { Category, Match, PlayerPair } from '../types';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: PlayerPair[];
  category: Category;
  onAddMatch: (match: Match) => void;
  onGenerateRoundRobin: (groupName: string, category: Category) => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  teams,
  category: initialCategory,
  onAddMatch,
  onGenerateRoundRobin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  
  // Format current datetime for input
  const getNowDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [matchDate, setMatchDate] = useState<string>(getNowDateTimeString());

  const categoryTeams = teams.filter(t => t.category === selectedCategory);
  const groups = Array.from(new Set(categoryTeams.map(t => t.group))).sort();

  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'Grup A');
  const availableTeams = categoryTeams.filter(t => t.group === selectedGroup);

  const [teamAId, setTeamAId] = useState<string>('');
  const [teamBId, setTeamBId] = useState<string>('');
  const [court, setCourt] = useState<string>('Lapangan 1');
  const [statusMode, setStatusMode] = useState<'live' | 'scheduled' | 'finished'>('scheduled');
  const [scoreA, setScoreA] = useState<number>(30);
  const [scoreB, setScoreB] = useState<number>(20);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    const newCatTeams = teams.filter(t => t.category === cat);
    const newGroups = Array.from(new Set(newCatTeams.map(t => t.group))).sort();
    setSelectedGroup(newGroups[0] || 'Grup A');
    setTeamAId('');
    setTeamBId('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAId || !teamBId) {
      setErrorMsg('Pilih Tim 1 dan Tim 2!');
      return;
    }
    if (teamAId === teamBId) {
      setErrorMsg('Tim 1 dan Tim 2 tidak boleh sama!');
      return;
    }

    if (statusMode === 'finished') {
      if (scoreA < 0 || scoreB < 0 || scoreA > 30 || scoreB > 30) {
        setErrorMsg('Skor harus antara 0 dan 30 poin!');
        return;
      }
      if (scoreA === scoreB) {
        setErrorMsg('Skor tidak boleh imbang/seri dalam sistem 30 poin!');
        return;
      }
    }

    const parsedTimestamp = matchDate ? new Date(matchDate).getTime() : Date.now();
    const code = `${selectedCategory}-${selectedGroup.replace(/\s+/g, '').slice(-1)}${Math.floor(10 + Math.random() * 90)}`;
    const diff = Math.abs(scoreA - scoreB);
    
    const newMatch: Match = {
      id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      category: selectedCategory,
      group: selectedGroup,
      teamAId,
      teamBId,
      court,
      status: statusMode,
      currentSet: 0,
      sets: [
        { 
          scoreA: statusMode === 'finished' ? scoreA : 0, 
          scoreB: statusMode === 'finished' ? scoreB : 0, 
          completed: statusMode === 'finished',
          winner: statusMode === 'finished' ? (scoreA > scoreB ? 'A' : 'B') : undefined,
        },
      ],
      maxPoints: 30, // 30 points max
      servingTeam: 'A',
      winnerTeamId: statusMode === 'finished' ? (scoreA > scoreB ? teamAId : teamBId) : undefined,
      startedAt: statusMode === 'finished' ? parsedTimestamp - (25 * 60 * 1000) : parsedTimestamp,
      finishedAt: statusMode === 'finished' ? parsedTimestamp : undefined,
      notes: notes.trim() || (statusMode === 'finished' ? `Hasil: ${scoreA} - ${scoreB} (Selisih: ${diff})` : undefined),
      history: [],
    };

    onAddMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-800 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00E0BA] flex items-center justify-center font-bold">
              <Play size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Buat Laga Baru</h3>
              <p className="text-xs text-slate-500">
                Atur jadwal, tanggal pertandingan, dan sistem skor 30 poin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Switcher in Modal */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => handleCategoryChange('MD')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedCategory === 'MD'
                ? 'bg-[#00E0BA] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏸 Ganda Putra (MD)
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange('WD')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedCategory === 'WD'
                ? 'bg-[#FF3483] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏸 Ganda Putri (WD)
          </button>
        </div>

        {/* Quick Round-Robin Generator Button */}
        <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#00E0BA] flex items-center gap-1.5">
              <Zap size={14} className="text-[#FFCF00]" />
              Generator Otomatis Round-Robin
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Buat seluruh jadwal tanding antar-tim di {selectedGroup} ({selectedCategory}) sekaligus.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onGenerateRoundRobin(selectedGroup, selectedCategory);
              onClose();
            }}
            className="px-3.5 py-1.5 bg-[#00E0BA] hover:bg-[#00B89A] active:scale-95 text-white text-xs font-bold rounded-xl shrink-0 transition shadow-sm"
          >
            Generate
          </button>
        </div>

        {/* Manual Match Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Group Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Pilih Grup Pool:
            </label>
            <select
              value={selectedGroup}
              onChange={e => {
                setSelectedGroup(e.target.value);
                setTeamAId('');
                setTeamBId('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00E0BA]"
            >
              {groups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Teams Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#00E0BA] block mb-1">
                Tim 1 (Biru):
              </label>
              <select
                value={teamAId}
                onChange={e => setTeamAId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00E0BA]"
              >
                <option value="">-- Pilih Tim 1 --</option>
                {availableTeams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.player1} & {t.player2})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#FF3483] block mb-1">
                Tim 2 (Merah):
              </label>
              <select
                value={teamBId}
                onChange={e => setTeamBId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF3483]"
              >
                <option value="">-- Pilih Tim 2 --</option>
                {availableTeams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.player1} & {t.player2})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EDIT TANGGAL & WAKTU PERTANDINGAN */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Calendar size={13} className="text-[#00E0BA]" />
              <span>Tanggal & Waktu Pertandingan:</span>
            </label>
            <input
              type="datetime-local"
              required
              value={matchDate}
              onChange={e => setMatchDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00E0BA]"
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock size={10} />
              <span>Tanggal dan jam dapat diedit sesuai jadwal pertandingan sebenarnya.</span>
            </p>
          </div>

          {/* Lapangan & Status Mulai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lapangan / Court:
              </label>
              <input
                type="text"
                value={court}
                onChange={e => setCourt(e.target.value)}
                placeholder="Lapangan 1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00E0BA]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tipe / Status Pertandingan:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusMode('scheduled')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                    statusMode === 'scheduled' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Calendar size={11} /> Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => setStatusMode('live')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                    statusMode === 'live' ? 'bg-[#00E0BA] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Play size={11} /> Live Score
                </button>
                <button
                  type="button"
                  onClick={() => setStatusMode('finished')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                    statusMode === 'finished' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CheckSquare size={11} /> Ketik Hasil
                </button>
              </div>
            </div>
          </div>

          {/* Direct Score Input Panel if statusMode === 'finished' */}
          {statusMode === 'finished' && (
            <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                  <CheckSquare size={14} />
                  <span>Ketik Skor Akhir Langsung (Maks. 30 Poin)</span>
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Selisih: {Math.abs(scoreA - scoreB)} Poin
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-[#00E0BA] block truncate">
                    Skor Tim 1 (Biru):
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={scoreA}
                    onChange={e => setScoreA(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full text-center text-3xl font-['Teko',sans-serif] font-bold text-[#00E0BA] focus:outline-none"
                  />
                  <div className="flex gap-1 mt-1 justify-center">
                    <button
                      type="button"
                      onClick={() => setScoreA(30)}
                      className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-black text-[#00E0BA] border border-blue-200"
                    >
                      30
                    </button>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-[#FF3483] block truncate">
                    Skor Tim 2 (Merah):
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={scoreB}
                    onChange={e => setScoreB(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full text-center text-3xl font-['Teko',sans-serif] font-bold text-[#FF3483] focus:outline-none"
                  />
                  <div className="flex gap-1 mt-1 justify-center">
                    <button
                      type="button"
                      onClick={() => setScoreB(30)}
                      className="px-2 py-0.5 rounded bg-rose-50 text-[10px] font-black text-[#FF3483] border border-rose-200"
                    >
                      30
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Catatan Laga (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Partai penyisihan grup pembuka"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00E0BA]"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-[#FF3483] flex items-center gap-1 font-semibold">
              <AlertCircle size={14} /> {errorMsg}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5 ${
                statusMode === 'finished'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-[#00E0BA] hover:bg-[#00B89A] shadow-emerald-500/20'
              }`}
            >
              {statusMode === 'finished' ? (
                <>
                  <CheckSquare size={16} />
                  <span>Simpan Hasil Laga Selesai ({scoreA} - {scoreB})</span>
                </>
              ) : statusMode === 'live' ? (
                <>
                  <Play size={16} />
                  <span>Simpan & Buka Papan Skor Live</span>
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  <span>Jadwalkan Pertandingan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
