import React, { useState } from 'react';
import { Send, X, Heart, Sparkles, AlertCircle, Mail } from 'lucide-react';
import { Profile, CompatibilityResult } from '../types';
import { store } from '../services/store';

interface ExpressInterestModalProps {
  target?: { profile: Profile; compatibility: CompatibilityResult } | null;
  targetProfile?: Profile;
  compatibility?: CompatibilityResult;
  currentUser?: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetProfile: Profile) => void;
}

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  target,
  targetProfile: propProfile,
  compatibility: propCompat,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const profile = target?.profile || propProfile;
  const compatibility = target?.compatibility || propCompat || {
    score: 85,
    sharedHobbies: [],
    sharedCategories: [],
    reasons: [],
    lifestyleHighlights: [],
  };

  const defaultHobby =
    compatibility.sharedHobbies?.[0] || profile?.hobbies?.[0]?.name || 'Wheel-thrown Ceramics';

  const [introNote, setIntroNote] = useState('');
  const [selectedHobby, setSelectedHobby] = useState(defaultHobby);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!introNote.trim()) {
      setError('Please write a brief note introducing yourself.');
      return;
    }

    setSending(true);
    const res = store.sendConnectionRequest(profile.id, introNote, selectedHobby);
    setSending(false);

    if (res.success) {
      onSuccess(profile);
      onClose();
    } else {
      setError(res.error || 'Could not send love note');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#151515] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/10 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
              alt={profile.displayName}
              className="w-12 h-12 rounded-full object-cover border border-[#E11D48]/40"
            />
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Send Love Note to {profile.displayName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>{profile.age} yrs</span>
                <span aria-hidden="true">·</span>
                <span>{profile.location}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#FB7185]">{compatibility.score}% Spark</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#2B0813] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Reference a shared craft or passion
            </label>
            <select
              value={selectedHobby}
              onChange={(e) => setSelectedHobby(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
            >
              {profile.hobbies.map((h) => (
                <option key={h.hobbyId} value={h.name}>
                  {h.name} ({h.skillLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Personalized Intro Note
            </label>
            <textarea
              rows={3}
              required
              value={introNote}
              onChange={(e) => setIntroNote(e.target.value)}
              placeholder={`Hi ${profile.displayName.split(' ')[0]}, I was really drawn to your passion for ${selectedHobby}...`}
              className="w-full px-3.5 py-2.5 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
            />
            <p className="mt-1 text-[11px] text-stone-400">
              Lovbee encourages thoughtful starters referencing real shared passions rather than generic lines.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 text-xs text-stone-300 space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FDA4AF]" />
              <span>How Lovbee Sparks work:</span>
            </p>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              When {profile.displayName} accepts your note, you both unlock private chat and mutual connection status!
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
