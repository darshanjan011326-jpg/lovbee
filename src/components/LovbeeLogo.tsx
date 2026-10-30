import React from 'react';

export const OFFICIAL_LOVBEE_LOGO_SRC = '/assets/aistudio/Screenshot_2026-10-29_174145_b6928524.png';

interface LovbeeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
  variant?: 'default' | 'card' | 'badge';
  onClick?: () => void;
}

export const LovbeeLogo: React.FC<LovbeeLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  taglineText = 'Find your buzz. Feel the love.',
  className = '',
  variant = 'default',
  onClick,
}) => {
  // Proportions matching the elegant rounded card of the interlocking rings logo
  const iconConfig = {
    xs: {
      wrapper: 'w-7 h-9',
      rounded: 'rounded-lg',
      glow: 'shadow-[0_0_10px_rgba(225,29,72,0.3)]',
    },
    sm: {
      wrapper: 'w-9 h-11',
      rounded: 'rounded-xl',
      glow: 'shadow-[0_0_14px_rgba(225,29,72,0.35)]',
    },
    md: {
      wrapper: 'w-11 h-14',
      rounded: 'rounded-xl',
      glow: 'shadow-[0_0_18px_rgba(225,29,72,0.4)]',
    },
    lg: {
      wrapper: 'w-16 h-20',
      rounded: 'rounded-2xl',
      glow: 'shadow-[0_0_26px_rgba(225,29,72,0.45)]',
    },
    xl: {
      wrapper: 'w-24 h-30',
      rounded: 'rounded-3xl',
      glow: 'shadow-[0_0_36px_rgba(225,29,72,0.55)]',
    },
  }[size];

  const wordmarkSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const taglineSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Official Uploaded Logo: Interlocking Rings Heart Emblem */}
      <div
        className={`relative shrink-0 ${iconConfig.wrapper} ${iconConfig.rounded} overflow-hidden bg-[#0D0A0C] border border-white/10 ring-1 ring-[#BE123C]/40 ${iconConfig.glow} transition-transform duration-300 hover:scale-105 flex items-center justify-center p-0.5`}
      >
        <img
          src={OFFICIAL_LOVBEE_LOGO_SRC}
          alt="Lovbee Official Logo"
          className="w-full h-full object-contain filter contrast-105"
          loading="eager"
          decoding="async"
        />

        {/* Delicate Crimson Ambient Rim Highlight */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-white/10" />
      </div>

      {/* Lovbee Wordmark & Tagline with Romantic Red Gradient */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <div className={`font-display font-bold tracking-tight text-white leading-none ${wordmarkSizes} flex items-baseline`}>
            <span>Lov</span>
            <span className="font-serif italic bg-gradient-to-r from-[#FB7185] via-[#E11D48] to-[#FDA4AF] bg-clip-text text-transparent ml-0.5 tracking-normal">
              bee
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E11D48] ml-1 mb-0.5 shadow-[0_0_8px_#E11D48]" />
          </div>

          {showTagline && (
            <span
              className={`text-stone-300 tracking-wide font-sans font-medium mt-1 leading-tight ${taglineSizes}`}
            >
              {taglineText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
