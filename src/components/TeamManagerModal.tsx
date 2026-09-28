import React, { useState } from 'react';
import { 
  X, UserPlus, Users, Trash2, Edit2, Check, AlertCircle, 
  AlertTriangle, Search, ChevronDown, ChevronUp 
} from 'lucide-react';
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
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingTeamId(null);
    setPlayer1('');
    setPlayer2('');
    setTeamName('');
    setClubOrOrigin('');
    setErrorMsg('');
    setShowForm(false);
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

  const filteredTeams = teams
    .filter(t => t.category === selectedCategory)
    .filter(t => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.player1.toLowerCase().includes(q) ||
        t.player2.toLowerCase().includes(q) ||
        t.group.toLowerCase().includes(q) ||
        (t.clubOrOrigin && t.clubOrOrigin.toLowerCase().includes(q))
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 sm:p-6 my-auto h-[90vh] max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#007DCC] flex items-center justify-center font-bold shadow-xs">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Kelola Pasangan Pemain & Grup Pool
              </h3>
              <p className="text-xs text-slate-500">
                Pendaftaran, edit data tim, dan pengaturan grup turnamen
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

        {/* Toolbar: Category Switcher, Search & Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2">
            {/* Category Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('MD');
                  if (!editingTeamId) handleCancelForm();
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  selectedCategory === 'MD'
                    ? 'bg-[#007DCC] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏸 Putra (MD)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('WD');
                  if (!editingTeamId) handleCancelForm();
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  selectedCategory === 'WD'
                    ? 'bg-[#D10056] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏸 Putri (WD)
              </button>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
              {filteredTeams.length} Pasangan
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pasangan / pemain..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
              />
            </div>

            {/* Toggle Add Form Button */}
            <button
              type="button"
              onClick={() => {
                if (showForm && editingTeamId) {
                  handleCancelForm();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs ${
                showForm
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  : 'bg-[#007DCC] hover:bg-[#006bb0] text-white'
              }`}
            >
              <UserPlus size={14} />
              <span>{showForm ? 'Tutup Form' : '+ Tambah Pasangan'}</span>
              {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Add / Edit Form Panel (Shown when showForm is true) */}
          {showForm && (
            <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-50/90 border border-slate-200 p-4 rounded-2xl overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus size={15} className="text-[#007DCC]" />
                    {editingTeamId ? 'Edit Pasangan' : 'Daftar Pasangan Baru'}
                  </h4>
                  {editingTeamId && (
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold"
                    >
                      Batal
                    </button>
                  )}
                </div>

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
                    Nama Pasangan / Panggilan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="Contoh: The Daddies"
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
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
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
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007DCC]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#D10056] flex items-center gap-1 font-semibold">
                    <AlertCircle size={14} /> {errorMsg}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check size={15} />
                    <span>{editingTeamId ? 'Simpan' : 'Daftarkan'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Registered Teams (Spacious, full height scrollable container) */}
          <div className="flex-1 min-h-0 flex flex-col bg-slate-50/50 border border-slate-200/80 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Daftar Pasangan Terdaftar</span>
                <span className="text-slate-400 font-normal">
                  ({filteredTeams.length} Tim {selectedCategory === 'MD' ? 'Putra' : 'Putri'})
                </span>
              </span>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="text-xs font-bold text-[#007DCC] hover:underline flex items-center gap-1"
                >
                  <UserPlus size={13} />
                  <span>+ Tambah Tim Baru</span>
                </button>
              )}
            </div>

            {/* Scrollable grid area */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredTeams.length === 0 ? (
                <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <Users size={24} />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Belum ada pasangan ditemukan</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    {searchQuery ? 'Coba kata kunci pencarian lain.' : 'Klik tombol "+ Tambah Pasangan" di atas untuk mendaftarkan tim.'}
                  </p>
                  {!showForm && (
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="mt-3 px-4 py-2 bg-[#007DCC] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#006bb0] transition"
                    >
                      + Tambah Pasangan Pertama
                    </button>
                  )}
                </div>
              ) : (
                <div className={`grid gap-2.5 ${showForm ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredTeams.map((t, idx) => {
                    const isMD = t.category === 'MD';
                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 bg-white border rounded-2xl flex items-center justify-between gap-3 transition-all shadow-xs hover:shadow-sm ${
                          editingTeamId === t.id
                            ? 'border-[#007DCC] ring-2 ring-blue-500/20 bg-blue-50/30'
                            : 'border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isMD ? 'bg-blue-100 text-[#007DCC]' : 'bg-rose-100 text-[#D10056]'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-slate-900 truncate">
                                {t.name}
                              </span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                isMD ? 'bg-blue-50 text-[#007DCC] border border-blue-200' : 'bg-rose-50 text-[#D10056] border border-rose-200'
                              }`}>
                                {t.group}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                              {t.player1} & {t.player2}
                            </p>
                            {t.clubOrOrigin && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                🏢 {t.clubOrOrigin}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEdit(t)}
                            className="p-2 text-slate-500 hover:text-[#007DCC] hover:bg-blue-50 rounded-xl transition"
                            title="Edit Data Tim"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setTeamToDelete(t)}
                            className="p-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition"
                            title="Hapus Pasangan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {teamToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#D10056] mx-auto flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Hapus Pasangan Ini?
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus <strong>{teamToDelete.name}</strong> ({teamToDelete.player1} & {teamToDelete.player2})?
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
  );
};
