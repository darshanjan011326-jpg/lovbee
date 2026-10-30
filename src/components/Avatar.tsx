import React, { useState } from 'react';

interface AvatarProps {
  id?: string;
  name: string;
  avatarUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  id = '',
  name,
  avatarUrl = '',
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }[size];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L';

  const isRealPhoto =
    avatarUrl &&
    !imageError &&
    (avatarUrl.startsWith('data:image') ||
      avatarUrl.startsWith('http://') ||
      avatarUrl.startsWith('https://') ||
      avatarUrl.startsWith('blob:'));

  if (isRealPhoto) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#1C1C1E] shadow-xs ${sizeClasses} ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Romantic dark fallback gradients for monograms
  const darkPalettes = [
    { bg: 'from-[#4C0519] to-[#881337]', text: '#FECDD3', border: 'border-[#9F1239]/50' },
    { bg: 'from-[#1C1C1E] to-[#2B0813]', text: '#F5D061', border: 'border-[#CA8A04]/40' },
    { bg: 'from-[#1E1B4B] to-[#311042]', text: '#FBCFE8', border: 'border-[#E11D48]/30' },
    { bg: 'from-[#1F2937] to-[#111827]', text: '#E5E7EB', border: 'border-white/10' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const matched = darkPalettes[Math.abs(hash) % darkPalettes.length];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden shrink-0 border bg-gradient-to-tr ${matched.bg} ${matched.border} ${sizeClasses} ${className}`}
      style={{ color: matched.text }}
      title={name}
    >
      <span className="font-display font-semibold tracking-wider select-none">
        {initials}
      </span>
    </div>
  );
};
