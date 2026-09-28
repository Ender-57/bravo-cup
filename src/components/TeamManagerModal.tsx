import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, Edit2, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { Category, PlayerPair } from '../types';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: PlayerPair[];
  onSaveTeam: (team: PlayerPair) => void;
  onDeleteTeam: (teamId: string) => void;
  initialCategory?: Category;
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  teams,
  onSaveTeam,
  onDeleteTeam,
  initialCategory = 'MD',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<PlayerPair | null>(null);

  // Form State
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [teamName, setTeamName] = useState('');
  const [group, setGroup] = useState('Grup A');
  const [clubOrOrigin, setClubOrOrigin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (t: PlayerPair) => {
    setEditingTeamId(t.id);
    setPlayer1(t.player1);
    setPlayer2(t.player2);
    setTeamName(t.name);
    setSelectedCategory(t.category);
    setGroup(t.group);
    setClubOrOrigin(t.clubOrOrigin || '');
    setErrorMsg('');
  };

  const handleCancelForm = () => {
    setEditingTeamId(null);
    setPlayer1('');
    setPlayer2('');
    setTeamName('');
    setClubOrOrigin('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1.trim() || !player2.trim()) {
      setErrorMsg('Nama Pemain 1 dan Pemain 2 wajib diisi!');
      return;
    }

    const computedName = teamName.trim() || `${player1.trim().split(' ')[0]} / ${player2.trim().split(' ')[0]}`;

    const newOrUpdatedTeam: PlayerPair = {
      id: editingTeamId || `team-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: computedName,
      player1: player1.trim(),
      player2: player2.trim(),
      category: selectedCategory,
      group: group.trim() || 'Grup A',
      clubOrOrigin: clubOrOrigin.trim() || undefined,
    };

    onSaveTeam(newOrUpdatedTeam);
    handleCancelForm();
  };

  const handleConfirmDelete = () => {
    if (teamToDelete) {
      onDeleteTeam(teamToDelete.id);
      if (editingTeamId === teamToDelete.id) {
        handleCancelForm();
      }
      setTeamToDelete(null);
    }
  };

  const filteredTeams = teams.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-7 my-auto max-h-[90vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007DCC] flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Kelola Pemain & Grup</h3>
              <p className="text-xs text-slate-500">Tambah, edit, dan hapus pasangan ganda serta pembagian grup pool</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-4 max-w-sm">
          <button
            type="button"
            onClick={() => setSelectedCategory('MD')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedCategory === 'MD'
                ? 'bg-[#007DCC] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏸 Ganda Putra (MD)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('WD')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedCategory === 'WD'
                ? 'bg-[#D10056] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏸 Ganda Putri (WD)
          </button>
        </div>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus size={15} className="text-[#007DCC]" />
              {editingTeamId ? 'Edit Pasangan Pemain' : 'Tambah Pasangan Pemain Baru'}
            </h4>
            {editingTeamId && (
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nama Pemain 1 *
              </label>
              <input
                type="text"
                required
                value={player1}
                onChange={e => setPlayer1(e.target.value)}
                placeholder="Contoh: Hendra Setiawan"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nama Pemain 2 *
              </label>
              <input
                type="text"
                required
                value={player2}
                onChange={e => setPlayer2(e.target.value)}
                placeholder="Contoh: Mohammad Ahsan"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nama Duet / Panggilan (Opsional)
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Contoh: The Daddies / Ahsan & Hendra"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Grup Pool
                </label>
                <select
                  value={group}
                  onChange={e => setGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                >
                  <option value="Grup A">Grup A</option>
                  <option value="Grup B">Grup B</option>
                  <option value="Grup C">Grup C</option>
                  <option value="Grup D">Grup D</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Klub / Asal RT
                </label>
                <input
                  type="text"
                  value={clubOrOrigin}
                  onChange={e => setClubOrOrigin(e.target.value)}
                  placeholder="PB Jaya / RT 04"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-[#D10056] flex items-center gap-1">
              <AlertCircle size={14} /> {errorMsg}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Check size={15} />
              <span>{editingTeamId ? 'Simpan Perubahan' : 'Daftarkan Pasangan'}</span>
            </button>
          </div>
        </form>

        {/* List of Registered Teams */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Daftar Pasangan Terdaftar ({filteredTeams.length})
            </span>
          </div>

          {filteredTeams.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada pasangan terdaftar di kategori ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredTeams.map(t => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#007DCC]">
                        {t.group}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {t.player1} & {t.player2}
                    </p>
                    {t.clubOrOrigin && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {t.clubOrOrigin}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStartEdit(t)}
                      className="p-2 text-slate-500 hover:text-[#007DCC] hover:bg-slate-200 rounded-xl transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setTeamToDelete(t)}
                      className="p-2 text-[#D10056] hover:text-white hover:bg-[#D10056] bg-rose-50 border border-rose-200 rounded-xl transition shadow-xs"
                      title="Hapus Pasangan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOM CONFIRMATION MODAL (No window.confirm!) */}
        {teamToDelete && (
          <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 rounded-3xl animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-[#D10056] mx-auto flex items-center justify-center mb-3">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Hapus Pasangan Pemain?
              </h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-900">{teamToDelete.name}</strong> ({teamToDelete.player1} & {teamToDelete.player2})? Semua pertandingan terkait pasangan ini akan ikut dihapus.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTeamToDelete(null)}
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
    </div>
  );
};
