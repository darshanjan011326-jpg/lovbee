import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, Heart } from 'lucide-react';
import { Profile, Connection } from '../types';
import { LovbeeLogo } from './LovbeeLogo';

interface MatchCelebrationModalProps {
  isOpen: boolean;
  partner: Profile | null;
  currentUser: Profile | null;
  connection?: Connection;
  onClose: () => void;
  onOpenChat: (connectionId: string) => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  isOpen,
  partner,
  currentUser,
  connection,
  onClose,
  onOpenChat,
}) => {
  if (!isOpen || !partner || !currentUser) return null;

  const sharedHobby =
    partner.hobbies.find((h) =>
      currentUser.hobbies.some((myH) => myH.name.toLowerCase() === h.name.toLowerCase())
    )?.name || partner.hobbies[0]?.name || 'Shared Passions';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Background ambient crimson glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-[#E11D48]/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md bg-[#160D12] border border-[#BE123C]/35 rounded-3xl p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(225,29,72,0.4)] overflow-hidden">
        {/* Subtle decorative heart watermark */}
        <div className="absolute -top-16 -right-16 w-48 h-48 opacity-10 pointer-events-none">
          <Heart className="w-full h-full text-[#E11D48] fill-[#E11D48]" />
        </div>

        {/* Brand Lovbee Badge */}
        <div className="flex justify-center mb-4">
          <LovbeeLogo size="sm" showWordmark={true} />
        </div>

        {/* Romantic celebration headline */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#FDA4AF]" />
            <span>Mutual Spark</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight mt-2">
            It’s a Match!
          </h2>
          <p className="text-sm text-stone-300">
            You and <span className="text-[#FDA4AF] font-semibold">{partner.displayName}</span> felt the buzz for each other.
          </p>
        </div>

        {/* Dual Profile Photos with Central Heart Buzz */}
        <div className="relative flex items-center justify-center gap-4 my-8">
          {/* Current User Photo */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#E11D48] shadow-[0_0_20px_rgba(225,29,72,0.4)] bg-[#1c1c1e]">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-[#090909] text-stone-300 px-2 py-0.5 rounded-full border border-white/10">
              You
            </span>
          </div>

          {/* Central Heart & Interlocking Spark */}
          <div className="relative -mx-2 z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-[#881337] via-[#BE123C] to-[#E11D48] flex items-center justify-center shadow-[0_0_25px_#E11D48] border-2 border-[#090909] animate-bounce">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>

          {/* Partner Photo */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#BE123C] shadow-[0_0_20px_rgba(225,29,72,0.4)] bg-[#1c1216]">
              <img
                src={partner.avatarUrl}
                alt={partner.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-[#090909] text-stone-300 px-2 py-0.5 rounded-full border border-white/10 truncate max-w-[80px]">
              {partner.displayName.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Shared Passion Callout */}
        <div className="bg-[#1C1216] border border-[#BE123C]/20 rounded-2xl p-3.5 mb-6 text-xs text-stone-300">
          <p className="font-medium text-white mb-0.5">Connection Spark</p>
          <p className="text-stone-400">
            You both share a deep passion for <span className="text-[#FDA4AF] font-semibold">{sharedHobby}</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              if (connection) {
                onOpenChat(connection.id);
              }
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-sm shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send First Message</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl bg-transparent hover:bg-white/5 text-stone-400 hover:text-white font-medium text-xs transition-colors"
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
