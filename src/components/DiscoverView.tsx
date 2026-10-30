import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Eye,
  X,
  Flame,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  ArrowRight,
  MoreVertical,
  Compass,
  MapPin,
  Briefcase,
  Flag,
  UserX,
} from 'lucide-react';
import { Profile, CompatibilityResult, Connection } from '../types';
import { store, StreakStats } from '../services/store';
import { ProfileDetailModal } from './ProfileDetailModal';
import { ExpressInterestModal } from './ExpressInterestModal';
import { MatchCelebrationModal } from './MatchCelebrationModal';

interface DiscoverViewProps {
  currentUser: Profile;
  onOpenBlockModal: (target: Profile) => void;
  onOpenReportModal: (target: Profile) => void;
  onNavigateToChallenge: () => void;
  onOpenChat?: (connectionId: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentUser,
  onOpenBlockModal,
  onOpenReportModal,
  onNavigateToChallenge,
  onOpenChat,
}) => {
  const isUnlocked = store.isMatchingUnlocked();
  const stats: StreakStats = store.getStreakStats(currentUser.id);

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState<number>(0);
  const [activeProfileModal, setActiveProfileModal] = useState<{
    profile: Profile;
    compatibility: CompatibilityResult;
  } | null>(null);
  const [interestTarget, setInterestTarget] = useState<{
    profile: Profile;
    compatibility: CompatibilityResult;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    partner: Profile | null;
    connection?: Connection;
  }>({ isOpen: false, partner: null });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // If user has NOT completed the 21-day challenge, matching is strictly locked!
  if (!isUnlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Ambient red halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E11D48]/15 blur-[120px] pointer-events-none" />

          {/* Lock & Bee Icon Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#2B0813] to-[#151515] border border-[#E11D48]/40 flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.3)]">
            <Lock className="w-9 h-9 text-[#FB7185]" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185]">
              <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>Day {stats.currentStreak} of 21 Consecutive Days</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Dating Matches Unlock on Day 21
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              Lovbee is built for adults who show up with consistency and intention.
              Complete your 21-day daily ritual before discovering dating matches.
            </p>
          </div>

          {/* Current Streak Progress Tracker */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 space-y-2 relative z-10 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-medium">Consecutive Streak</span>
              <span className="font-mono font-bold text-white">
                {stats.currentStreak} / 21 Days
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF] rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (stats.currentStreak / 21) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400 text-center pt-1">
              {21 - stats.currentStreak > 0
                ? `${21 - stats.currentStreak} consecutive check-in${21 - stats.currentStreak === 1 ? '' : 's'} remaining to unlock full discovery.`
                : 'Challenge completed! Unlocking matches...'}
            </p>
          </div>

          {/* Call to action button */}
          <div className="pt-2 relative z-10">
            <button
              onClick={onNavigateToChallenge}
              className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] transition-all shadow-[0_4px_25px_rgba(225,29,72,0.45)] flex items-center gap-2.5 mx-auto cursor-pointer"
            >
              <Flame className="w-4 h-4 text-[#FDA4AF]" />
              <span>Go to 21-Day Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UNLOCKED DISCOVERY: Show EXACTLY ONE profile at a time ---
  const candidates = store.getDiscoverProfiles();
  const currentCandidate = candidates[0] || null;

  const handleSkip = () => {
    if (!currentCandidate) return;
    store.skipProfile(currentCandidate.profile.id);
    showToast(`Passed on ${currentCandidate.profile.displayName}`);
    setCurrentPhotoIdx(0);
    setShowSafetyMenu(false);
  };

  const handleExpressInterest = () => {
    if (!currentCandidate) return;
    setInterestTarget(currentCandidate);
    setShowSafetyMenu(false);
  };

  const handleInterestSuccess = (partner: Profile) => {
    setInterestTarget(null);
    showToast(`Love note delivered to ${partner.displayName}!`);
    setCurrentPhotoIdx(0);
  };

  const handleQuickSpark = () => {
    if (!currentCandidate) return;
    const res = store.sendInstantSpark(currentCandidate.profile.id);
    if (res.isMutual && res.partner) {
      setMatchCelebration({
        isOpen: true,
        partner: res.partner,
        connection: res.connection,
      });
    } else {
      showToast(`Spark sent to ${currentCandidate.profile.displayName}!`);
      setCurrentPhotoIdx(0);
    }
  };

  // If no candidates remain in the queue
  if (!currentCandidate) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="bg-[#151515] rounded-3xl border border-white/10 p-10 sm:p-14 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-[#1C1C1E] border border-white/10 mx-auto flex items-center justify-center text-[#FB7185]">
            <Heart className="w-9 h-9 fill-[#E11D48]/20 text-[#FB7185]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              You've seen everyone available for now. Check back later!
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              New intentional singles unlock their 21-day challenge daily. You can also explore playful prompts or check your active connections.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => store.setDemoMode(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors"
            >
              Refresh Queue
            </button>
            <button
              onClick={onNavigateToChallenge}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#FDA4AF] bg-[#2B0813] border border-[#E11D48]/40 hover:border-[#E11D48] transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>Challenge Routine</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, compatibility } = currentCandidate;
  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [profile.avatarUrl];
  const userHobbyNames = new Set(currentUser.hobbies.map((h) => h.name.toLowerCase().trim()));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-[#E11D48]/40 text-white text-xs shadow-[0_10px_30px_rgba(225,29,72,0.3)] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <Heart className="w-4 h-4 text-[#FB7185] fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Discovery Subheader with remaining badge */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex items-center gap-2 text-xs text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
          <span>1 Curated Profile at a Time</span>
          <span aria-hidden="true">·</span>
          <span>Zero Swiping</span>
        </div>

        <div className="text-xs font-mono text-stone-400">
          {candidates.length} {candidates.length === 1 ? 'profile' : 'profiles'} in queue
        </div>
      </div>

      {/* --- EXACTLY ONE PROFILE CARD --- */}
      <div className="bg-[#151515] rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
        {/* Large Photo Carousel */}
        <div className="relative aspect-[4/5] sm:aspect-[4/4.5] w-full bg-black select-none overflow-hidden">
          <img
            src={photos[currentPhotoIdx] || profile.avatarUrl}
            alt={profile.displayName}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Subtle gradient vignette at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30 pointer-events-none" />

          {/* Verified 21-Day Challenge Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#F5D061]/40 text-white text-xs shadow-md">
            <Flame className="w-3.5 h-3.5 text-[#F5D061]" />
            <span className="font-semibold text-[11px] text-[#F5D061]">21-Day Ritual Verified</span>
          </div>

          {/* Safety options trigger button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowSafetyMenu(!showSafetyMenu)}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showSafetyMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSafetyMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-[#1C1C1E] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-30 text-xs animate-in fade-in">
                  <button
                    onClick={() => {
                      setShowSafetyMenu(false);
                      onOpenReportModal(profile);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Report Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSafetyMenu(false);
                      onOpenBlockModal(profile);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Block Profile</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Photo Navigation Arrows (if multiple photos) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIdx((p) => (p === 0 ? photos.length - 1 : p - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                title="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIdx((p) => (p === photos.length - 1 ? 0 : p + 1));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                title="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Photo Indicator Dots */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIdx(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentPhotoIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Identity Overlay at Bottom of Photo */}
          <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
                {profile.displayName}
              </h2>
              <span className="text-xl sm:text-2xl font-light text-stone-200">
                {profile.age}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 drop-shadow">
              {profile.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profile.occupation}</span>
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profile.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Compatibility Breakdown Banner */}
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase text-[#FB7185] font-bold">
                Compatibility Rating
              </span>
              <p className="text-xs text-stone-300">
                {compatibility.reasons[0] || 'Shared artistic dedication'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#F5D061]" />
              <span className="font-mono font-bold text-sm text-white">
                {compatibility.score}%
              </span>
            </div>
          </div>

          {/* Short Bio */}
          {profile.bio && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-stone-400 font-bold">
                About {profile.displayName.split(' ')[0]}
              </span>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Hobbies with Shared Passion Highlight */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase text-stone-400 font-bold">
              Hobbies & Crafts
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((h) => {
                const isShared = userHobbyNames.has(h.name.toLowerCase().trim());
                return (
                  <span
                    key={h.hobbyId}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isShared
                        ? 'bg-[#2B0813] text-[#FDA4AF] border border-[#E11D48]/50 shadow-[0_0_10px_rgba(225,29,72,0.2)]'
                        : 'bg-[#1C1C1E] text-stone-300 border border-white/5'
                    }`}
                  >
                    {isShared && <Sparkles className="w-3 h-3 text-[#F5D061]" />}
                    <span>{h.name}</span>
                    {isShared && (
                      <span className="text-[10px] text-[#F5D061] font-mono font-bold">
                        · Shared
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Profile Prompts */}
          {profile.prompts && profile.prompts.length > 0 && (
            <div className="space-y-3 pt-1">
              {profile.prompts.slice(0, 2).map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1 text-xs"
                >
                  <p className="text-[11px] font-semibold text-[#FB7185]">{p.question}</p>
                  <p className="text-stone-200 leading-relaxed italic">“{p.answer}”</p>
                </div>
              ))}
            </div>
          )}

          {/* --- TWO MAIN ACTIONS: “Skip” & “Express Interest” --- */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
            {/* 1. Skip Button */}
            <button
              onClick={handleSkip}
              className="py-3.5 px-6 rounded-2xl border border-white/15 bg-[#1C1C1E] hover:bg-[#252528] text-stone-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm group"
            >
              <X className="w-4 h-4 text-stone-400 group-hover:text-rose-400 transition-colors" />
              <span>Skip</span>
            </button>

            {/* 2. Express Interest Button */}
            <button
              onClick={handleExpressInterest}
              className="py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] transition-all shadow-[0_4px_25px_rgba(225,29,72,0.45)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Heart className="w-4 h-4 fill-current text-white" />
              <span>Express Interest</span>
            </button>
          </div>

          {/* Secondary Quick Action: View Detailed Profile Modal */}
          <div className="text-center pt-1">
            <button
              onClick={() => setActiveProfileModal(currentCandidate)}
              className="text-xs text-stone-400 hover:text-white transition-colors underline underline-offset-4"
            >
              View Full Profile Details
            </button>
          </div>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {activeProfileModal && (
        <ProfileDetailModal
          isOpen={Boolean(activeProfileModal)}
          profile={activeProfileModal.profile}
          compatibility={activeProfileModal.compatibility}
          onClose={() => setActiveProfileModal(null)}
          onExpressInterest={() => {
            const target = activeProfileModal;
            setActiveProfileModal(null);
            setInterestTarget(target);
          }}
          onBlock={(target) => {
            setActiveProfileModal(null);
            onOpenBlockModal(target);
          }}
          onReport={(target) => {
            setActiveProfileModal(null);
            onOpenReportModal(target);
          }}
        />
      )}

      {/* Express Interest Modal (Thoughtful Note) */}
      {interestTarget && (
        <ExpressInterestModal
          isOpen={Boolean(interestTarget)}
          targetProfile={interestTarget.profile}
          compatibility={interestTarget.compatibility}
          onClose={() => setInterestTarget(null)}
          onSuccess={handleInterestSuccess}
        />
      )}

      {/* Match Celebration Modal */}
      {matchCelebration.isOpen && matchCelebration.partner && (
        <MatchCelebrationModal
          isOpen={matchCelebration.isOpen}
          partner={matchCelebration.partner}
          currentUser={currentUser}
          connection={matchCelebration.connection}
          onClose={() => setMatchCelebration({ isOpen: false, partner: null })}
          onOpenChat={(connId) => {
            setMatchCelebration({ isOpen: false, partner: null });
            if (onOpenChat) onOpenChat(connId);
          }}
        />
      )}
    </div>
  );
};
