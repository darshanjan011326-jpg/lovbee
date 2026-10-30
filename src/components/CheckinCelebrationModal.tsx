import React from 'react';
import { Sparkles, Flame, CheckCircle2, Award, Heart, X, ArrowRight } from 'lucide-react';
import { LovbeeLogo } from './LovbeeLogo';
import { StreakStats } from '../services/store';

interface CheckinCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StreakStats;
  dayNumber: number;
  hobbyName: string;
  onViewCalendar?: () => void;
}

export const CheckinCelebrationModal: React.FC<CheckinCelebrationModalProps> = ({
  isOpen,
  onClose,
  stats,
  dayNumber,
  hobbyName,
  onViewCalendar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#160D12] border border-[#BE123C]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(225,29,72,0.4)] overflow-hidden text-center">
        {/* Subtle background crimson ambient flare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#E11D48]/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#881337]/35 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Rings Emblem with Lovbee Official Logo */}
        <div className="relative flex items-center justify-center pt-2">
          {/* Animated pulse rings */}
          <div className="absolute w-32 h-32 rounded-full bg-[#E11D48]/25 animate-ping opacity-60 pointer-events-none" />
          <div className="absolute w-40 h-40 rounded-full border border-[#E11D48]/40 animate-pulse pointer-events-none" />

          {/* Glowing Red Card Container with Official Logo */}
          <div className="relative z-10 p-3 rounded-3xl bg-gradient-to-b from-[#2B0813] to-[#12080B] border border-[#BE123C]/70 shadow-[0_0_40px_rgba(225,29,72,0.6)]">
            <LovbeeLogo size="lg" showWordmark={false} />
          </div>
        </div>

        {/* Headline & Confirmation */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/20 border border-[#E11D48]/40 text-xs font-semibold text-[#FB7185]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Check-in Logged Successfully!</span>
          </div>

          <h3 className="text-2xl font-bold font-display text-white tracking-tight">
            Day {dayNumber} Complete
          </h3>

          <p className="text-xs text-stone-300 leading-relaxed max-w-xs mx-auto">
            You dedicated time to <strong className="text-white font-semibold">{hobbyName}</strong> today. Real consistency is irresistible.
          </p>
        </div>

        {/* Streak & Stats Showcase */}
        <div className="grid grid-cols-2 gap-3 relative z-10 text-left">
          {/* Current Streak */}
          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FB7185]" />
              <span>Current Streak</span>
            </span>
            <p className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
              <span>{stats.currentStreak}</span>
              <span className="text-xs text-stone-400 font-sans font-normal">days</span>
            </p>
            <p className="text-[10px] text-[#FDA4AF]">Consecutive daily turn ✓</p>
          </div>

          {/* Longest Streak */}
          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#FB7185]" />
              <span>Personal Best</span>
            </span>
            <p className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
              <span>{stats.longestStreak}</span>
              <span className="text-xs text-stone-400 font-sans font-normal">days</span>
            </p>
            <p className="text-[10px] text-stone-400">Permanently saved</p>
          </div>
        </div>

        {/* 21-Day Overall Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>21-Day Ritual Progress</span>
            <span className="font-mono text-white font-bold">
              {stats.completedDaysCount} / 21 Days ({stats.progressPercent}%)
            </span>
          </div>

          <div className="h-2.5 w-full bg-[#1C1216] rounded-full overflow-hidden border border-[#BE123C]/20 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF] rounded-full transition-all duration-700 shadow-[0_0_10px_#E11D48]"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-stone-400 pt-0.5">
            {stats.isUnlocked
              ? '✨ 21-Day Consistency Verified! Passionate Craftsman prestige unlocked on Discover.'
              : `${stats.remainingDays} more days to unlock verified discovery prestige.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          {onViewCalendar && (
            <button
              onClick={() => {
                onClose();
                onViewCalendar();
              }}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold transition-colors"
            >
              View Calendar
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Buzzing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
