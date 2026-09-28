import React, { useState } from 'react';
import { Trophy, Share2, HelpCircle, ArrowUpDown } from 'lucide-react';
import { Category, Match, PlayerPair } from '../types';
import { calculateStandings } from '../utils/standings';
import { formatStandingsForWA, openWhatsAppShare } from '../utils/whatsapp';

interface StandingsTableProps {
  teams: PlayerPair[];
  matches: Match[];
  category: Category;
  tournamentName: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  matches,
  category,
  tournamentName,
}) => {
  // Filter teams by category
  const categoryTeams = teams.filter(t => t.category === category);

  // Get unique groups
  const groups = Array.from(new Set(categoryTeams.map(t => t.group))).sort();
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'Grup A');

  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : groups[0] || 'Grup A';

  const groupTeams = categoryTeams.filter(t => t.group === activeGroup);
  const groupMatches = matches.filter(
    m => m.category === category && m.group === activeGroup
  );

  const standings = calculateStandings(groupTeams, groupMatches);

  const handleShareGroupStandings = () => {
    const text = formatStandingsForWA(activeGroup, category, standings, tournamentName);
    openWhatsAppShare(text);
  };

  const isMD = category === 'MD';

  return (
    <div className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm ${
      isMD ? 'border-blue-200/80 ring-1 ring-blue-500/10' : 'border-rose-200/80 ring-1 ring-rose-500/10'
    }`}>
      {/* Header and Group Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              isMD ? 'bg-blue-100 text-[#007DCC]' : 'bg-rose-100 text-[#D10056]'
            }`}>
              <Trophy size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {isMD ? 'Tabel Peringkat Ganda Putra (MD)' : 'Tabel Peringkat Ganda Putri (WD)'}
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isMD ? 'bg-blue-100 text-[#007DCC]' : 'bg-rose-100 text-[#D10056]'
                }`}>
                  {isMD ? 'PUTRA' : 'PUTRI'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Klasemen pool penyisihan • Sistem Skor Maksimal 30 Poin
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* Group Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {groups.map(grp => {
              const scheduleNote = !isMD 
                ? (grp.includes('A') ? : grp.includes('B') ? : '')
                : '';
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeGroup === grp
                      ? (isMD ? 'bg-[#007DCC] text-white shadow-sm' : 'bg-[#D10056] text-white shadow-sm')
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {grp}{scheduleNote}
                </button>
              );
            })}
          </div>

          {/* Share to WA Button */}
          <button
            onClick={handleShareGroupStandings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007DCC] hover:bg-[#006bb0] active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Share2 size={13} />
            <span>Bagikan ke WA</span>
          </button>
        </div>
      </div>

      {/* Standings Rule Info Banner */}
      <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50/80 to-amber-50/80 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
        <HelpCircle size={17} className="text-[#007DCC] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#007DCC]">Aturan Penentuan Peringkat:</span>
          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
            Peringkat ditentukan berdasarkan <strong>Jumlah Poin Kemenangan</strong> dan <strong>Selisih Poin (Poin Masuk - Poin Kalah)</strong>. Contoh: Tim A menang 30 vs Tim B 12, maka selisih poin Tim A adalah <strong className="text-emerald-700">+18</strong> dan Tim B adalah <strong className="text-[#D10056]">-18</strong>.
          </p>
        </div>
      </div>

      {/* Standings Table */}
      {standings.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Belum ada tim yang terdaftar di {activeGroup}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-50">
                <th className="py-3 px-3 text-center w-12">Pos</th>
                <th className="py-3 px-3">Pasangan Pemain</th>
                <th className="py-3 px-2 text-center">Main</th>
                <th className="py-3 px-2 text-center text-emerald-700">M</th>
                <th className="py-3 px-2 text-center text-[#D10056]">K</th>
                <th className="py-3 px-2 text-center">Poin Masuk</th>
                <th className="py-3 px-2 text-center">Poin Kalah</th>
                <th className="py-3 px-3 text-center bg-amber-50/80 text-slate-900 font-black border-l border-amber-200">
                  <div className="flex items-center justify-center gap-1">
                    <span>Selisih Poin</span>
                    <ArrowUpDown size={11} className="text-[#007DCC]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {standings.map((row, idx) => {
                const isQualifying = idx < 2; // Top 2 qualify
                const pointDiffFormatted = row.pointDiff > 0 ? `+${row.pointDiff}` : `${row.pointDiff}`;

                return (
                  <tr
                    key={row.team.id}
                    className={`hover:bg-slate-50/80 transition duration-150 ${
                      isQualifying ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center font-bold">
                        {idx === 0 ? (
                          <span className="w-6 h-6 rounded-full bg-[#FFB900] text-slate-900 text-xs flex items-center justify-center font-black shadow-sm">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs flex items-center justify-center font-black">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs flex items-center justify-center font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-semibold">{idx + 1}</span>
                        )}
                      </div>
                    </td>

                    {/* Team Name & Players */}
                    <td className="py-3 px-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {row.team.name}
                          </span>
                          {isQualifying && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Lolos
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {row.team.player1} & {row.team.player2}
                          {row.team.clubOrOrigin && (
                            <span className="text-slate-400"> • {row.team.clubOrOrigin}</span>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-2 text-center font-semibold text-slate-700">
                      {row.played}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-700">
                      {row.won}
                    </td>
                    <td className="py-3 px-2 text-center font-semibold text-[#D10056]">
                      {row.lost}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-slate-700">
                      {row.pointsWon}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-slate-500">
                      {row.pointsLost}
                    </td>

                    {/* Selisih Poin Column */}
                    <td className="py-3 px-3 text-center bg-amber-50/50 border-l border-amber-200 font-bold text-sm">
                      <span className={
                        row.pointDiff > 0 
                          ? 'text-emerald-700 font-black text-sm' 
                          : row.pointDiff < 0 
                          ? 'text-[#D10056] font-black text-sm' 
                          : 'text-slate-500 font-bold'
                      }>
                        {pointDiffFormatted}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
          <span>Peringkat 1-2 lolos ke Babak Semifinal / Gugur</span>
        </div>
        <div>
          Penentu peringkat: <strong className="text-slate-800">Menang/Kalah</strong> & <strong className="text-slate-800">Selisih Poin</strong>
        </div>
      </div>
    </div>
  );
};
