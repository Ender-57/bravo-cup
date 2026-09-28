import React from 'react';
import { PlayerPair } from '../types';

interface CourtViewProps {
  teamA: PlayerPair;
  teamB: PlayerPair;
  scoreA: number;
  scoreB: number;
  servingTeam: 'A' | 'B';
  courtSwapped?: boolean;
}

export const CourtView: React.FC<CourtViewProps> = ({
  teamA,
  teamB,
  scoreA,
  scoreB,
  servingTeam,
  courtSwapped = false,
}) => {
  const leftTeam = courtSwapped ? teamB : teamA;
  const rightTeam = courtSwapped ? teamA : teamB;
  const leftScore = courtSwapped ? scoreB : scoreA;
  const rightScore = courtSwapped ? scoreA : scoreB;
  const leftIsServing = courtSwapped ? servingTeam === 'B' : servingTeam === 'A';
  const rightIsServing = !leftIsServing;

  const leftServerIsEven = leftScore % 2 === 0;
  const rightServerIsEven = rightScore % 2 === 0;

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-[#007DCC] animate-pulse"></span>
          VISUALISASI LAPANGAN BWF (30 POIN)
        </span>
        <span className="text-[11px] text-slate-500">
          Servis genap: Kotak Kanan • Ganjil: Kotak Kiri
        </span>
      </div>

      {/* Badminton Court Graphics */}
      <div className="relative w-full aspect-[21/10] max-h-56 bg-emerald-800 rounded-xl border-4 border-emerald-950 p-2 overflow-hidden shadow-inner flex">
        <div className="relative w-full h-full border-2 border-white/80 grid grid-cols-2">
          {/* Net in the center */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-white/90 z-20 shadow-md">
            <div className="absolute -top-1 -left-1.5 w-4 h-2 bg-slate-200 rounded"></div>
            <div className="absolute -bottom-1 -left-1.5 w-4 h-2 bg-slate-200 rounded"></div>
            <div className="h-full w-full opacity-60 bg-[repeating-linear-gradient(0deg,#fff,#fff_2px,transparent_2px,transparent_4px)]"></div>
          </div>

          {/* LEFT HALF COURT */}
          <div className="relative border-r border-white/40 h-full grid grid-rows-2">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/60"></div>
            <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-white/70"></div>
            <div className="absolute right-4 left-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/70"></div>

            {/* Top Box: ODD */}
            <div className={`relative flex items-center justify-center p-1.5 transition-all ${leftIsServing && !leftServerIsEven ? 'bg-emerald-600/50 ring-2 ring-[#FFB900] rounded' : ''}`}>
              <div className="text-center z-10">
                <span className="text-[10px] md:text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm block truncate max-w-[110px] md:max-w-[140px]">
                  {leftTeam.player2}
                </span>
                {leftIsServing && !leftServerIsEven && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-[#FFB900] text-slate-950 px-1.5 py-0.2 rounded-full mt-0.5 shadow-sm animate-bounce">
                    🏸 Servis ({leftScore})
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Box: EVEN */}
            <div className={`relative flex items-center justify-center p-1.5 transition-all ${leftIsServing && leftServerIsEven ? 'bg-emerald-600/50 ring-2 ring-[#FFB900] rounded' : ''}`}>
              <div className="text-center z-10">
                <span className="text-[10px] md:text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm block truncate max-w-[110px] md:max-w-[140px]">
                  {leftTeam.player1}
                </span>
                {leftIsServing && leftServerIsEven && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-[#FFB900] text-slate-950 px-1.5 py-0.2 rounded-full mt-0.5 shadow-sm animate-bounce">
                    🏸 Servis ({leftScore})
                  </span>
                )}
              </div>
            </div>

            <div className="absolute bottom-1 left-3 z-10">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#007DCC] text-white shadow-sm">
                {leftTeam.name}
              </span>
            </div>
          </div>

          {/* RIGHT HALF COURT */}
          <div className="relative border-l border-white/40 h-full grid grid-rows-2">
            <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-white/60"></div>
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/70"></div>
            <div className="absolute left-4 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/70"></div>

            {/* Top Box: ODD */}
            <div className={`relative flex items-center justify-center p-1.5 transition-all ${rightIsServing && !rightServerIsEven ? 'bg-emerald-600/50 ring-2 ring-[#FFB900] rounded' : ''}`}>
              <div className="text-center z-10">
                <span className="text-[10px] md:text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm block truncate max-w-[110px] md:max-w-[140px]">
                  {rightTeam.player2}
                </span>
                {rightIsServing && !rightServerIsEven && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-[#FFB900] text-slate-950 px-1.5 py-0.2 rounded-full mt-0.5 shadow-sm animate-bounce">
                    🏸 Servis ({rightScore})
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Box: EVEN */}
            <div className={`relative flex items-center justify-center p-1.5 transition-all ${rightIsServing && rightServerIsEven ? 'bg-emerald-600/50 ring-2 ring-[#FFB900] rounded' : ''}`}>
              <div className="text-center z-10">
                <span className="text-[10px] md:text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm block truncate max-w-[110px] md:max-w-[140px]">
                  {rightTeam.player1}
                </span>
                {rightIsServing && rightServerIsEven && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-[#FFB900] text-slate-950 px-1.5 py-0.2 rounded-full mt-0.5 shadow-sm animate-bounce">
                    🏸 Servis ({rightScore})
                  </span>
                )}
              </div>
            </div>

            <div className="absolute bottom-1 right-3 z-10">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D10056] text-white shadow-sm">
                {rightTeam.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
