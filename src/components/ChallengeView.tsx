import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Lock,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  X,
  FastForward,
  BookOpen,
  Grid,
  Image as ImageIcon,
} from 'lucide-react';
import { Profile, Checkin } from '../types';
import { store, getTodayDateString, StreakStats } from '../services/store';
import { CheckinCelebrationModal } from './CheckinCelebrationModal';
import { StreakJournalModal } from './StreakJournalModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import { CreateSnapModal } from './CreateSnapModal';

interface ChallengeViewProps {
  currentUser: Profile;
  onExploreMatches: () => void;
}

/**
 * Resizes and compresses an image client-side to ensure sharp, high-res photos
 * without blowing browser localStorage or network payload limits.
 */
async function compressImageFile(file: File, maxDimension = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  currentUser,
  onExploreMatches,
}) => {
  // Reactive subscription to ensure store updates immediately refresh the view
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const challenge = currentUser.challenge;
  const checkins = store.getUserCheckins(currentUser.id);
  const today = getTodayDateString();
  const stats: StreakStats = store.getStreakStats(currentUser.id);

  // Find today's checkin if already submitted
  const todayCheckin = checkins.find((c) => c.checkinDate === today);

  // Journal Modal State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalInitialTab, setJournalInitialTab] = useState<'grid' | 'calendar'>('grid');

  // Map of checkins by dayNumber for calendar lookup
  const checkinByDay = useMemo(() => {
    const map = new Map<number, Checkin>();
    checkins.forEach((c) => {
      map.set(c.dayNumber, c);
    });
    return map;
  }, [checkins]);

  // Current challenge day number (1..21)
  const currentChallengeDay = Math.min(
    21,
    stats.currentStreak + (stats.hasCheckedInToday ? 0 : 1)
  );

  // Upload & Form State
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoSourceType, setPhotoSourceType] = useState<'camera' | 'gallery' | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCreateSnapModalOpen, setIsCreateSnapModalOpen] = useState(false);
  const [caption, setCaption] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal inspection for past checkins
  const [inspectCheckin, setInspectCheckin] = useState<Checkin | null>(null);

  // File input refs
  const fileGalleryInputRef = useRef<HTMLInputElement>(null);
  const fileCameraInputRef = useRef<HTMLInputElement>(null);

  // Celebration Modal state
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

  const canCheckin = store.canCheckinToday();

  // Trigger Camera: launches interactive viewfinder modal or native camera capture
  const handleTakePhotoClick = () => {
    setErrorMsg(null);
    if (typeof navigator !== 'undefined' && 'mediaDevices' in navigator && typeof navigator.mediaDevices?.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else if (fileCameraInputRef.current) {
      fileCameraInputRef.current.click();
    } else {
      setErrorMsg('Camera access is not supported on this browser. Please use "Upload from Gallery".');
    }
  };

  // Trigger Gallery: opens device photo picker
  const handleUploadGalleryClick = () => {
    setErrorMsg(null);
    fileGalleryInputRef.current?.click();
  };

  // Received photo from live Camera modal
  const handlePhotoCapturedFromCamera = (dataUrl: string) => {
    setSelectedPhoto(dataUrl);
    setPhotoSourceType('camera');
    setErrorMsg(null);
  };

  // Handle file selection (Gallery or Camera fallback)
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    source: 'gallery' | 'camera'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP, or HEIC).');
      return;
    }

    setErrorMsg(null);
    setIsProcessingPhoto(true);

    try {
      const compressedDataUrl = await compressImageFile(file);
      setSelectedPhoto(compressedDataUrl);
      setPhotoSourceType(source);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not process photo. Please try another image.');
    } finally {
      setIsProcessingPhoto(false);
      // Reset input value so same file can be re-selected if desired
      event.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoSourceType(null);
  };

  // Submit check-in
  const handleCompleteCheckin = async () => {
    if (isSubmitting) return;

    if (!selectedPhoto) {
      setErrorMsg('Please upload today’s photo to complete your daily check-in.');
      return;
    }

    if (!canCheckin.allowed) {
      setErrorMsg(canCheckin.reason || 'You have already checked in today! See you tomorrow.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const focusHobby = challenge?.focusHobbyName || currentUser.hobbies[0]?.name || 'Creative Practice';
      const cleanCaption = caption.trim().slice(0, 150);

      const res = await store.submitCheckin({
        hobbyName: focusHobby,
        caption: cleanCaption || undefined,
        reflectionNote: cleanCaption || undefined,
        photoUrl: selectedPhoto,
        activitySummary: cleanCaption || `Completed daily photo check-in for ${focusHobby}`,
        durationMinutes: 30,
      });

      setIsSubmitting(false);

      if (res.success && res.stats) {
        setCelebrationState({
          isOpen: true,
          stats: res.stats,
          dayNumber: res.stats.completedDaysCount,
          hobbyName: focusHobby,
        });
        setSelectedPhoto(null);
        setPhotoSourceType(null);
        setCaption('');
      } else {
        setErrorMsg(res.error || 'Check-in failed. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Check-in could not be completed.');
    }
  };

  // Sort previous checkins in reverse chronological order (newest first)
  const sortedCheckins = [...checkins].sort((a, b) => b.checkinDate.localeCompare(a.checkinDate));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: Streak Count & 21-Day Progress                     */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Streak and Progress" className="space-y-4">
        {/* Main Stats Card */}
        <div className="bg-[#150D11] rounded-3xl border border-[#BE123C]/30 p-5 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
          {/* Subtle crimson background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#E11D48]/15 blur-[90px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Header kicker */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
                <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
                <span>21-Day Consistency Ritual</span>
              </div>

              {/* Match unlock indicator */}
              <div>
                {stats.isUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dating Matches Unlocked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FDA4AF] bg-[#2B0813] border border-[#E11D48]/30 px-3 py-1 rounded-full">
                    <Lock className="w-3.5 h-3.5 text-[#FB7185]" />
                    <span>{stats.remainingDays} {stats.remainingDays === 1 ? 'day' : 'days'} to match access</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title & Headline */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
                {challenge?.title || 'Daily Passion & Consistency'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
                Snap or upload 1 daily photo of your pursuit to prove intentional dedication.
                Complete 21 consecutive days to unlock dating matches with fellow deliberate creators.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Current Streak */}
              <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>Current Streak</span>
                </span>
                <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {stats.currentStreak} <span className="text-xs font-sans text-stone-400 font-normal">days</span>
                </p>
                <p className="text-[10px] text-[#FDA4AF] mt-0.5">Consecutive daily turns</p>
              </div>

              {/* 21-Day Day Number */}
              <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FB7185]" />
                  <span>Challenge Day</span>
                </span>
                <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  Day {Math.min(21, stats.currentStreak + (stats.hasCheckedInToday ? 0 : 1))} <span className="text-xs font-sans text-stone-400 font-normal">of 21</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Target: 21 days</p>
              </div>

              {/* Total Completed */}
              <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Logged</span>
                </span>
                <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {stats.completedDaysCount} <span className="text-xs font-sans text-stone-400 font-normal">photos</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Saved check-in records</p>
              </div>

              {/* Longest Streak Record */}
              <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>Personal Best</span>
                </span>
                <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {stats.longestStreak} <span className="text-xs font-sans text-stone-400 font-normal">days</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Saved permanently</p>
              </div>
            </div>

            {/* 21-Day Visual Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="font-medium">
                  21-Day Ritual Progress:{' '}
                  <strong className="text-white font-mono tabular-nums">{stats.progressPercent}%</strong>
                </span>
                <span className="text-stone-400 font-mono text-[11px]">
                  {stats.currentStreak} / 21 Days
                </span>
              </div>

              <div className="h-3 w-full bg-[#1C1216] rounded-full overflow-hidden border border-[#BE123C]/25 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF] rounded-full transition-all duration-500 shadow-[0_0_12px_#E11D48]"
                  style={{ width: `${Math.min(100, Math.max(5, stats.progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Action Buttons: My Streak Journal & 21-Day Calendar */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setJournalInitialTab('grid');
                  setIsJournalOpen(true);
                }}
                className="group p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2B0813] via-[#1E1117] to-[#150D11] border border-[#BE123C]/40 hover:border-[#E11D48] transition-all flex items-center justify-between cursor-pointer min-h-[48px] shadow-sm hover:shadow-[0_4px_16px_rgba(225,29,72,0.25)] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BE123C] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(225,29,72,0.4)] group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-1.5">
                      <span>My Streak Journal</span>
                    </p>
                    <p className="text-[11px] text-stone-400">
                      View all saved photos & captions
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono font-semibold text-[#FDA4AF] shrink-0">
                  {checkins.length} {checkins.length === 1 ? 'post' : 'posts'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJournalInitialTab('calendar');
                  setIsJournalOpen(true);
                }}
                className="group p-3 sm:p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/30 hover:border-[#E11D48] transition-all flex items-center justify-between cursor-pointer min-h-[48px] shadow-sm hover:shadow-[0_4px_16px_rgba(225,29,72,0.2)] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#FDA4AF] group-hover:text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white font-display">
                      21-Day Calendar
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Timeline & daily completion grid
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono font-semibold text-emerald-400 shrink-0">
                  Day {currentChallengeDay}/21
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact 21-Day Visual Calendar */}
        <div className="bg-[#150D11] rounded-3xl border border-[#BE123C]/25 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FB7185]" />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-display">
                21-Day Consistency Calendar
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setJournalInitialTab('calendar');
                setIsJournalOpen(true);
              }}
              className="text-[11px] text-[#FDA4AF] hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>Expand in Journal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 21 Days Visual Strip / Grid: 7 columns (3 weeks) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: 21 }, (_, index) => {
              const dayNum = index + 1;
              const dayCheckin = checkinByDay.get(dayNum);
              const isCompleted = !!dayCheckin;
              const isCurrent = dayNum === currentChallengeDay && !stats.hasCheckedInToday;

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => {
                    if (dayCheckin) {
                      setInspectCheckin(dayCheckin);
                    }
                  }}
                  title={
                    isCompleted
                      ? `Day ${dayNum} completed (${dayCheckin?.checkinDate}) - Click to inspect`
                      : isCurrent
                      ? `Day ${dayNum} - Today's check-in pending`
                      : `Day ${dayNum} - Locked`
                  }
                  className={`group relative rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-center transition-all min-h-[52px] sm:min-h-[58px] border text-center ${
                    isCompleted
                      ? 'bg-[#1C1216] hover:bg-[#2A1620] border-[#BE123C]/40 hover:border-[#E11D48] cursor-pointer shadow-sm hover:scale-102'
                      : isCurrent
                      ? 'bg-[#2B0813] border-[#E11D48] ring-1 ring-[#E11D48]/50 cursor-default animate-pulse'
                      : 'bg-black/30 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`text-[10px] sm:text-xs font-mono font-bold leading-tight ${
                      isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? 'text-[#FDA4AF]'
                        : 'text-stone-500'
                    }`}
                  >
                    D{dayNum}
                  </span>

                  <div className="mt-1">
                    {isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : isCurrent ? (
                      <span className="w-4 h-4 rounded-full bg-[#E11D48]/30 text-[#F5D061] flex items-center justify-center">
                        <Flame className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-white/5 text-stone-600 flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {isCompleted && (
                    <span className="text-[8px] font-mono text-[#FDA4AF] group-hover:underline mt-0.5 hidden min-[360px]:block">
                      View
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{stats.completedDaysCount} Completed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
              <span>{stats.hasCheckedInToday ? 'Today Done' : 'Today Pending'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-700" />
              <span>{Math.max(0, 21 - stats.completedDaysCount)} Remaining</span>
            </span>
          </div>
        </div>

        {/* Completion Banner when unlocked */}
        {stats.isUnlocked && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#2B0813] via-[#1C1216] to-[#140C0F] border border-[#BE123C]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-[0_10px_30px_rgba(225,29,72,0.3)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BE123C] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_#E11D48]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white text-sm font-display">
                  21-Day Challenge Complete! Dating Unlocked
                </p>
                <p className="text-stone-300 mt-0.5">
                  You have proven daily devotion and intentionality. Discover, Likes, and Messaging are fully accessible.
                </p>
              </div>
            </div>
            <button
              onClick={onExploreMatches}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs hover:from-[#E11D48] hover:to-[#BE123C] transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
            >
              <span>Explore Dating Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#2B0813] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTIONS 2, 3, 4, 5: Today's Daily Photo Check-in Box         */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Today's Check-in"
        className="bg-[#150D11] rounded-3xl border border-[#BE123C]/30 p-5 sm:p-7 space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FB7185]" />
              <span>Today's Daily Photo Check-in</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              One photo per day keeps your streak blazing
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs text-[#FDA4AF] bg-[#2B0813] px-2.5 py-1 rounded-full border border-[#BE123C]/30">
              {today}
            </span>
          </div>
        </div>

        {/* Hidden File Inputs for Gallery & Camera fallback */}
        <input
          type="file"
          ref={fileGalleryInputRef}
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'gallery')}
          className="hidden"
          aria-label="Upload photo from gallery"
        />
        <input
          type="file"
          ref={fileCameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e, 'camera')}
          className="hidden"
          aria-label="Take photo with camera"
        />

        {/* STATE A: User HAS ALREADY checked in today */}
        {todayCheckin ? (
          <div className="space-y-4">
            {/* Confirmation Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#1C1216] to-[#150D11] border border-emerald-500/40 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-base sm:text-lg font-bold text-white font-display">
                  Today's streak is complete! 🔥
                </p>
                <p className="text-xs text-stone-300">
                  You have already completed today's check-in. Your streak is safe! Come back tomorrow to advance to Day {stats.currentStreak + 1}.
                </p>
              </div>
            </div>

            {/* Display Today's Submitted Photo and Caption */}
            <div className="bg-[#1C1216] border border-[#BE123C]/20 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-semibold text-white">Your Logged Photo for Today</span>
                <span className="font-mono text-[11px] text-[#FDA4AF]">
                  Day {todayCheckin.dayNumber} · {todayCheckin.checkinDate}
                </span>
              </div>

              {todayCheckin.photoUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-80 w-full bg-black flex items-center justify-center border border-white/10">
                  <img
                    src={todayCheckin.photoUrl}
                    alt="Today's check-in"
                    className="w-full max-h-80 object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {todayCheckin.caption ? (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-xs text-stone-200 italic leading-relaxed">
                    "{todayCheckin.caption}"
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-stone-500 italic">No caption provided.</p>
              )}
            </div>
          </div>
        ) : (
          /* STATE B: User HAS NOT checked in today -> Upload form */
          <div className="space-y-5">
            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: Unified "Create Snap" Experience                   */}
            {/* ------------------------------------------------------------- */}
            {!selectedPhoto ? (
              <div className="space-y-4">
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#221019] via-[#180C13] to-[#12080B] border border-[#BE123C]/35 text-center space-y-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#BE123C] to-[#E11D48] text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.45)]">
                    <Camera className="w-8 h-8 text-white" />
                  </div>

                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                      Daily Practice Snap · Day {currentChallengeDay}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                      Document your 30-minute practice. Use the camera to snap live or choose an existing photo from your gallery in one seamless experience.
                    </p>
                  </div>

                  {/* ONLY ONE PRIMARY BUTTON NAMED "Create Snap" */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreateSnapModalOpen(true)}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] text-white font-bold text-sm shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer min-h-[48px] active:scale-98"
                    >
                      <Camera className="w-5 h-5 text-[#FDA4AF]" />
                      <span>Create Snap</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-stone-400 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FDA4AF]" />
                      <span>Live camera & photo gallery</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
                      <span>Builds Day {stats.currentStreak + 1} streak</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* ------------------------------------------------------------- */
              /* SECTION 3: Photo Preview Card with Retake/Replace Options    */
              /* ------------------------------------------------------------- */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-[#BE123C]/40 bg-black/60 shadow-lg">
                  {/* Image container */}
                  <div className="max-h-96 w-full flex items-center justify-center bg-black overflow-hidden">
                    <img
                      src={selectedPhoto}
                      alt="Today's selected preview"
                      className="w-full max-h-96 object-contain"
                    />
                  </div>

                  {/* Top preview overlay bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1.5 shadow-md">
                      {photoSourceType === 'camera' ? (
                        <>
                          <Camera className="w-3.5 h-3.5 text-[#F5D061]" />
                          <span>Captured via Camera</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-[#FB7185]" />
                          <span>Selected from Gallery</span>
                        </>
                      )}
                    </span>

                    <div className="flex items-center gap-2 pointer-events-auto">
                      <button
                        type="button"
                        onClick={() => setIsCreateSnapModalOpen(true)}
                        title="Retake or Change Snap"
                        className="p-2 rounded-xl bg-black/80 hover:bg-black text-stone-200 hover:text-white border border-white/20 transition-all flex items-center gap-1.5 text-xs min-h-[40px] px-3 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#FDA4AF]" />
                        <span>Change Snap</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        title="Remove Photo"
                        className="p-2 rounded-xl bg-[#2B0813]/90 hover:bg-[#3D0A1B] text-rose-300 hover:text-white border border-rose-500/40 transition-all flex items-center gap-1 text-xs min-h-[40px] px-3 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 4: Small Caption Input directly below photo           */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="checkin-caption" className="text-stone-300 font-semibold">
                      Caption <span className="text-stone-500 font-normal">(Optional)</span>
                    </label>
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        caption.length >= 140 ? 'text-[#FDA4AF] font-bold' : 'text-stone-400'
                      }`}
                    >
                      {caption.length}/150
                    </span>
                  </div>

                  <input
                    id="checkin-caption"
                    type="text"
                    maxLength={150}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a little about this photo..."
                    className="w-full px-4 py-3 text-sm bg-[#1C1216] border border-[#BE123C]/30 focus:border-[#E11D48] rounded-xl text-white placeholder-stone-500 focus:outline-none transition-colors shadow-inner min-h-[44px]"
                  />
                  <p className="text-[11px] text-stone-400">
                    A brief reflection or description. Max 150 characters.
                  </p>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 5: Complete Check-in Button                           */}
                {/* ------------------------------------------------------------- */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteCheckin}
                    disabled={isSubmitting || !selectedPhoto}
                    className="w-full py-3.5 px-6 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.5)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
                  >
                    <Flame className="w-5 h-5 text-[#FDA4AF]" />
                    <span>{isSubmitting ? 'Saving Check-in...' : "Complete Today's Check-in"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Privacy Note: Strictly Private to You                         */}
        {/* ------------------------------------------------------------- */}
        <div className="p-3.5 rounded-2xl bg-[#1C1216]/60 border border-[#BE123C]/20 flex items-start gap-3 text-xs text-stone-300">
          <ShieldCheck className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-semibold text-white">Private by Design: </span>
            <span className="text-stone-400">
              Your daily check-in photos and notes are strictly private to you. They are never displayed publicly on your dating profile or visible to other members.
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Compact Journal Banner (Replaces long vertical photo feed)     */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Streak Journal Quick Access" className="space-y-3">
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#1E1117] via-[#160D12] to-[#12080B] border border-[#BE123C]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#2B0813] border border-[#BE123C]/40 text-[#FDA4AF] flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold font-display text-white">
                My Streak Journal
              </h3>
              <p className="text-xs text-stone-300">
                {checkins.length > 0
                  ? `Browse your ${checkins.length} private photo posts, daily reflections, and 21-day timeline.`
                  : 'Start your streak today to build your private photo journal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setJournalInitialTab('grid');
                setIsJournalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-gradient-to-r from-[#BE123C] to-[#E11D48] text-white font-semibold text-xs hover:from-[#E11D48] hover:to-[#BE123C] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[44px]"
            >
              <Grid className="w-4 h-4" />
              <span>View Photo Grid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJournalInitialTab('calendar');
                setIsJournalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-[#1C1216] border border-[#BE123C]/40 hover:border-[#E11D48] text-stone-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Streak Rules & Mindful Philosophy (Clear & Non-Shaming)       */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Streak Rules" className="bg-[#150D11] rounded-3xl border border-[#BE123C]/20 p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FB7185]" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Streak Rules & Consistency Guidelines
            </h3>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">Zero Shaming Policy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Flame className="w-4 h-4 text-[#F5D061]" />
              <span>Consecutive Daily Turns</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Checking in each calendar day maintains and extends your streak by +1 day.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Clock className="w-4 h-4 text-[#FB7185]" />
              <span>Missed Day Reset</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              If a calendar day passes without a check-in, the current streak resets to zero.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Award className="w-4 h-4 text-[#F5D061]" />
              <span>Longest Streak Saved</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Your personal best longest streak is permanently saved and celebrated on your profile.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Strictly Private</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Your check-in photos are for your personal consistency journey only, never shown to matches.
            </p>
          </div>
        </div>

        {/* Reviewer / Fast-Track Testing Shortcut */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <span className="text-stone-500">
            Lovbee Dev & Testing Tools:
          </span>
          <button
            type="button"
            onClick={() => {
              store.fastTrackChallengeToDay21();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5 text-[#FB7185]" />
            <span>Fast-track to Day 21 (Testing)</span>
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Full Photo Inspection Modal for Past Checkins                 */}
      {/* ------------------------------------------------------------- */}
      {inspectCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#150D11] border border-[#BE123C]/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FB7185] bg-[#2B0813] px-2.5 py-1 rounded-full border border-[#BE123C]/30">
                  Day {inspectCheckin.dayNumber} of 21
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {inspectCheckin.checkinDate}
                </span>
              </div>
              <button
                onClick={() => setInspectCheckin(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close photo preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inspectCheckin.photoUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                <img
                  src={inspectCheckin.photoUrl}
                  alt={inspectCheckin.caption || 'Past check-in'}
                  className="w-full max-h-96 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="space-y-2 text-xs">
              <h4 className="text-sm font-bold text-white font-display">
                {inspectCheckin.hobbyName}
              </h4>
              {inspectCheckin.caption && (
                <p className="text-stone-300 leading-relaxed bg-[#1C1216] p-3 rounded-xl border border-white/5 italic">
                  "{inspectCheckin.caption}"
                </p>
              )}
              <div className="flex items-center justify-between text-stone-400 pt-2 text-[11px]">
                <span>Logged at: {new Date(inspectCheckin.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Streak Validated
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Celebration Modal */}
      <CheckinCelebrationModal
        isOpen={celebrationState.isOpen}
        onClose={() => setCelebrationState((prev) => ({ ...prev, isOpen: false }))}
        stats={celebrationState.stats}
        dayNumber={celebrationState.dayNumber}
        hobbyName={celebrationState.hobbyName}
        onViewCalendar={() => {
          setCelebrationState((prev) => ({ ...prev, isOpen: false }));
          setJournalInitialTab('calendar');
          setIsJournalOpen(true);
        }}
      />

      {/* Streak Journal Modal with compact Photo Grid and 21-Day Calendar */}
      <StreakJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        checkins={checkins}
        currentUser={currentUser}
        stats={stats}
        initialTab={journalInitialTab}
      />

      {/* Live Camera Viewfinder Modal */}
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
          setSelectedPhoto(null);
          setCaption('');
        }}
      />

      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCapturedFromCamera}
        onFallbackToGallery={() => {
          setIsCameraModalOpen(false);
          fileGalleryInputRef.current?.click();
        }}
      />
    </div>
  );
};
