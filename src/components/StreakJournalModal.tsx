import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Grid,
  Flame,
  CheckCircle2,
  Lock,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Camera,
} from 'lucide-react';
import { Checkin, Profile } from '../types';
import { StreakStats } from '../services/store';

interface StreakJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkins: Checkin[];
  currentUser: Profile;
  stats: StreakStats;
  initialTab?: 'grid' | 'calendar';
}

export const StreakJournalModal: React.FC<StreakJournalModalProps> = ({
  isOpen,
  onClose,
  checkins,
  currentUser: _currentUser,
  stats,
  initialTab = 'grid',
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'calendar'>(initialTab);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);

  // Sort checkins: newest first for the grid
  const sortedCheckins = useMemo(() => {
    return [...checkins].sort((a, b) => b.checkinDate.localeCompare(a.checkinDate));
  }, [checkins]);

  // Map of checkins by dayNumber for calendar lookup
  const checkinByDay = useMemo(() => {
    const map = new Map<number, Checkin>();
    checkins.forEach((c) => {
      map.set(c.dayNumber, c);
    });
    return map;
  }, [checkins]);

  // Today's challenge day index (1..21)
  const currentChallengeDay = Math.min(
    21,
    stats.currentStreak + (stats.hasCheckedInToday ? 0 : 1)
  );

  // If modal is not open, do not render
  if (!isOpen) return null;

  // Previous and next checkin navigation in detail view
  const currentDetailIndex = selectedCheckin
    ? sortedCheckins.findIndex((c) => c.id === selectedCheckin.id)
    : -1;

  const handlePrevDetail = () => {
    if (currentDetailIndex > 0) {
      setSelectedCheckin(sortedCheckins[currentDetailIndex - 1]);
    }
  };

  const handleNextDetail = () => {
    if (currentDetailIndex !== -1 && currentDetailIndex < sortedCheckins.length - 1) {
      setSelectedCheckin(sortedCheckins[currentDetailIndex + 1]);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#140D11] border border-[#BE123C]/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-[#E11D48]/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-[#BE123C]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* ------------------------------------------------------------- */}
        {/* Header                                                        */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E11D48]/20 border border-[#BE123C]/40 text-[11px] font-semibold text-[#FB7185]">
                <Flame className="w-3 h-3 text-[#F5D061]" />
                <span>Streak Journal</span>
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {checkins.length} {checkins.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <h2 id="journal-modal-title" className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              My Streak Journal
            </h2>
            <p className="text-xs text-stone-300">
              Your private photographic timeline for the 21-day consistency ritual
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/10"
            aria-label="Close Streak Journal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Tab Switcher: Photo Grid vs 21-Day Calendar                   */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 px-4 sm:px-6 pt-3 pb-2 border-b border-white/5 bg-[#170E13]/80 flex items-center justify-between gap-3 shrink-0">
          <div className="inline-flex p-1 bg-black/40 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                activeTab === 'grid'
                  ? 'bg-gradient-to-r from-[#BE123C] to-[#E11D48] text-white shadow-[0_2px_10px_rgba(225,29,72,0.4)]'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Photo Grid</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                {checkins.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-[#BE123C] to-[#E11D48] text-white shadow-[0_2px_10px_rgba(225,29,72,0.4)]'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>21-Day Calendar</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                Day {currentChallengeDay}/21
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FB7185]" />
            <span>Strictly Private to You</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Scrollable Content Body                                       */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: COMPACT RESPONSIVE PHOTO GRID */}
          {activeTab === 'grid' && (
            <div>
              {sortedCheckins.length === 0 ? (
                <div className="py-14 px-4 text-center space-y-3 bg-[#1C1216]/50 rounded-3xl border border-white/5">
                  <div className="w-14 h-14 rounded-2xl bg-[#2B0813] text-[#FB7185] flex items-center justify-center mx-auto border border-[#BE123C]/30">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No journal entries yet</h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Once you upload a daily check-in photo on the challenge screen, your photo and caption will appear here in your private grid.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>
                      Tap any photo thumbnail to inspect details & reflection
                    </span>
                    <span className="font-mono text-[11px] text-[#FDA4AF]">
                      {sortedCheckins.length} of 21 Days
                    </span>
                  </div>

                  {/* Responsive Grid: 3 cols on mobile, 2 cols on narrow screens (<360px), 4 on md, 5 on lg */}
                  <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {sortedCheckins.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCheckin(item)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-black/60 border border-[#BE123C]/30 hover:border-[#E11D48] transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                      >
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.caption || `Day ${item.dayNumber} check-in`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1C1216] text-stone-500 p-2">
                            <Camera className="w-6 h-6 mb-1 opacity-40" />
                            <span className="text-[10px]">Photo</span>
                          </div>
                        )}

                        {/* Top Gradient Overlay */}
                        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />

                        {/* Bottom Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                        {/* Top Badge: Day Number */}
                        <div className="absolute top-2 left-2 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-bold font-mono text-white flex items-center gap-1 shadow-sm">
                            <Flame className="w-2.5 h-2.5 text-[#F5D061]" />
                            <span>Day {item.dayNumber}</span>
                          </span>
                        </div>

                        {/* Bottom Info: Date stamp & Caption excerpt */}
                        <div className="absolute bottom-1.5 inset-x-2 pointer-events-none">
                          <p className="text-[10px] font-mono font-medium text-stone-200 truncate">
                            {item.checkinDate}
                          </p>
                          {item.caption && (
                            <p className="text-[9px] text-stone-400 line-clamp-1 italic leading-tight">
                              {item.caption}
                            </p>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-[#BE123C]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 21-DAY CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Calendar header explanation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">21-Day Ritual Progress</p>
                  <p className="text-stone-400 text-[11px]">
                    Complete 21 consecutive days to unlock dating matches. Tap any completed day to view its photo.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] shrink-0 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Completed
                  </span>
                  <span className="flex items-center gap-1 text-[#FB7185]">
                    <span className="w-2 h-2 rounded-full bg-[#E11D48] inline-block animate-pulse" />
                    Today
                  </span>
                  <span className="flex items-center gap-1 text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-stone-700 inline-block" />
                    Upcoming
                  </span>
                </div>
              </div>

              {/* 21 Days Grid: 3 columns on small screens, 7 columns on md/lg */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5 sm:gap-3">
                  {Array.from({ length: 21 }, (_, index) => {
                    const dayNum = index + 1;
                    const checkin = checkinByDay.get(dayNum);
                    const isCompleted = !!checkin;
                    const isCurrent = dayNum === currentChallengeDay && !stats.hasCheckedInToday;
                    const isUpcoming = dayNum > currentChallengeDay;
                    const isPastMissed = dayNum < currentChallengeDay && !isCompleted;

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        disabled={!isCompleted}
                        onClick={() => {
                          if (checkin) setSelectedCheckin(checkin);
                        }}
                        className={`relative rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all min-h-[90px] sm:min-h-[105px] border text-left ${
                          isCompleted
                            ? 'bg-[#1C1216] hover:bg-[#25171E] border-[#BE123C]/50 hover:border-[#E11D48] cursor-pointer shadow-sm hover:shadow-[0_4px_16px_rgba(225,29,72,0.3)]'
                            : isCurrent
                            ? 'bg-[#2B0813]/80 border-[#E11D48] ring-2 ring-[#E11D48]/30 shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-default'
                            : isPastMissed
                            ? 'bg-amber-950/20 border-amber-800/30 text-stone-500 cursor-not-allowed opacity-75'
                            : 'bg-black/30 border-white/5 text-stone-600 cursor-not-allowed'
                        }`}
                      >
                        {/* Top Row: Day Number + Status Badge */}
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span
                            className={`text-xs font-mono font-bold ${
                              isCompleted
                                ? 'text-white'
                                : isCurrent
                                ? 'text-[#FDA4AF]'
                                : 'text-stone-500'
                            }`}
                          >
                            Day {dayNum}
                          </span>

                          {isCompleted ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : isCurrent ? (
                            <span className="w-5 h-5 rounded-full bg-[#E11D48]/30 text-[#FB7185] flex items-center justify-center animate-pulse">
                              <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
                            </span>
                          ) : isUpcoming ? (
                            <span className="w-5 h-5 rounded-full bg-white/5 text-stone-600 flex items-center justify-center">
                              <Lock className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                              <Clock className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Middle: Mini Photo Thumbnail if completed, or status label */}
                        <div className="my-1.5 w-full flex items-center justify-center">
                          {isCompleted && checkin?.photoUrl ? (
                            <div className="relative w-full h-10 sm:h-12 rounded-lg overflow-hidden bg-black border border-white/10">
                              <img
                                src={checkin.photoUrl}
                                alt={`Day ${dayNum}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-full py-1.5 px-1 rounded-lg bg-[#E11D48]/20 border border-[#BE123C]/40 text-center">
                              <span className="text-[10px] font-bold text-[#FDA4AF] uppercase tracking-wider block">
                                Today
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-10 sm:h-12 rounded-lg border border-dashed border-white/5 flex items-center justify-center">
                              <span className="text-[10px] text-stone-600 font-mono">
                                {isUpcoming ? 'Locked' : 'Missed'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Row: Date label or helper text */}
                        <div className="w-full text-[10px] font-mono truncate">
                          {isCompleted && checkin ? (
                            <span className="text-stone-300 hover:text-white flex items-center justify-between">
                              <span className="truncate">{checkin.checkinDate}</span>
                              <span className="text-[9px] text-[#FDA4AF]">View</span>
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[#FDA4AF] font-sans text-[10px]">
                              Awaiting photo
                            </span>
                          ) : (
                            <span className="text-stone-600">—</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Footer: Privacy reassurance                                    */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 px-4 sm:px-6 py-3 bg-[#110A0E] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FB7185] shrink-0" />
            <span className="text-[11px] leading-tight">
              Strictly private: Only you can view your streak journal.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
          >
            Close Journal
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Photo Detail View Modal (Opens when tapping thumbnail)        */}
      {/* ------------------------------------------------------------- */}
      {selectedCheckin && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setSelectedCheckin(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#150D11] border border-[#BE123C]/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto"
          >
            {/* Top Bar with Navigation & Close */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#FB7185] bg-[#2B0813] px-3 py-1 rounded-full border border-[#BE123C]/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#F5D061]" />
                  <span>Day {selectedCheckin.dayNumber} of 21</span>
                </span>
                <span className="text-xs text-stone-300 font-mono">
                  {selectedCheckin.checkinDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Previous post button */}
                <button
                  type="button"
                  onClick={handlePrevDetail}
                  disabled={currentDetailIndex <= 0}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  aria-label="Previous photo"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Next post button */}
                <button
                  type="button"
                  onClick={handleNextDetail}
                  disabled={currentDetailIndex === -1 || currentDetailIndex >= sortedCheckins.length - 1}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  aria-label="Next photo"
                  title="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCheckin(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ml-1 cursor-pointer"
                  aria-label="Close detail view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Uncropped Full Photo Container */}
            {selectedCheckin.photoUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 max-h-[50vh] sm:max-h-[55vh]">
                <img
                  src={selectedCheckin.photoUrl}
                  alt={selectedCheckin.caption || `Day ${selectedCheckin.dayNumber} check-in`}
                  className="w-full h-auto max-h-[50vh] sm:max-h-[55vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Caption & Metadata */}
            <div className="space-y-3 pt-1">
              <div>
                <h3 id="detail-modal-title" className="text-base font-bold text-white font-display">
                  {selectedCheckin.hobbyName}
                </h3>
              </div>

              {selectedCheckin.caption ? (
                <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20">
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed italic">
                    "{selectedCheckin.caption}"
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <p className="text-xs text-stone-500 italic">No caption was provided for this check-in.</p>
                </div>
              )}

              {/* Bottom Details Bar */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-white/5 gap-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>
                    Logged at{' '}
                    {new Date(selectedCheckin.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Streak Validated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
