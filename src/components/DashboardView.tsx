import React, { useState } from 'react';
import {
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  Heart,
  ArrowRight,
  MessageSquare,
  Users,
  Compass,
  Camera,
  Check,
} from 'lucide-react';
import { Profile } from '../types';
import { store, StreakStats } from '../services/store';
import { CheckinCelebrationModal } from './CheckinCelebrationModal';
import { CreateSnapModal } from './CreateSnapModal';

interface DashboardViewProps {
  currentUser: Profile;
  onNavigate: (tab: any) => void;
  onOpenCheckinModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const challenge = currentUser.challenge;
  const stats: StreakStats = store.getStreakStats(currentUser.id);
  const canCheckin = store.canCheckinToday();
  const topMatches = store.getDiscoverProfiles().slice(0, 3);
  const pendingRequests = store.getConnectionRequests();
  const connections = store.getConnections();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateSnapModalOpen, setIsCreateSnapModalOpen] = useState(false);

  const currentChallengeDay = Math.min(
    21,
    stats.currentStreak + (stats.hasCheckedInToday ? 0 : 1)
  );
  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    stats: StreakStats;
    dayNumber: number;
    hobbyName: string;
  }>({
    isOpen: false,
    stats,
    dayNumber: stats.completedDaysCount || 1,
    hobbyName: challenge?.focusHobbyName || currentUser.hobbies[0]?.name || 'Wheel-thrown Ceramics',
  });

  const handleOneTapCheckin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await store.submitCheckin({
        hobbyName: challenge?.focusHobbyName || currentUser.hobbies[0]?.name || 'Wheel-thrown Ceramics',
        activitySummary: `Dedicated time to ${challenge?.focusHobbyName || currentUser.hobbies[0]?.name || 'craft'}`,
      });
      setIsSubmitting(false);
      if (res.success && res.stats) {
        setCelebrationState({
          isOpen: true,
          stats: res.stats,
          dayNumber: res.stats.completedDaysCount,
          hobbyName: challenge?.focusHobbyName || currentUser.hobbies[0]?.name || 'Wheel-thrown Ceramics',
        });
      }
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Strip with Ambient Crimson Glow */}
      <div className="bg-[#150D11] rounded-3xl border border-[#BE123C]/25 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E11D48]/15 blur-[100px] pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
            alt={currentUser.displayName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#BE123C]/50 shadow-md shrink-0"
          />

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
              <Sparkles className="w-3.5 h-3.5 text-[#FDA4AF]" />
              <span>Welcome back, {currentUser.displayName.split(' ')[0]}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Find your buzz. Feel the love.
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-sans">
              Focusing on <strong className="text-white font-semibold">{challenge?.focusHobbyName || 'your authentic passions'}</strong>.
              Showing up with consistent dedication attracts singles with genuine emotional availability.
            </p>
          </div>
        </div>

        {/* Challenge Action Button */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-2 w-full md:w-auto relative z-10">
          {canCheckin.allowed ? (
            <button
              onClick={() => setIsCreateSnapModalOpen(true)}
              className="w-full md:w-auto px-7 py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] rounded-2xl shadow-[0_0_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Camera className="w-4 h-4 text-[#FDA4AF]" />
              <span>Create Snap & Check In</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl bg-[#1C1216] text-emerald-400 text-xs flex items-center gap-2 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Today's check-in complete</span>
            </div>
          )}
          <span className="text-[11px] text-stone-400 font-mono">
            {stats.completedDaysCount} of 21 days logged · Streak: <strong className="text-white">{stats.currentStreak}d</strong> (Best: {stats.longestStreak}d)
          </span>
        </div>
      </div>

      {/* Visual 21-Circle Challenge Progress Component */}
      <section
        aria-label="21-Day Challenge Progress Grid"
        className="bg-[#150D11] rounded-3xl border border-[#BE123C]/30 p-5 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#E11D48]/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
              <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>21-Circle Challenge Progress</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              Your 21-Day Consistency Journey
            </h2>
            <p className="text-xs text-stone-300">
              Complete 21 consecutive days of dedicated craft practice to verify your authenticity and unlock dating matches.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canCheckin.allowed ? (
              <button
                onClick={() => setIsCreateSnapModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs hover:from-[#E11D48] hover:to-[#BE123C] transition-all flex items-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#FDA4AF]" />
                <span>Create Snap</span>
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Day {stats.completedDaysCount} Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* 21-Circle Grid: 7 columns x 3 rows (Week 1, Week 2, Week 3) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3.5 relative z-10">
          {Array.from({ length: 21 }, (_, index) => {
            const dayNum = index + 1;
            const isCompleted = dayNum <= stats.completedDaysCount;
            const isCurrentDay = dayNum === currentChallengeDay && !stats.hasCheckedInToday;

            return (
              <div
                key={dayNum}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 min-h-[70px] sm:min-h-[82px] ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#2B0813] via-[#1F0C15] to-[#150D11] border-[#E11D48]/50 shadow-[0_0_12px_rgba(225,29,72,0.25)]'
                    : isCurrentDay
                    ? 'bg-[#2B0813] border-[#E11D48] ring-2 ring-[#E11D48] ring-offset-2 ring-offset-[#150D11] shadow-[0_0_20px_rgba(225,29,72,0.5)]'
                    : 'bg-[#12080B]/60 border-white/5 opacity-60'
                }`}
              >
                {/* Visual Circle Node */}
                <div
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm transition-transform shadow-inner ${
                    isCompleted
                      ? 'bg-gradient-to-tr from-[#BE123C] via-[#E11D48] to-[#FDA4AF] text-white shadow-md'
                      : isCurrentDay
                      ? 'bg-gradient-to-tr from-[#E11D48] to-[#F5D061] text-white animate-pulse shadow-[0_0_15px_#E11D48]'
                      : 'bg-[#1E1116] text-stone-500 border border-white/10'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
                  ) : isCurrentDay ? (
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <span>{dayNum}</span>
                  )}
                </div>

                {/* Sub-label */}
                <span
                  className={`text-[9px] sm:text-[10px] font-mono mt-1 font-semibold ${
                    isCompleted
                      ? 'text-[#FDA4AF]'
                      : isCurrentDay
                      ? 'text-white font-bold'
                      : 'text-stone-500'
                  }`}
                >
                  {isCurrentDay ? 'Today' : `D${dayNum}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend & Stats Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-3 border-t border-white/10 relative z-10">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#BE123C] to-[#E11D48] shadow-[0_0_6px_#E11D48]" />
              <span className="text-white font-medium">Completed ({stats.completedDaysCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#E11D48] to-[#F5D061] ring-2 ring-[#E11D48]/50 animate-pulse" />
              <span className="text-white font-medium">
                {stats.hasCheckedInToday ? 'Today Done' : `Today (Day ${currentChallengeDay})`}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1E1116] border border-white/20" />
              <span>Upcoming ({Math.max(0, 21 - stats.completedDaysCount)})</span>
            </span>
          </div>

          <button
            onClick={() => onNavigate('challenge')}
            className="text-xs font-semibold text-[#FB7185] hover:text-[#FDA4AF] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open Full Challenge View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Grid: 3 Key Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 21-Day Ritual Tracker */}
        <div className="bg-[#150D11] rounded-3xl border border-[#BE123C]/20 p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FB7185]" />
                21-Day Consistency
              </span>
              <span className="text-xs font-mono font-bold text-[#FB7185] tabular-nums">
                {stats.progressPercent}%
              </span>
            </div>

            <div className="w-full h-2 bg-[#1C1216] rounded-full overflow-hidden border border-[#BE123C]/20">
              <div
                className="h-full bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF] rounded-full transition-all duration-500 shadow-[0_0_8px_#E11D48]"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-white flex items-center justify-between">
                <span>{challenge?.focusHobbyName || 'Craft Ritual'}</span>
                <span className="font-mono text-stone-400">{stats.completedDaysCount}/21 Days</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                <span>Current Streak: <strong className="text-white">{stats.currentStreak}d</strong></span>
                <span>Longest: <strong className="text-white">{stats.longestStreak}d</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              {stats.isUnlocked ? 'Unlocked · Full Verified Access' : `${stats.remainingDays} days remaining`}
            </span>
            <button
              onClick={() => onNavigate('challenge')}
              className="text-xs font-semibold text-[#FB7185] hover:text-[#FDA4AF] flex items-center gap-1 cursor-pointer"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Sparks & Likes */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#FB7185] fill-current" />
                Sparks & Admirers
              </span>
              <span className="text-xs font-mono font-bold text-[#FB7185]">
                {pendingRequests.length} pending
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-2">
              <p className="text-xs text-stone-300">
                {pendingRequests.length > 0
                  ? `${pendingRequests[0].senderProfile.displayName} sent a note referencing your craft!`
                  : 'No pending sparks waiting for your review.'}
              </p>
              {pendingRequests.length > 0 && (
                <div className="flex items-center gap-2">
                  <img
                    src={pendingRequests[0].senderProfile.avatarUrl}
                    alt={pendingRequests[0].senderProfile.displayName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs text-white font-semibold">
                    {pendingRequests[0].senderProfile.displayName}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">Mutual connection required</span>
            <button
              onClick={() => onNavigate('likes')}
              className="text-xs font-semibold text-[#FB7185] hover:text-[#FDA4AF] flex items-center gap-1"
            >
              <span>Review Sparks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Connected Chats */}
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#F5D061]" />
                Conversations
              </span>
              <span className="text-xs font-mono font-bold text-stone-300">
                {connections.length} active
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 text-xs text-stone-300">
              {connections.length > 0 ? (
                <p className="line-clamp-2">
                  Latest with <strong className="text-white">{connections[0].partnerProfile.displayName}</strong>:{' '}
                  "{connections[0].lastMessage?.content || 'Started mutual connection'}"
                </p>
              ) : (
                <p className="text-stone-400">
                  Connect on Discover to start private conversations.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">Encrypted 1-on-1</span>
            <button
              onClick={() => onNavigate('messages')}
              className="text-xs font-semibold text-[#FB7185] hover:text-[#FDA4AF] flex items-center gap-1"
            >
              <span>Open Chats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Curated Singles Today</h2>
            <p className="text-xs text-stone-400">Aligned with your lifestyle and crafts</p>
          </div>
          <button
            onClick={() => onNavigate('discover')}
            className="text-xs font-semibold text-[#FB7185] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {topMatches.map(({ profile, compatibility }) => (
            <div
              key={profile.id}
              onClick={() => onNavigate('discover')}
              className="group cursor-pointer bg-[#151515] border border-white/10 hover:border-[#E11D48]/40 rounded-3xl overflow-hidden shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-[#1C1C1E] overflow-hidden">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30" />
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#E11D48] text-white font-mono text-[11px] font-bold shadow-xs">
                  {compatibility.score}% Spark
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-bold font-display text-white">
                    {profile.displayName}, {profile.age}
                  </h3>
                  <p className="text-xs text-stone-400">{profile.occupation}</p>
                </div>
              </div>

              <div className="p-4 space-y-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {profile.hobbies.slice(0, 2).map((h) => (
                    <span
                      key={h.hobbyId}
                      className="px-2 py-0.5 rounded-full bg-[#1C1C1E] border border-white/5 text-[10px] text-stone-300 font-medium"
                    >
                      {h.name}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 line-clamp-1 italic">
                  "{profile.bio}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Create Snap Modal */}
      <CreateSnapModal
        isOpen={isCreateSnapModalOpen}
        onClose={() => setIsCreateSnapModalOpen(false)}
        currentUser={currentUser}
        onSuccess={(checkin, updatedStats) => {
          setCelebrationState({
            isOpen: true,
            stats: updatedStats,
            dayNumber: updatedStats.completedDaysCount,
            hobbyName: checkin.hobbyName,
          });
        }}
      />

      {/* Confirmation Celebration Modal */}
      <CheckinCelebrationModal
        isOpen={celebrationState.isOpen}
        onClose={() => setCelebrationState({ ...celebrationState, isOpen: false })}
        stats={celebrationState.stats}
        dayNumber={celebrationState.dayNumber}
        hobbyName={celebrationState.hobbyName}
        onViewCalendar={() => {
          setCelebrationState({ ...celebrationState, isOpen: false });
          onNavigate('challenge');
        }}
      />
    </div>
  );
};
