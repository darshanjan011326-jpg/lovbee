import React, { useState } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  Heart,
  Flag,
  Ban,
  Clock,
  Compass,
  ChevronLeft,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { Profile, CompatibilityResult } from '../types';

interface ProfileDetailModalProps {
  target?: { profile: Profile; compatibility: CompatibilityResult } | null;
  profile?: Profile;
  compatibility?: CompatibilityResult;
  currentUser?: Profile;
  isOpen: boolean;
  onClose: () => void;
  onExpressInterest: () => void;
  onBlock: (target: Profile) => void;
  onReport: (target: Profile) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  target,
  profile: propProfile,
  compatibility: propCompat,
  isOpen,
  onClose,
  onExpressInterest,
  onBlock,
  onReport,
}) => {
  if (!isOpen) return null;

  const profile = target?.profile || propProfile;
  const compatibility = target?.compatibility || propCompat || {
    score: 85,
    sharedHobbies: [],
    sharedCategories: [],
    reasons: ['Shared resonance with deliberate creative crafts.'],
    lifestyleHighlights: [],
  };

  if (!profile) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [profile.avatarUrl];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#151515] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header with Close */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FB7185]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>Profile Story</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6">
          {/* Edge-to-edge Photo Carousel */}
          <div className="relative aspect-4/3 w-full bg-[#1C1C1E] overflow-hidden select-none">
            <img
              src={photos[activePhotoIdx] || photos[0]}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30 pointer-events-none" />

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((p) => (p > 0 ? p - 1 : photos.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((p) => (p < photos.length - 1 ? p + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute top-4 inset-x-4 flex items-center gap-1.5 z-10">
                  {photos.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full flex-1 transition-all ${
                        i === activePhotoIdx ? 'bg-white shadow-xs' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Profile Info Overlay at Bottom of Photo */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">
                  {profile.displayName}
                </h1>
                <span className="text-2xl text-stone-300 font-light drop-shadow-md">
                  {profile.age}
                </span>
              </div>

              {/* Badges row: 21-day, Gender (if shared), Orientation (strictly if opted in) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {profile.challengeUnlocked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 border border-[#F5D061]/40 text-[#F5D061] text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md">
                    <Award className="w-3.5 h-3.5 text-[#F5D061]" />
                    21-Day Verified
                  </span>
                )}

                {/* Gender Identity tag (if permitted) */}
                {profile.showGenderOnProfile !== false &&
                  profile.gender &&
                  profile.gender !== 'Prefer not to say' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-stone-200 text-[11px] font-medium">
                      {profile.gender === 'Self-describe'
                        ? profile.genderSelfDescribe || 'Gender diverse'
                        : profile.gender}
                    </span>
                  )}

                {/* Sexual Orientation tag (STRICTLY if explicitly opted in) */}
                {profile.showOrientationOnProfile === true &&
                  profile.sexualOrientation &&
                  profile.sexualOrientation !== 'Prefer not to say' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E11D48]/25 backdrop-blur-md border border-[#E11D48]/40 text-[#FDA4AF] text-[11px] font-medium flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      <span>
                        {profile.sexualOrientation === 'Self-describe'
                          ? profile.orientationSelfDescribe || 'Queer'
                          : profile.sexualOrientation}
                      </span>
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-300 mt-2">
                <span className="font-medium text-white">{profile.occupation}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FB7185]" />
                  {profile.location}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 text-xs text-stone-300">
            {/* Compatibility Synergy Breakdown */}
            <div className="p-4 rounded-2xl bg-[#2B0813] border border-[#E11D48]/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                  <Sparkles className="w-4 h-4 text-[#F5D061]" />
                  <span>{compatibility.score}% Passion & Synergy Compatibility</span>
                </div>
                <span className="text-[11px] font-mono text-[#FDA4AF] font-bold">Resonant</span>
              </div>

              <div className="space-y-1 text-stone-200">
                {compatibility.reasons.map((r, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                    <span>{r}</span>
                  </p>
                ))}
                <p className="flex items-center gap-2 text-emerald-400/90 font-medium pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Mutual compatibility verified: Both users' age, gender & dating preferences align.</span>
                </p>
              </div>
            </div>

            {/* Narrative Bio */}
            {profile.bio && (
              <div className="space-y-1.5">
                <h3 className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                  About {profile.displayName.split(' ')[0]}
                </h3>
                <p className="text-sm text-stone-100 leading-relaxed font-serif italic bg-[#1C1C1E] p-4 rounded-2xl border border-white/5">
                  "{profile.bio}"
                </p>
              </div>
            )}

            {/* Dating Prompts */}
            {profile.prompts && profile.prompts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                  Romantic Prompts
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {profile.prompts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1"
                    >
                      <p className="text-[10px] font-bold text-[#F5D061] uppercase tracking-wider">
                        {p.question}
                      </p>
                      <p className="text-xs text-stone-200 font-serif leading-relaxed italic">
                        "{p.answer}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies & Passions */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                Pursuits, Crafts & Disciplines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.hobbies.map((h) => (
                  <div
                    key={h.hobbyId}
                    className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white text-xs">{h.name}</p>
                      <p className="text-[10px] text-stone-400 capitalize">
                        {h.category} · {h.yearsPracticed} yrs
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E11D48]/15 text-[#FB7185] font-semibold border border-[#E11D48]/30 capitalize">
                      {h.skillLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Rhythms */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">
                Lifestyle & Rhythms
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-0.5">
                  <p className="text-[10px] text-stone-500 font-semibold uppercase">Sleep Rhythm</p>
                  <p className="text-xs text-stone-200 font-medium capitalize">
                    {profile.lifestyle?.sleepSchedule.replace('_', ' ') || 'Flexible'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-0.5">
                  <p className="text-[10px] text-stone-500 font-semibold uppercase">Weekend Vibe</p>
                  <p className="text-xs text-stone-200 font-medium capitalize">
                    {profile.lifestyle?.weekendVibe.replace('_', ' ') || 'Slow mornings'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-0.5">
                  <p className="text-[10px] text-stone-500 font-semibold uppercase">Looking For</p>
                  <p className="text-xs text-[#FB7185] font-semibold capitalize">
                    {profile.datingPreferences?.relationshipIntent.replace('_', ' ') || 'Intentional'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 border-t border-white/10 bg-[#111111] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReport(profile)}
              title="Report Profile"
              className="px-3 py-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-white/5 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              onClick={() => onBlock(profile)}
              title="Block Profile"
              className="px-3 py-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Block</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onExpressInterest();
            }}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white text-xs font-semibold shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Send Love Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
