import React, { useState } from 'react';
import { 
  Play, Calendar, ChevronRight, Edit3, Trash2, 
  X, Check, AlertTriangle, ArrowRightLeft, Clock
} from 'lucide-react';
import { Category, Match, PlayerPair } from '../types';

interface MatchScheduleProps {
  matches: Match[];
  teams: PlayerPair[];
  category?: Category | 'ALL';
  onOpenScorekeeper: (match: Match) => void;
  onStartMatch: (match: Match) => void;
  onUpdateMatch?: (match: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
  isAdmin: boolean;
  onOpenCreateMatch: () => void;
}

export const MatchSchedule: React.FC<MatchScheduleProps> = ({
  matches,
  teams,
  category = 'ALL',
  onOpenScorekeeper,
  onStartMatch,
  onUpdateMatch,
  onDeleteMatch,
  isAdmin,
  onOpenCreateMatch,
}) => {
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MD' | 'WD'>(category);

  // Edit form state
  const [editTeamAId, setEditTeamAId] = useState<string>('');
  const [editTeamBId, setEditTeamBId] = useState<string>('');
  const [editCourt, setEditCourt] = useState<string>('');
  const [editGroup, setEditGroup] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  const teamMap = new Map<string, PlayerPair>();
  teams.forEach(t => teamMap.set(t.id, t));

  const activeMatches = matches.filter(
    m => (filterCategory === 'ALL' || m.category === filterCategory) && (m.status === 'live' || m.status === 'scheduled')
  );

  const liveMatches = activeMatches.filter(m => m.status === 'live');
  const scheduledMatches = activeMatches.filter(m => m.status === 'scheduled');

  // Handle open edit modal
  const handleOpenEdit = (m: Match, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMatchToEdit(m);
    setEditTeamAId(m.teamAId);
    setEditTeamBId(m.teamBId);
    setEditCourt(m.court || 'Lapangan 1');
    setEditGroup(m.group);
    setEditCode(m.code);
    setEditNotes(m.notes || '');
    setEditError('');

    const timestamp = m.startedAt || Date.now();
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setEditDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  // Handle swap teams in edit form
  const handleSwapTeams = () => {
    const temp = editTeamAId;
    setEditTeamAId(editTeamBId);
    setEditTeamBId(temp);
  };

  // Handle save edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchToEdit) return;

    if (!editTeamAId || !editTeamBId) {
      setEditError('Pilih Tim 1 dan Tim 2!');
      return;
    }

    if (editTeamAId === editTeamBId) {
      setEditError('Tim 1 dan Tim 2 tidak boleh sama!');
      return;
    }

    let updatedTimestamp = matchToEdit.startedAt;
    if (editDate) {
      const parsed = new Date(editDate).getTime();
      if (!isNaN(parsed)) {
        updatedTimestamp = parsed;
      }
    }

    const updatedMatch: Match = {
      ...matchToEdit,
      code: editCode.trim() || matchToEdit.code,
      group: editGroup.trim() || matchToEdit.group,
      teamAId: editTeamAId,
      teamBId: editTeamBId,
      court: editCourt.trim() || matchToEdit.court,
      startedAt: updatedTimestamp,
      notes: editNotes.trim() || undefined,
    };

    if (onUpdateMatch) {
      onUpdateMatch(updatedMatch);
    }
    setMatchToEdit(null);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (matchToDelete && onDeleteMatch) {
      onDeleteMatch(matchToDelete.id);
      setMatchToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* LIVE MATCHES SECTION */}
      {liveMatches.length > 0 && (
        <div className="bg-white border-2 border-[#007DCC]/40 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D10056] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D10056]"></span>
              </span>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Pertandingan Sedang Berlangsung (LIVE)
              </h3>
            </div>
            <span className="text-xs font-bold bg-rose-100 text-[#D10056] border border-rose-200 px-3 py-1 rounded-full">
              {liveMatches.length} Lapangan Aktif • 30 Poin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map(m => {
              const teamA = teamMap.get(m.teamAId);
              const teamB = teamMap.get(m.teamBId);
              if (!teamA || !teamB) return null;

              const currentSet = m.sets[m.currentSet || 0] || { scoreA: 0, scoreB: 0 };
              const currentDiff = Math.abs(currentSet.scoreA - currentSet.scoreB);

              return (
                <div
                  key={m.id}
                  onClick={() => onOpenScorekeeper(m)}
                  className="bg-blue-50/40 border-2 border-[#007DCC]/50 hover:border-[#007DCC] rounded-2xl p-4 cursor-pointer transition-all duration-200 group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold text-[#007DCC] bg-blue-100 px-2 py-0.5 rounded">
                      {m.code} • {m.group}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {m.court}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={e => handleOpenEdit(m, e)}
                          className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#B2054C] border border-amber-200 transition"
                          title="Edit Info Laga"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Team A vs Team B Lineup */}
                  <div className="space-y-2 my-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#007DCC]"></span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#007DCC] transition">
                            {teamA.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {teamA.player1} & {teamA.player2}
                          </p>
                        </div>
                      </div>
                      <span className="font-['Teko',sans-serif] text-3xl font-bold text-[#007DCC]">
                        {currentSet.scoreA}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D10056]"></span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#D10056] transition">
                            {teamB.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {teamB.player1} & {teamB.player2}
                          </p>
                        </div>
                      </div>
                      <span className="font-['Teko',sans-serif] text-3xl font-bold text-[#D10056]">
                        {currentSet.scoreB}
                      </span>
                    </div>
                  </div>

                  {/* Footer status & Action */}
                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                    <div className="text-slate-600 font-semibold">
                      Target 30 Poin • Selisih: <strong className="text-slate-900">{currentDiff}</strong>
                    </div>

                    <div className="flex items-center gap-1 text-[#007DCC] font-bold group-hover:translate-x-1 transition">
                      <span>{isAdmin ? 'Catat Skor' : 'Lihat Skor Live'}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULED UPCOMING MATCHES */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#007DCC] flex items-center justify-center font-bold">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Jadwal Pertandingan Berikutnya</h3>
              <p className="text-xs text-slate-500">Daftar pertandingan terencana dengan sistem skor maksimal 30 poin</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterCategory === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('MD')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterCategory === 'MD'
                    ? 'bg-[#007DCC] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨‍🦱 Putra
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('WD')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterCategory === 'WD'
                    ? 'bg-[#D10056] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👩‍🦱 Putri
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={onOpenCreateMatch}
                className="px-3.5 py-1.5 bg-[#007DCC] hover:bg-[#006bb0] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Play size={13} />
                <span>Tambah Pertandingan</span>
              </button>
            )}
          </div>
        </div>

        {scheduledMatches.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Belum ada jadwal pertandingan berikutnya untuk kategori ini.
            {isAdmin && ' Klik tombol "Tambah Pertandingan" atau gunakan Auto-Generator Round Robin.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scheduledMatches.map(m => {
              const teamA = teamMap.get(m.teamAId);
              const teamB = teamMap.get(m.teamBId);
              if (!teamA || !teamB) return null;

              const dateStr = m.startedAt
                ? new Date(m.startedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <div
                  key={m.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all duration-150"
                >
                  {/* Top meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        m.category === 'MD' ? 'bg-blue-100 text-[#007DCC]' : 'bg-rose-100 text-[#D10056]'
                      }`}>
                        {m.category === 'MD' ? 'PUTRA' : 'PUTRI'}
                      </span>
                      <span className="font-bold text-[#007DCC] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {m.code} • {m.group}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {dateStr && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock size={11} /> {dateStr}
                        </span>
                      )}
                      <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {m.court}
                      </span>
                    </div>
                  </div>

                  {/* Teams Lineup */}
                  <div className="space-y-1.5 my-2">
                    <p className="text-xs font-bold text-slate-900">
                      🔵 {teamA.name}{' '}
                      <span className="text-slate-500 font-normal">
                        ({teamA.player1} & {teamA.player2})
                      </span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">VS</p>
                    <p className="text-xs font-bold text-slate-900">
                      🔴 {teamB.name}{' '}
                      <span className="text-slate-500 font-normal">
                        ({teamB.player1} & {teamB.player2})
                      </span>
                    </p>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Sistem: 1 Set (Maksimal 30 Poin)
                    </span>

                    {isAdmin ? (
                      <div className="flex items-center gap-1.5">
                        {/* EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#B2054C] border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          title="Edit Jadwal Pertandingan"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => setMatchToDelete(m)}
                          className="p-1.5 text-slate-400 hover:text-[#D10056] hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                          title="Hapus Jadwal"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* START MATCH BUTTON */}
                        <button
                          onClick={() => onStartMatch(m)}
                          className="px-3 py-1.5 bg-[#007DCC] hover:bg-[#006bb0] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm active:scale-95"
                        >
                          <Play size={12} />
                          <span>Mulai Laga</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Menunggu Wasit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MATCH MODAL (ADMIN ONLY) */}
      {matchToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl my-auto text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#B2054C] flex items-center justify-center font-bold">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Edit Pertandingan
                  </h4>
                  <p className="text-xs text-slate-500">
                    {category === 'MD' ? 'Ganda Putra' : 'Ganda Putri'} • Sistem Skor Maks. 30 Poin
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
            {(() => {
              const matchCategoryTeams = matchToEdit 
                ? teams.filter(t => t.category === matchToEdit.category)
                : teams;
              const editAvailableGroups = Array.from(new Set(matchCategoryTeams.map(t => t.group))).sort();

              return (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  {/* Kode Pertandingan & Grup */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Kode Laga:
                      </label>
                      <input
                        type="text"
                        required
                        value={editCode}
                        onChange={e => setEditCode(e.target.value)}
                        placeholder="Contoh: WD-B01"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-[#007DCC]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Grup Pool:
                      </label>
                      <select
                        value={editGroup}
                        onChange={e => setEditGroup(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                      >
                        {editAvailableGroups.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Team 1 & Team 2 Selection with Swap Button */}
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Pasangan Tim Bertanding
                      </span>
                      <button
                        type="button"
                        onClick={handleSwapTeams}
                        className="text-xs text-[#007DCC] hover:text-[#006bb0] font-semibold flex items-center gap-1 transition"
                      >
                        <ArrowRightLeft size={13} />
                        <span>Tukar Sisi</span>
                      </button>
                    </div>

                    {/* Team 1 */}
                    <div>
                      <label className="text-[11px] font-bold text-[#007DCC] block mb-1">
                        Tim 1 (Biru):
                      </label>
                      <select
                        value={editTeamAId}
                        onChange={e => setEditTeamAId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                      >
                        <option value="">-- Pilih Tim 1 --</option>
                        {matchCategoryTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.player1} & {t.player2}) - {t.group}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Team 2 */}
                    <div>
                      <label className="text-[11px] font-bold text-[#D10056] block mb-1">
                        Tim 2 (Merah):
                      </label>
                      <select
                        value={editTeamBId}
                        onChange={e => setEditTeamBId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#D10056]"
                      >
                        <option value="">-- Pilih Tim 2 --</option>
                        {matchCategoryTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.player1} & {t.player2}) - {t.group}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

              {/* Lapangan & Tanggal/Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Lapangan / Court:
                  </label>
                  <input
                    type="text"
                    required
                    value={editCourt}
                    onChange={e => setEditCourt(e.target.value)}
                    placeholder="Lapangan 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jadwal Pertandingan:
                  </label>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Pertandingan (Opsional):
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Contoh: Partai penyisihan grup pool"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                />
              </div>

              {editError && (
                <p className="text-xs text-[#D10056] flex items-center gap-1 font-semibold">
                  <AlertTriangle size={14} /> {editError}
                </p>
              )}

              {/* Action Buttons */}
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
              );
            })()}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL FOR SCHEDULED MATCH */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#D10056] mx-auto flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Hapus Jadwal Pertandingan?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin membatalkan dan menghapus jadwal <strong className="text-slate-900">{matchToDelete.code}</strong> ({teamMap.get(matchToDelete.teamAId)?.name} vs {teamMap.get(matchToDelete.teamBId)?.name})?
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
                onClick={handleConfirmDelete}
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
