import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  className?: string;
  variant?: 'gold' | 'espresso' | 'badge';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  variant = 'badge',
}) => {
  const sizeMap = {
    xs: { box: 'w-7 h-7', icon: 20, text: 'text-sm', sub: 'text-[9px]' },
    sm: { box: 'w-9 h-9', icon: 24, text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-11 h-11', icon: 28, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', icon: 36, text: 'text-xl', sub: 'text-xs' },
    hero: { box: 'w-22 h-22', icon: 52, text: 'text-3xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  // SVG Heritage Tree of Life & Oral Soundwave Crest
  const LogoIcon = (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm"
    >
      <defs>
        <linearGradient id="treeGold" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBE3A1" />
          <stop offset="40%" stopColor="#E2A63B" />
          <stop offset="80%" stopColor="#B36B18" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="trunkGrad" x1="32" y1="26" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5D075" />
          <stop offset="60%" stopColor="#C27A1C" />
          <stop offset="100%" stopColor="#69300D" />
        </linearGradient>

        <linearGradient id="circleAura" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#5E2C0C" />
          <stop offset="100%" stopColor="#2A1405" />
        </linearGradient>

        <radialGradient id="sunGlow" cx="32" cy="24" r="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE8A3" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#D48B28" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8B4513" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Decorative Heritage Aura Ring */}
      <circle cx="32" cy="32" r="30" fill="url(#circleAura)" stroke="#E5B25D" strokeWidth="1.2" strokeOpacity="0.4" />
      <circle cx="32" cy="32" r="27.5" fill="none" stroke="#FDE68A" strokeWidth="0.75" strokeDasharray="3 2" strokeOpacity="0.4" />
      <circle cx="32" cy="28" r="22" fill="url(#sunGlow)" />

      {/* Concentric Oral Memoir Soundwaves behind tree canopy */}
      <path d="M17 26 C17 18 47 18 47 26" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
      <path d="M13 29 C13 14 51 14 51 29" stroke="#FDE68A" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />

      {/* Heritage Tree: Deep Roots merging into Open Memoir Spine */}
      <path
        d="M26 50 C29 48 31 46 32 43 C33 46 35 48 38 50 C41 51.5 45 52 46 53 C43 52.5 37 51 34 47 C33 45 32 42 32 40 C32 42 31 45 30 47 C27 51 21 52.5 18 53 C19 52 23 51.5 26 50 Z"
        fill="url(#trunkGrad)"
      />

      {/* Main Trunk & Upward Canopy Branches */}
      <path
        d="M30.5 42 C30.5 35 25 31 21 28 C25 29 29 32 31 35 C31 32 30 26 27 22 C29 24 31 28 32 31 C33 28 35 24 37 22 C34 26 33 32 33 35 C35 32 39 29 43 28 C39 31 33.5 35 33.5 42 Z"
        fill="url(#trunkGrad)"
      />

      {/* Golden Foliage / Leaf Story Clusters */}
      {/* Center Crown Leaf */}
      <path d="M32 10 C34 14 34 18 32 21 C30 18 30 14 32 10 Z" fill="url(#treeGold)" />
      
      {/* Left Canopy Leaves */}
      <path d="M24 14 C27 16 28 20 25 23 C23 20 22 17 24 14 Z" fill="url(#treeGold)" />
      <path d="M17 19 C20 20 21 24 18 27 C16 24 15 21 17 19 Z" fill="url(#treeGold)" />
      <path d="M14 26 C17 26 19 30 16 32 C14 30 13 28 14 26 Z" fill="url(#treeGold)" />
      
      {/* Right Canopy Leaves */}
      <path d="M40 14 C42 17 41 20 39 23 C36 20 37 16 40 14 Z" fill="url(#treeGold)" />
      <path d="M47 19 C49 21 48 24 46 27 C43 24 44 20 47 19 Z" fill="url(#treeGold)" />
      <path d="M50 26 C51 28 50 30 48 32 C45 30 47 26 50 26 Z" fill="url(#treeGold)" />

      {/* Inner Heritage Accent Stars / Fruit Nodes */}
      <circle cx="32" cy="18" r="1.5" fill="#FFFBEB" />
      <circle cx="25" cy="22" r="1.3" fill="#FFFBEB" />
      <circle cx="39" cy="22" r="1.3" fill="#FFFBEB" />
      <circle cx="20" cy="28" r="1.1" fill="#FFFBEB" />
      <circle cx="44" cy="28" r="1.1" fill="#FFFBEB" />
    </svg>
  );

  if (!showText) {
    return (
      <div className={`relative shrink-0 ${currentSize.box} ${className}`}>
        {LogoIcon}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 ${currentSize.box} transition-transform hover:scale-105`}>
        {LogoIcon}
      </div>
      <div>
        <span className={`font-serif font-bold text-[#2C241E] block leading-tight tracking-tight ${currentSize.text}`}>
          Inheritance
        </span>
        <span className={`uppercase font-bold tracking-widest text-[#8B4513] block ${currentSize.sub}`}>
          Living Family Archive
        </span>
      </div>
    </div>
  );
};
