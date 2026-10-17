import React, { useState } from 'react';
import { 
  Trophy, Medal, ChevronRight, Swords, Sparkles, 
  Calendar, Play, CheckSquare, AlertCircle, Info, 
  ArrowRight, ArrowDown, ShieldCheck, Check, GitBranch, ListOrdered
} from 'lucide-react';
import { Category, Match, PlayerPair } from '../types';
import { calculateStandings } from '../utils/standings';

interface TournamentBracketProps {
  teams: PlayerPair[];
  matches: Match[];
  isAdmin: boolean;
  onOpenScorekeeper: (match: Match) => void;
  onOpenDirectScoreInput: (match: Match | null) => void;
  onSaveMatch: (match: Match) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  teams,
  matches,
  isAdmin,
  onOpenScorekeeper,
  onOpenDirectScoreInput,
  onSaveMatch,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('MD');
  const [bracketViewMode, setBracketViewMode] = useState<'tree' | 'cards'>('tree');

  const teamMap = new Map<string, PlayerPair>();
  teams.forEach(t => teamMap.set(t.id, t));

  // 1. Calculate Standings for Group A and Group B
  const groupATeams = teams.filter(t => t.category === activeCategory && t.group === 'Grup A');
  const groupAMatches = matches.filter(m => m.category === activeCategory && m.group === 'Grup A');
  const standingsA = calculateStandings(groupATeams, groupAMatches);

  const groupBTeams = teams.filter(t => t.category === activeCategory && t.group === 'Grup B');
  const groupBMatches = matches.filter(m => m.category === activeCategory && m.group === 'Grup B');
  const standingsB = calculateStandings(groupBTeams, groupBMatches);

  // Qualifiers according to the official rule:
  // SF1: Rank 1 Group A vs Rank 2 Group B
  // SF2: Rank 1 Group B vs Rank 2 Group A
  const rank1GroupA = standingsA[0]?.team || null;
  const rank2GroupA = standingsA[1]?.team || null;

  const rank1GroupB = standingsB[0]?.team || null;
  const rank2GroupB = standingsB[1]?.team || null;

  // 2. Identify Knockout Matches from database
  const sf1Match = matches.find(
    m => m.category === activeCategory && 
    (m.knockoutRound === 'SF1' || m.code === `${activeCategory}-SF1` || m.group === 'Semifinal 1')
  );

  const sf2Match = matches.find(
    m => m.category === activeCategory && 
    (m.knockoutRound === 'SF2' || m.code === `${activeCategory}-SF2` || m.group === 'Semifinal 2')
  );

  const finalMatch = matches.find(
    m => m.category === activeCategory && 
    (m.knockoutRound === 'FINAL' || m.code === `${activeCategory}-FINAL` || m.group === 'Final')
  );

  // Determine winners of Semifinals
  const getMatchWinnerTeam = (match?: Match): PlayerPair | null => {
    if (!match || match.status !== 'finished') return null;
    const scoreA = match.sets[0]?.scoreA || 0;
    const scoreB = match.sets[0]?.scoreB || 0;
    const winnerId = match.winnerTeamId || (scoreA > scoreB ? match.teamAId : match.teamBId);
    return teamMap.get(winnerId) || null;
  };

  const getMatchLoserTeam = (match?: Match): PlayerPair | null => {
    if (!match || match.status !== 'finished') return null;
    const scoreA = match.sets[0]?.scoreA || 0;
    const scoreB = match.sets[0]?.scoreB || 0;
    const winnerId = match.winnerTeamId || (scoreA > scoreB ? match.teamAId : match.teamBId);
    const loserId = winnerId === match.teamAId ? match.teamBId : match.teamAId;
    return teamMap.get(loserId) || null;
  };

  const sf1Winner = getMatchWinnerTeam(sf1Match);
  const sf2Winner = getMatchWinnerTeam(sf2Match);
  const championTeam = getMatchWinnerTeam(finalMatch);
  const runnerUpTeam = getMatchLoserTeam(finalMatch);

  // Helper to create or initialize a knockout match in database
  const handleCreateKnockoutMatch = (
    round: 'SF1' | 'SF2' | 'FINAL',
    teamA?: PlayerPair | null,
    teamB?: PlayerPair | null,
    courtName = 'Lapangan 1'
  ) => {
    if (!teamA || !teamB) return;
    const code = `${activeCategory}-${round}`;
    const groupName = round === 'SF1' ? 'Semifinal 1' : round === 'SF2' ? 'Semifinal 2' : 'Final';
    
    const newMatch: Match = {
      id: `match-ko-${activeCategory}-${round.toLowerCase()}`,
      code,
      category: activeCategory,
      group: groupName,
      stage: round === 'FINAL' ? 'final' : 'semifinal',
      knockoutRound: round,
      teamAId: teamA.id,
      teamBId: teamB.id,
      court: courtName,
      status: 'scheduled',
      currentSet: 0,
      sets: [{ scoreA: 0, scoreB: 0, completed: false }],
      maxPoints: 30,
      servingTeam: 'A',
      startedAt: Date.now(),
      notes: `${groupName}: ${teamA.name} vs ${teamB.name}`,
      history: [],
    };

    onSaveMatch(newMatch);
  };

  // Render individual Match Card in Bracket
  const renderBracketMatchCard = (
    title: string,
    tagRule: string,
    match: Match | undefined,
    prospectiveA: PlayerPair | null,
    prospectiveB: PlayerPair | null,
    labelA: string,
    labelB: string,
    round: 'SF1' | 'SF2' | 'FINAL',
    defaultCourt = 'Lapangan 1'
  ) => {
    const teamA = match ? teamMap.get(match.teamAId) : prospectiveA;
    const teamB = match ? teamMap.get(match.teamBId) : prospectiveB;
    const scoreA = match?.sets[0]?.scoreA ?? '-';
    const scoreB = match?.sets[0]?.scoreB ?? '-';
    const isFinished = match?.status === 'finished';
    const isLive = match?.status === 'live';
    const numScoreA = typeof scoreA === 'number' ? scoreA : 0;
    const numScoreB = typeof scoreB === 'number' ? scoreB : 0;
    const isWinnerA = isFinished && numScoreA > numScoreB;
    const isWinnerB = isFinished && numScoreB > numScoreA;

    return (
      <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm relative ${
        isFinished
          ? 'bg-emerald-50/20 border-emerald-300'
          : isLive
          ? 'bg-rose-50/40 border-[#FF3483] ring-2 ring-rose-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}>
        {/* Header Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
              round === 'FINAL' 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-blue-50 text-[#00E0BA] border border-blue-100'
            }`}>
              {title}
            </span>
            <span className="text-[10px] font-bold text-slate-400">{tagRule}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {match?.court || defaultCourt}
          </span>
        </div>

        {/* Team 1 / Team A Row */}
        <div className={`flex items-center justify-between p-2.5 rounded-xl border transition mb-2 ${
          isWinnerA 
            ? 'bg-emerald-100/70 border-emerald-400 shadow-xs' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
              round === 'FINAL' ? 'bg-[#00E0BA] text-white' : 'bg-amber-100 text-amber-900'
            }`}>
              {labelA}
            </span>
            <div className="truncate">
              <p className={`text-xs truncate ${isWinnerA ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                {teamA ? teamA.name : `Menunggu ${labelA}`}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {teamA ? `${teamA.player1} & ${teamA.player2}` : `Pemenang / Posisi ${labelA}`}
              </p>
            </div>
          </div>
          <span className={`font-['Teko',sans-serif] text-3xl font-black pl-2 leading-none ${
            isWinnerA ? 'text-emerald-700' : 'text-[#00E0BA]'
          }`}>
            {scoreA}
          </span>
        </div>

        {/* Team 2 / Team B Row */}
        <div className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
          isWinnerB 
            ? 'bg-emerald-100/70 border-emerald-400 shadow-xs' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
              round === 'FINAL' ? 'bg-[#FF3483] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {labelB}
            </span>
            <div className="truncate">
              <p className={`text-xs truncate ${isWinnerB ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                {teamB ? teamB.name : `Menunggu ${labelB}`}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {teamB ? `${teamB.player1} & ${teamB.player2}` : `Pemenang / Posisi ${labelB}`}
              </p>
            </div>
          </div>
          <span className={`font-['Teko',sans-serif] text-3xl font-black pl-2 leading-none ${
            isWinnerB ? 'text-emerald-700' : 'text-[#FF3483]'
          }`}>
            {scoreB}
          </span>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-semibold truncate max-w-[140px]">
            {isFinished ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check size={12} />
                <span>Selesai (30 Poin)</span>
              </span>
            ) : isLive ? (
              <span className="text-[#FF3483] font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF3483] animate-pulse" />
                <span>Sedang Berlangsung</span>
              </span>
            ) : (
              <span>Target: 30 Poin</span>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              {match ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenDirectScoreInput(match)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Ketik Skor Langsung"
                  >
                    <CheckSquare size={12} />
                    <span>Input Skor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenScorekeeper(match)}
                    className="px-2 py-1 bg-[#00E0BA] hover:bg-[#00B89A] active:scale-95 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Live Scoring"
                  >
                    <Play size={11} />
                    <span>Live</span>
                  </button>
                </>
              ) : (
                teamA && teamB && (
                  <button
                    type="button"
                    onClick={() => handleCreateKnockoutMatch(round, teamA, teamB, defaultCourt)}
                    className="px-2.5 py-1 bg-[#00E0BA] hover:bg-[#00B89A] active:scale-95 text-white rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs"
                  >
                    <span>Buat Jadwal</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Podium Juara Card
  const renderPodiumCard = () => (
    <div className="w-full bg-gradient-to-b from-amber-50 via-white to-slate-50 border-2 border-amber-300 rounded-3xl p-5 text-center shadow-md relative">
      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-tr from-amber-400 to-[#FFCF00] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
        <Trophy size={32} />
      </div>

      <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-1">
        🥇 JUARA 1 (CHAMPION)
      </span>

      {championTeam ? (
        <div className="my-2 p-3 bg-white rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-sm font-black text-slate-900">
            {championTeam.name}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {championTeam.player1} &amp; {championTeam.player2}
          </p>
          <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Pemenang Turnamen 🏆
          </span>
        </div>
      ) : (
        <div className="my-3 py-4 border-2 border-dashed border-amber-200 rounded-2xl bg-white/60">
          <p className="text-xs font-bold text-slate-400">
            Menunggu Pemenang Final
          </p>
        </div>
      )}

      {/* Runner-Up */}
      <div className="mt-3 pt-3 border-t border-amber-100 text-left">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
          <Medal size={12} className="text-slate-400" />
          <span>🥈 RUNNER-UP (JUARA 2)</span>
        </span>
        {runnerUpTeam ? (
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-800">{runnerUpTeam.name}</p>
            <p className="text-[10px] text-slate-500">{runnerUpTeam.player1} &amp; {runnerUpTeam.player2}</p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Menunggu Runner-Up Final
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Trophy size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Bagan Fase Gugur (Semifinal &amp; Final)
              </h3>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#91008D] border border-amber-300">
                Sistem Gugur • 30 Poin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Skema resmi: <strong className="text-slate-800">Juara Grup A vs Runner-up Grup B</strong> dan <strong className="text-slate-800">Juara Grup B vs Runner-up Grup A</strong>
            </p>
          </div>
        </div>

        {/* View Switcher & Category Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBracketViewMode('tree')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                bracketViewMode === 'tree'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan bagan pohon lengkap dengan garis penghubung"
            >
              <GitBranch size={13} className="text-[#00E0BA]" />
              <span>Bagan Pohon (Garis)</span>
            </button>
            <button
              type="button"
              onClick={() => setBracketViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                bracketViewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan kartu babak bersusun"
            >
              <ListOrdered size={13} className="text-slate-600" />
              <span>Daftar Babak</span>
            </button>
          </div>

          {/* Category Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveCategory('MD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'MD'
                  ? 'bg-[#00E0BA] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🦱 Ganda Putra (MD)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('WD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'WD'
                  ? 'bg-[#FF3483] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩‍🦱 Ganda Putri (WD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Information Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[#00E0BA] shrink-0" />
          <span>
            Peringkat 1 &amp; 2 grup otomatis dihubungkan ke babak Semifinal berdasarkan <strong>Poin Menang</strong> dan <strong>Selisih Poin (+/-)</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-blue-200 text-[#00E0BA]">
            SF1: 1A vs 2B
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-blue-200 text-[#00E0BA]">
            SF2: 1B vs 2A
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: BAGAN POHON LENGKAP DENGAN GARIS PENGHUBUNG (BRACKET TREE)        */}
      {/* ========================================================================= */}
      {bracketViewMode === 'tree' && (
        <div className="space-y-2">
          {/* Mobile/Tablet Swipe Hint */}
          <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="text-base">👉</span>
              <span>Geser ke kanan untuk melihat alur garis Semifinal ➔ Final ➔ Juara</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scroll ➔</span>
          </div>

          <div className="overflow-x-auto pb-4 pt-1 -mx-2 sm:mx-0 px-2 sm:px-0 scrollbar-thin">
            <div className="min-w-[1060px]">
              {/* STAGE HEADERS ROW */}
              <div className="grid grid-cols-[340px_84px_340px_84px_280px] gap-0 mb-3 px-1">
                {/* Header Semifinal */}
                <div className="flex items-center justify-between pr-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Swords size={14} className="text-[#00E0BA]" />
                    <span>Babak Semifinal</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    2 Laga • 30 Poin
                  </span>
                </div>

                {/* Connector Header 1 */}
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                    <span>Lolos</span>
                    <ArrowRight size={10} />
                  </span>
                </div>

                {/* Header Grand Final */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-500" />
                    <span>Partai Puncak (FINAL)</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Penentuan Juara
                  </span>
                </div>

                {/* Connector Header 2 */}
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-0.5">
                    <span>Juara</span>
                    <Trophy size={10} />
                  </span>
                </div>

                {/* Header Podium */}
                <div className="flex items-center justify-between pl-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Medal size={14} className="text-amber-500" />
                    <span>Podium Kejuaraan</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Juara 1 &amp; 2
                  </span>
                </div>
              </div>

              {/* 2-ROW CSS GRID BRACKET DENGAN GARIS PENGHUBUNG ALIGNED 100% */}
              <div className="grid grid-cols-[340px_84px_340px_84px_280px] grid-rows-[1fr_1fr] items-stretch gap-0 relative">
                
                {/* 1. ROW 1, COL 1: SEMIFINAL 1 CARD */}
                <div className="p-1 flex items-center">
                  <div className="w-full">
                    {renderBracketMatchCard(
                      'SEMIFINAL 1',
                      '1A vs 2B',
                      sf1Match,
                      rank1GroupA,
                      rank2GroupB,
                      '1A',
                      '2B',
                      'SF1',
                      'Lapangan 1'
                    )}
                  </div>
                </div>

                {/* 2. ROW 2, COL 1: SEMIFINAL 2 CARD */}
                <div className="p-1 flex items-center col-start-1 row-start-2">
                  <div className="w-full">
                    {renderBracketMatchCard(
                      'SEMIFINAL 2',
                      '1B vs 2A',
                      sf2Match,
                      rank1GroupB,
                      rank2GroupA,
                      '1B',
                      '2A',
                      'SF2',
                      'Lapangan 2'
                    )}
                  </div>
                </div>

                {/* 3. COL 2 (ROW-SPAN-2): GARIS PENGHUBUNG SEMIFINAL KE FINAL */}
                <div className="col-start-2 row-start-1 row-span-2 relative self-stretch flex items-center justify-center">
                  <svg 
                    className="w-full h-full overflow-visible" 
                    viewBox="0 0 84 100" 
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    {/* Shadow / Glow Filter */}
                    <defs>
                      <filter id="sfGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#00E0BA" floodOpacity="0.45"/>
                      </filter>
                    </defs>

                    {/* SF1 Top Branch: (0, 25) -> (42, 25) -> (42, 50) */}
                    {/* Base track */}
                    <path 
                      d="M 0 25 H 34 Q 42 25 42 33 V 50" 
                      stroke="#CBD5E1" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Active highlighted SF1 line */}
                    <path 
                      d="M 0 25 H 34 Q 42 25 42 33 V 50" 
                      stroke={sf1Winner ? '#00E0BA' : sf1Match?.status === 'live' ? '#FF3483' : '#94A3B8'} 
                      strokeWidth={sf1Winner ? '4' : '3'} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      vectorEffect="non-scaling-stroke"
                      filter={sf1Winner ? 'url(#sfGlow)' : undefined}
                    />

                    {/* SF2 Bottom Branch: (0, 75) -> (42, 75) -> (42, 50) */}
                    {/* Base track */}
                    <path 
                      d="M 0 75 H 34 Q 42 75 42 67 V 50" 
                      stroke="#CBD5E1" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Active highlighted SF2 line */}
                    <path 
                      d="M 0 75 H 34 Q 42 75 42 67 V 50" 
                      stroke={sf2Winner ? (activeCategory === 'WD' ? '#FF3483' : '#00E0BA') : sf2Match?.status === 'live' ? '#FF3483' : '#94A3B8'} 
                      strokeWidth={sf2Winner ? '4' : '3'} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      vectorEffect="non-scaling-stroke"
                      filter={sf2Winner ? 'url(#sfGlow)' : undefined}
                    />

                    {/* Stem Line: dari Junction (42, 50) ke Final Card (84, 50) */}
                    <path 
                      d="M 42 50 H 84" 
                      stroke={sf1Winner && sf2Winner ? '#059669' : (sf1Winner || sf2Winner ? '#00E0BA' : '#94A3B8')} 
                      strokeWidth={sf1Winner && sf2Winner ? '4' : '3'} 
                      strokeLinecap="round" 
                      vectorEffect="non-scaling-stroke" 
                    />

                    {/* Arrowhead polygon masuk ke Final */}
                    <polygon 
                      points="76,46 84,50 76,54" 
                      fill={sf1Winner && sf2Winner ? '#059669' : (sf1Winner || sf2Winner ? '#00E0BA' : '#64748B')} 
                    />

                    {/* Exit Nodes */}
                    <circle cx="0" cy="25" r="4" fill={sf1Winner ? '#00E0BA' : '#64748B'} />
                    <circle cx="0" cy="75" r="4" fill={sf2Winner ? (activeCategory === 'WD' ? '#FF3483' : '#00E0BA') : '#64748B'} />

                    {/* Central Junction Node */}
                    <circle 
                      cx="42" 
                      cy="50" 
                      r={sf1Winner && sf2Winner ? '6' : '5'} 
                      fill={sf1Winner && sf2Winner ? '#059669' : (sf1Winner || sf2Winner ? '#00E0BA' : '#64748B')} 
                      stroke="#FFFFFF" 
                      strokeWidth="2" 
                    />
                  </svg>

                  {/* Junction VS Badge in HTML */}
                  <div className="absolute top-1/2 left-[42px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-0.5 border ${
                      sf1Winner && sf2Winner 
                        ? 'bg-emerald-600 text-white border-emerald-400' 
                        : (sf1Winner || sf2Winner) 
                        ? 'bg-[#00E0BA] text-white border-blue-300' 
                        : 'bg-slate-700 text-white border-slate-600'
                    }`}>
                      <span>VS</span>
                    </span>
                  </div>
                </div>

                {/* 4. COL 3 (ROW-SPAN-2): GRAND FINAL CARD */}
                <div className="col-start-3 row-start-1 row-span-2 p-1 flex items-center justify-center">
                  <div className="w-full">
                    {renderBracketMatchCard(
                      'GRAND FINAL',
                      'Finalis Puncak',
                      finalMatch,
                      sf1Winner,
                      sf2Winner,
                      'SF1',
                      'SF2',
                      'FINAL',
                      'Lapangan Utama'
                    )}
                  </div>
                </div>

                {/* 5. COL 4 (ROW-SPAN-2): GARIS PENGHUBUNG FINAL KE PODIUM */}
                <div className="col-start-4 row-start-1 row-span-2 relative self-stretch flex items-center justify-center">
                  <svg 
                    className="w-full h-full overflow-visible" 
                    viewBox="0 0 84 100" 
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <defs>
                      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F59E0B" floodOpacity="0.6"/>
                      </filter>
                    </defs>

                    {/* Garis Horizontal dari Final (0, 50) ke Podium (84, 50) */}
                    <path 
                      d="M 0 50 H 84" 
                      stroke={championTeam ? '#F59E0B' : '#CBD5E1'} 
                      strokeWidth={championTeam ? '4.5' : '3'} 
                      strokeDasharray={championTeam ? 'none' : '5 3'} 
                      strokeLinecap="round" 
                      vectorEffect="non-scaling-stroke"
                      filter={championTeam ? 'url(#goldGlow)' : undefined}
                    />

                    {/* Arrow Head masuk ke Podium */}
                    <polygon 
                      points="76,45 84,50 76,55" 
                      fill={championTeam ? '#F59E0B' : '#94A3B8'} 
                    />

                    {/* Exit Node dari Final Card */}
                    <circle cx="0" cy="50" r="4" fill={championTeam ? '#F59E0B' : '#64748B'} />
                  </svg>

                  {/* Floating Trophy Badge in HTML */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <div className={`p-1.5 rounded-full shadow-sm flex items-center justify-center border transition-all ${
                      championTeam 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/50 animate-pulse' 
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}>
                      <Trophy size={14} className={championTeam ? 'text-amber-600' : 'text-slate-400'} />
                    </div>
                  </div>
                </div>

                {/* 6. COL 5 (ROW-SPAN-2): PODIUM JUARA */}
                <div className="col-start-5 row-start-1 row-span-2 p-1 flex items-center justify-center">
                  <div className="w-full">
                    {renderPodiumCard()}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TAMPILAN DAFTAR KARTU BERSUSUN DENGAN GARIS PENGHUBUNG            */}
      {/* ========================================================================= */}
      {bracketViewMode === 'cards' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* SEMIFINALS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Swords size={14} className="text-[#00E0BA]" />
                <span>Babak Semifinal</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">1A vs 2B &amp; 1B vs 2A</span>
            </div>

            {renderBracketMatchCard(
              'SEMIFINAL 1',
              '1A vs 2B',
              sf1Match,
              rank1GroupA,
              rank2GroupB,
              '1A',
              '2B',
              'SF1',
              'Lapangan 1'
            )}

            {renderBracketMatchCard(
              'SEMIFINAL 2',
              '1B vs 2A',
              sf2Match,
              rank1GroupB,
              rank2GroupA,
              '1B',
              '2A',
              'SF2',
              'Lapangan 2'
            )}
          </div>

          {/* CONNECTOR: SEMIFINAL KE FINAL */}
          <div className="flex flex-col items-center py-2 relative">
            <div className="w-1 h-6 bg-gradient-to-b from-[#00E0BA] to-[#00E0BA] rounded-full" />
            <div className="px-4 py-2 bg-blue-50 border-2 border-[#00E0BA] rounded-full text-xs font-black uppercase tracking-wider text-[#00E0BA] flex items-center gap-2 shadow-xs">
              <GitBranch size={14} />
              <span>Pemenang Semifinal Lolos ke Babak Final</span>
              <ArrowDown size={14} />
            </div>
            <div className="w-1 h-6 bg-gradient-to-b from-[#00E0BA] to-amber-500 rounded-full" />
          </div>

          {/* GRAND FINAL SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-500" />
                <span>Partai Puncak (FINAL)</span>
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Pemenang SF1 vs SF2
              </span>
            </div>

            {renderBracketMatchCard(
              'GRAND FINAL',
              'Finalis Puncak',
              finalMatch,
              sf1Winner,
              sf2Winner,
              'SF1',
              'SF2',
              'FINAL',
              'Lapangan Utama'
            )}
          </div>

          {/* CONNECTOR: FINAL KE PODIUM */}
          <div className="flex flex-col items-center py-2">
            <div className="w-1 h-6 bg-amber-400 rounded-full" />
            <div className="px-4 py-2 bg-amber-50 border-2 border-amber-400 rounded-full text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2 shadow-xs">
              <Trophy size={14} className="text-amber-600" />
              <span>Pemenang Final Menjadi Juara Turnamen</span>
              <ArrowDown size={14} />
            </div>
            <div className="w-1 h-6 bg-amber-400 rounded-full" />
          </div>

          {/* PODIUM KEJUARAAN */}
          <div>
            {renderPodiumCard()}
          </div>
        </div>
      )}
    </div>
  );
};
