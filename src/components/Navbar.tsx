import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Heart,
  Users,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Database,
  Compass,
  Gamepad2,
  Lock,
} from 'lucide-react';
import { Profile, NavTabType } from '../types';
import { Avatar } from './Avatar';
import { LovbeeLogo } from './LovbeeLogo';
import { getSupabaseConfig } from '../services/supabase';
import { store } from '../services/store';

export type { NavTabType };

interface NavbarProps {
  currentUser: Profile;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
  pendingRequestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenSupabaseModal,
  onLogout,
  pendingRequestsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLive } = getSupabaseConfig();
  const isDemo = store.getIsDemoMode();
  const isUnlocked = store.isMatchingUnlocked();

  const navLinks: {
    id: NavTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    locked?: boolean;
  }[] = [
    { id: 'challenge', label: '21-Day Challenge', icon: Flame },
    { id: 'play', label: 'Play', icon: Gamepad2 },
    { id: 'discover', label: 'Discover', icon: Sparkles, locked: !isUnlocked },
    { id: 'likes', label: 'Likes', icon: Heart, badge: pendingRequestsCount, locked: !isUnlocked },
    { id: 'connections', label: 'Connections', icon: Users, locked: !isUnlocked },
    { id: 'messages', label: 'Messages', icon: MessageSquare, locked: !isUnlocked },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0608]/92 backdrop-blur-xl border-b border-[#BE123C]/20 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => onSelectTab(isUnlocked ? 'discover' : 'challenge')}
          className="hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 text-left focus:outline-none"
        >
          <LovbeeLogo size="sm" showWordmark={true} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#E11D48]/20 to-[#BE123C]/10 font-semibold shadow-inner border border-[#E11D48]/30'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#FB7185]' : 'text-stone-400'
                  }`}
                />
                <span>{item.label}</span>

                {item.locked && (
                  <Lock className="w-3 h-3 text-stone-500" />
                )}

                {Boolean(item.badge && item.badge > 0 && isUnlocked) && (
                  <span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#E11D48] text-white shadow-[0_0_8px_#E11D48]">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FB7185] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mode Switcher Pill */}
          <button
            onClick={() => store.setDemoMode(!isDemo)}
            title={isDemo ? 'Switch to Live Database Profiles Only' : 'Switch to Demo Evaluation Mode'}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
              isDemo
                ? 'bg-[#2B0813] border-[#E11D48]/40 text-[#FDA4AF] hover:border-[#E11D48]'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDemo ? 'bg-[#E11D48] shadow-[0_0_8px_#E11D48]' : 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
              }`}
            />
            <span className="font-semibold text-[11px]">
              {isDemo ? 'Demo Mode' : 'Live Community'}
            </span>
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-white/5 border border-white/10 transition-colors focus:outline-none"
              aria-expanded={dropdownOpen}
            >
              <Avatar
                id={currentUser.id}
                name={currentUser.displayName}
                avatarUrl={currentUser.avatarUrl}
                size="sm"
              />
              <span className="hidden lg:block text-xs font-medium text-stone-200 max-w-[100px] truncate pr-1">
                {currentUser.displayName.split(' ')[0]}
              </span>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 bg-[#160D11] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-[#BE123C]/30 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-stone-400 truncate text-[11px]">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#FB7185]">
                      <Flame className="w-3.5 h-3.5 text-[#FB7185]" />
                      <span>{currentUser.challenge?.currentStreak || 0} Day Consistency Streak</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-stone-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-stone-400" />
                    <span>View & Edit My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('challenge');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-stone-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                  >
                    <Flame className="w-4 h-4 text-[#FB7185]" />
                    <span>21-Day Ritual Progress</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-stone-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4 text-stone-400" />
                    <span>Dating & Privacy Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSupabaseModal();
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-stone-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                  >
                    <Database className="w-4 h-4 text-[#FB7185]" />
                    <span>Database Status ({isLive ? 'Supabase' : isDemo ? 'Demo Mode' : 'Local DB'})</span>
                  </button>

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
