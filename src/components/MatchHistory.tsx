import React, { useState } from 'react';
import { 
  History, Share2, Search, Trophy, Calendar, 
  Trash2, ExternalLink, AlertTriangle, Edit3, Check, X, ArrowUpDown
} from 'lucide-react';
import { Category, Match, PlayerPair } from '../types';
import { formatMatchScoreForWA, openWhatsAppShare } from '../utils/whatsapp';

interface MatchHistoryProps {
  matches: Match[];
  teams: PlayerPair[];
  category: Category;
  tournamentName: string;
  onOpenMatch: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onUpdateMatch: (updatedMatch: Match) => void;
  isAdmin: boolean;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  teams,
  category,
  tournamentName,
  onOpenMatch,
  onDeleteMatch,
  onUpdateMatch,
  isAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  
  // Deletion modal state
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  // Edit match state
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [editScoreA, setEditScoreA] = useState<number>(0);
  const [editScoreB, setEditScoreB] = useState<number>(0);
  const [editCourt, setEditCourt] = useState<string>('');
  const [editDate, setEditDate] = useState<string>(''); // YYYY-MM-DDTHH:mm
  const [editNotes, setEditNotes] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'finished' | 'live'>('finished');
  const [editError, setEditError] = useState<string>('');

  const teamMap = new Map<string, PlayerPair>();
  teams.forEach(t => teamMap.set(t.id, t));

  const finishedMatches = matches.filter(m => m.status === 'finished');

  const filteredMatches = finishedMatches.filter(m => {
    if (selectedCategoryFilter !== 'ALL' && m.category !== selectedCategoryFilter) {
      return false;
    }
    if (selectedGroupFilter !== 'ALL' && m.group !== selectedGroupFilter) {
      return false;
    }

    const teamA = teamMap.get(m.teamAId);
    const teamB = teamMap.get(m.teamBId);
    if (!teamA || !teamB) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${teamA.name} ${teamA.player1} ${teamA.player2} ${teamB.name} ${teamB.player1} ${teamB.player2} ${m.code} ${m.court}`.toLowerCase();
      return matchText.includes(q);
    }

    return true;
  }).sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));

  const handleShare = (match: Match) => {
    const teamA = teamMap.get(match.teamAId);
    const teamB = teamMap.get(match.teamBId);
    if (!teamA || !teamB) return;
    const text = formatMatchScoreForWA(match, teamA, teamB, tournamentName);
    openWhatsAppShare(text);
  };

  const handleConfirmDeleteMatch = () => {
    if (matchToDelete) {
      onDeleteMatch(matchToDelete.id);
      setMatchToDelete(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (m: Match) => {
    setMatchToEdit(m);
    const firstSet = m.sets[0] || { scoreA: 0, scoreB: 0 };
    setEditScoreA(firstSet.scoreA);
    setEditScoreB(firstSet.scoreB);
    setEditCourt(m.court || 'Lapangan 1');

    // Format timestamp for datetime-local input (YYYY-MM-DDTHH:mm)
    const timestamp = m.finishedAt || m.startedAt || Date.now();
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setEditDate(`${year}-${month}-${day}T${hours}:${minutes}`);

    setEditNotes(m.notes || '');
    setEditStatus('finished');
    setEditError('');
  };

  // Save Edit Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchToEdit) return;

    if (editScoreA < 0 || editScoreB < 0) {
      setEditError('Skor tidak boleh negatif.');
      return;
    }

    if (editScoreA === editScoreB && editStatus === 'finished') {
      setEditError('Dalam badminton tidak ada skor seri/imbang. Harus ada pemenang.');
      return;
    }

    // Parse chosen date
    let updatedTimestamp = matchToEdit.finishedAt || Date.now();
    if (editDate) {
      const parsed = new Date(editDate).getTime();
      if (!isNaN(parsed)) {
        updatedTimestamp = parsed;
      }
    }

    // Determine winner based on score
    const winnerSide: 'A' | 'B' = editScoreA > editScoreB ? 'A' : 'B';
    const winnerTeamId = winnerSide === 'A' ? matchToEdit.teamAId : matchToEdit.teamBId;

    const updatedSets = [
      {
        scoreA: editScoreA,
        scoreB: editScoreB,
        completed: editStatus === 'finished',
        winner: winnerSide,
      },
    ];

    const diff = Math.abs(editScoreA - editScoreB);
    const autoNote = editNotes.trim() || `Skor ${editScoreA} vs ${editScoreB}: Selisih poin ${diff}`;

    const updatedMatch: Match = {
      ...matchToEdit,
      court: editCourt.trim() || matchToEdit.court,
      status: editStatus,
      sets: updatedSets,
      currentSet: 0,
      winnerTeamId: editStatus === 'finished' ? winnerTeamId : undefined,
      startedAt: editStatus === 'finished' ? (matchToEdit.startedAt || updatedTimestamp) : Date.now(),
      finishedAt: editStatus === 'finished' ? updatedTimestamp : undefined,
      notes: autoNote,
    };

    onUpdateMatch(updatedMatch);
    setMatchToEdit(null);
  };

  return (
    <div className="relative bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#007DCC] flex items-center justify-center font-bold">
              <History size={18} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Riwayat Pertandingan Tersimpan</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hasil pertandingan 30 poin otomatis tercatat, dapat diedit skor & keterangannya
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
          Total Rekam: <span className="text-[#007DCC] font-black">{finishedMatches.length} Laga</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari pemain / tim..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007DCC]"
          />
        </div>

        <div>
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#007DCC]"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="MD">Ganda Putra (MD)</option>
            <option value="WD">Ganda Putri (WD)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedGroupFilter}
            onChange={e => setSelectedGroupFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#007DCC]"
          >
            <option value="ALL">Semua Grup</option>
            <option value="Grup A">Grup A</option>
            <option value="Grup B">Grup B</option>
            <option value="Grup C">Grup C</option>
            <option value="Grup D">Grup D</option>
          </select>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          {finishedMatches.length === 0
            ? 'Belum ada pertandingan yang selesai. Mulai pertandingan untuk menyimpan riwayat!'
            : 'Tidak ada hasil pertandingan yang cocok dengan filter pencarian.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map(m => {
            const teamA = teamMap.get(m.teamAId);
            const teamB = teamMap.get(m.teamBId);
            if (!teamA || !teamB) return null;

            const isWinnerA = m.winnerTeamId === teamA.id;
            const isWinnerB = m.winnerTeamId === teamB.id;

            const primarySet = m.sets[0] || { scoreA: 0, scoreB: 0 };
            const pointDiff = Math.abs(primarySet.scoreA - primarySet.scoreB);
            const diffA = primarySet.scoreA - primarySet.scoreB;
            const diffB = primarySet.scoreB - primarySet.scoreA;

            const dateStr = m.finishedAt
              ? new Date(m.finishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Waktu selesai';

            return (
              <div
                key={m.id}
                className="bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all duration-150"
              >
                {/* Top Meta info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-b border-slate-200/80 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#007DCC] bg-blue-100/70 px-2 py-0.5 rounded-lg border border-blue-200">
                      {m.code}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {m.category === 'MD' ? 'Ganda Putra' : 'Ganda Putri'}
                    </span>
                    <span>•</span>
                    <span>{m.group}</span>
                    <span>•</span>
                    <span>{m.court}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* Score and Teams Lineup */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Team A */}
                  <div className={`md:col-span-5 flex items-center justify-between md:justify-start gap-3 p-3 rounded-xl transition ${
                    isWinnerA ? 'bg-amber-50 border border-amber-200/80' : 'bg-white border border-slate-200'
                  }`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold truncate ${isWinnerA ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                          {teamA.name}
                        </span>
                        {isWinnerA && <Trophy size={14} className="text-[#FFB900] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {teamA.player1} & {teamA.player2}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black block text-slate-900">
                        {primarySet.scoreA} Poin
                      </span>
                      <span className={`text-[10px] font-bold ${diffA > 0 ? 'text-emerald-700' : 'text-[#D10056]'}`}>
                        Selisih {diffA > 0 ? `+${diffA}` : diffA}
                      </span>
                    </div>
                  </div>

                  {/* Sets Score Breakdown in Center */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-1">
                    <div className="text-2xl font-['Teko',sans-serif] font-bold text-slate-900 tracking-wider">
                      {primarySet.scoreA} - {primarySet.scoreB}
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Selisih: {pointDiff}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className={`md:col-span-5 flex items-center justify-between md:justify-end gap-3 p-3 rounded-xl transition ${
                    isWinnerB ? 'bg-amber-50 border border-amber-200/80' : 'bg-white border border-slate-200'
                  }`}>
                    <div className="text-left md:text-right shrink-0">
                      <span className="text-xs font-black block text-slate-900">
                        {primarySet.scoreB} Poin
                      </span>
                      <span className={`text-[10px] font-bold ${diffB > 0 ? 'text-emerald-700' : 'text-[#D10056]'}`}>
                        Selisih {diffB > 0 ? `+${diffB}` : diffB}
                      </span>
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="flex items-center md:justify-end gap-1.5">
                        {isWinnerB && <Trophy size={14} className="text-[#FFB900] shrink-0" />}
                        <span className={`text-sm font-bold truncate ${isWinnerB ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                          {teamB.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {teamB.player1} & {teamB.player2}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 italic truncate max-w-[200px] sm:max-w-none">
                    {m.notes || 'Hasil 30 poin tercatat ke klasemen'}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Share WA Button */}
                    <button
                      onClick={() => handleShare(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-sm"
                      title="Kirim ke WhatsApp"
                    >
                      <Share2 size={13} />
                      <span className="hidden sm:inline">Kirim ke WA</span>
                      <span className="sm:hidden">WA</span>
                    </button>

                    {/* Detail Scoreboard Button */}
                    <button
                      onClick={() => onOpenMatch(m)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200"
                      title="Lihat Detail Papan Skor"
                    >
                      <ExternalLink size={13} />
                      <span>Detail</span>
                    </button>

                    {/* EDIT MATCH BUTTON (Admin Only) */}
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#B2054C] text-xs font-bold rounded-xl transition border border-amber-200 shadow-xs"
                        title="Edit Skor & Detail Pertandingan"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* DELETE MATCH BUTTON (Admin Only) */}
                    {isAdmin && (
                      <button
                        onClick={() => setMatchToDelete(m)}
                        className="p-1.5 text-slate-400 hover:text-[#D10056] hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                        title="Hapus Pertandingan"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MATCH MODAL (ADMIN ONLY) */}
      {matchToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl my-auto text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#B2054C] flex items-center justify-center font-bold">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Edit Riwayat Pertandingan
                  </h4>
                  <p className="text-xs text-slate-500">
                    {matchToEdit.code} • {matchToEdit.category === 'MD' ? 'Ganda Putra' : 'Ganda Putri'} ({matchToEdit.group})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMatchToEdit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Teams & Score Input */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Team 1 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase text-[#007DCC] block truncate">
                    🔵 {teamMap.get(matchToEdit.teamAId)?.name}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate">
                    {teamMap.get(matchToEdit.teamAId)?.player1} & {teamMap.get(matchToEdit.teamAId)?.player2}
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Skor Akhir
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      required
                      value={editScoreA}
                      onChange={e => setEditScoreA(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xl font-bold text-slate-900 text-center focus:outline-none focus:border-[#007DCC]"
                    />
                  </div>
                </div>

                {/* Team 2 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase text-[#D10056] block truncate">
                    🔴 {teamMap.get(matchToEdit.teamBId)?.name}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate">
                    {teamMap.get(matchToEdit.teamBId)?.player1} & {teamMap.get(matchToEdit.teamBId)?.player2}
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Skor Akhir
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      required
                      value={editScoreB}
                      onChange={e => setEditScoreB(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xl font-bold text-slate-900 text-center focus:outline-none focus:border-[#D10056]"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Point Difference & Winner preview */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-[#007DCC]" />
                  <span className="text-slate-600">Selisih Poin Dihitung:</span>
                </div>
                <div className="font-extrabold text-slate-900">
                  {editScoreA !== editScoreB ? (
                    <span>
                      {teamMap.get(matchToEdit.teamAId)?.name} (
                      <span className={editScoreA - editScoreB > 0 ? 'text-emerald-700' : 'text-[#D10056]'}>
                        {editScoreA - editScoreB > 0 ? `+${editScoreA - editScoreB}` : editScoreA - editScoreB}
                      </span>
                      ) vs {teamMap.get(matchToEdit.teamBId)?.name} (
                      <span className={editScoreB - editScoreA > 0 ? 'text-emerald-700' : 'text-[#D10056]'}>
                        {editScoreB - editScoreA > 0 ? `+${editScoreB - editScoreA}` : editScoreB - editScoreA}
                      </span>
                      )
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold">Skor sama (Harus ada pemenang)</span>
                  )}
                </div>
              </div>

              {/* Court, Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Lapangan / Court:
                  </label>
                  <input
                    type="text"
                    value={editCourt}
                    onChange={e => setEditCourt(e.target.value)}
                    placeholder="Lapangan 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status Laga:
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'finished' | 'live')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                  >
                    <option value="finished">Selesai (Masuk Klasemen)</option>
                    <option value="live">Kembalikan ke LIVE (Buka Papan Skor)</option>
                  </select>
                </div>
              </div>

              {/* Tanggal & Waktu Pertandingan */}
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Calendar size={13} className="text-[#007DCC]" />
                  <span>Tanggal & Waktu Pertandingan:</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pilih tanggal dan jam pertandingan ini berlangsung untuk sinkronisasi riwayat & WhatsApp.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Pertandingan:
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Contoh: Pertandingan 30 poin dramatis"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                />
              </div>

              {editError && (
                <p className="text-xs text-[#D10056] flex items-center gap-1 font-semibold">
                  <AlertTriangle size={14} /> {editError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMatchToEdit(null)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL FOR DELETE MATCH */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#D10056] mx-auto flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Hapus Pertandingan Ini?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus rekaman laga <strong className="text-slate-900">{matchToDelete.code}</strong>? Poin dari pertandingan ini akan dikurangi dari klasemen.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMatch}
                className="flex-1 py-2 px-3 bg-[#D10056] hover:bg-[#b2054c] active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
