import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Users,
  MessageSquare,
  User,
  Flame,
  Database,
  Compass,
  Gamepad2,
  Lock,
} from 'lucide-react';
import { Profile } from './types';
import { store, StreakStats } from './services/store';
import { Navbar, NavTabType } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { DiscoverView } from './components/DiscoverView';
import { LikesView } from './components/LikesView';
import { ChallengeView } from './components/ChallengeView';
import { PlayView } from './components/PlayView';
import { ConnectionsView } from './components/ConnectionsView';
import { MessagesView } from './components/MessagesView';
import { ProfileEditView } from './components/ProfileEditView';
import { SettingsView } from './components/SettingsView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { SupabaseModal } from './components/SupabaseModal';
import { AgeGateModal } from './components/AgeGateModal';
import { LegalModal } from './components/LegalModals';
import { BlockModal, ReportModal } from './components/SafetyModals';
import { LovbeeLogo } from './components/LovbeeLogo';
import { CheckinCelebrationModal } from './components/CheckinCelebrationModal';
import { getSupabaseConfig } from './services/supabase';
import { GeminiModal } from './components/GeminiModal';
import { isGeminiConfigured } from './services/gemini';

export default function App() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = store.getCurrentUser();

  // Navigation tab state - if not completed 21-day challenge, start on 'challenge'
  const [activeTab, setActiveTab] = useState<NavTabType>(() =>
    store.isMatchingUnlocked() ? 'discover' : 'challenge'
  );

  const [selectedChatConnectionId, setSelectedChatConnectionId] = useState<string | undefined>(undefined);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const [isAgeGateModalOpen, setIsAgeGateModalOpen] = useState(false);
  const [blockedAge, setBlockedAge] = useState<number | undefined>(undefined);

  const [blockTarget, setBlockTarget] = useState<Profile | null>(null);
  const [reportTarget, setReportTarget] = useState<Profile | null>(null);

  // Quick checkin modal
  const [globalCheckinOpen, setGlobalCheckinOpen] = useState(false);
  const [checkinActivity, setCheckinActivity] = useState('');
  const [checkinDuration, setCheckinDuration] = useState(30);
  const [checkinHobby, setCheckinHobby] = useState(
    currentUser?.challenge?.focusHobbyName || currentUser?.hobbies[0]?.name || 'Wheel-thrown Ceramics'
  );
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const pendingRequestsCount = store.getConnectionRequests().length;
  const { isLive } = getSupabaseConfig();
  const isDemo = store.getIsDemoMode();
  const isUnlocked = store.isMatchingUnlocked();

  const handleOpenChat = (connectionId: string) => {
    setSelectedChatConnectionId(connectionId);
    setActiveTab('messages');
  };

  const handleAgeBlocked = (age: number) => {
    setBlockedAge(age);
    setIsAgeGateModalOpen(true);
  };

  const [appCelebration, setAppCelebration] = useState<{
    isOpen: boolean;
    stats: StreakStats;
    dayNumber: number;
    hobbyName: string;
  } | null>(null);

  const handleQuickSubmitCheckin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = await store.submitCheckin({
      hobbyName: checkinHobby,
      activitySummary: checkinActivity.trim() || `Dedicated time to ${checkinHobby}`,
      durationMinutes: checkinDuration,
    });
    if (res.success && res.stats) {
      setGlobalCheckinOpen(false);
      setCheckinActivity('');
      setAppCelebration({
        isOpen: true,
        stats: res.stats,
        dayNumber: res.stats.completedDaysCount,
        hobbyName: checkinHobby,
      });
    } else {
      setCheckinError(res.error || 'Failed to submit check-in');
    }
  };

  // RULE: If unauthenticated, show LOGIN FIRST. No dashboard, no discovery, no main navigation!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090909]">
        <LoginScreen
          onLoginSuccess={() => {
            const user = store.getCurrentUser();
            if (user && !user.profileComplete) {
              // Will render OnboardingFlow
            } else {
              setActiveTab(store.isMatchingUnlocked() ? 'discover' : 'challenge');
            }
          }}
          onOpenLegal={(type) => setLegalModalType(type)}
          onAgeBlocked={handleAgeBlocked}
        />

        {/* Legal Modals */}
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />

        {/* 18+ Underage Access Denied Modal */}
        <AgeGateModal
          isOpen={isAgeGateModalOpen}
          calculatedAge={blockedAge}
          onAcknowledge={() => setIsAgeGateModalOpen(false)}
        />
      </div>
    );
  }

  // If user is logged in but profile is incomplete, guide them through Profile Setup!
  if (!currentUser.profileComplete) {
    return (
      <div className="min-h-screen bg-[#090909]">
        <OnboardingFlow
          user={currentUser}
          onComplete={() => setActiveTab(store.isMatchingUnlocked() ? 'discover' : 'challenge')}
        />
      </div>
    );
  }

  // Authenticated & Profile Complete: Show full dating app with persistent navigation!
  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#E11D48]/30 selection:text-white overflow-x-hidden">
      {/* Top Navigation Bar (Desktop & Tablet) */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onLogout={() => {
          store.logout();
          setActiveTab('discover');
        }}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8 overflow-x-hidden">
        {activeTab === 'discover' && (
          <DiscoverView
            currentUser={currentUser}
            onOpenBlockModal={setBlockTarget}
            onOpenReportModal={setReportTarget}
            onNavigateToChallenge={() => setActiveTab('challenge')}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'likes' && (
          <LikesView
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'connections' && (
          <ConnectionsView
            currentUser={currentUser}
            onOpenChatWith={handleOpenChat}
            onOpenBlockModal={setBlockTarget}
            onOpenReportModal={setReportTarget}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            currentUser={currentUser}
            selectedConnectionId={selectedChatConnectionId}
            onOpenBlockModal={setBlockTarget}
            onOpenReportModal={setReportTarget}
            onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
          />
        )}

        {activeTab === 'challenge' && (
          <ChallengeView
            currentUser={currentUser}
            onExploreMatches={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'play' && (
          <PlayView
            currentUser={currentUser}
            onExploreChallenge={() => setActiveTab('challenge')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileEditView
            currentUser={currentUser}
            onBack={() => setActiveTab(isUnlocked ? 'discover' : 'challenge')}
          />
        )}

        {activeTab === 'home' && (
          <DashboardView
            currentUser={currentUser}
            onNavigate={setActiveTab}
            onOpenCheckinModal={() => setGlobalCheckinOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
            onLogout={() => {
              store.logout();
              setActiveTab(isUnlocked ? 'discover' : 'challenge');
            }}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation Bar with Core Dating Tabs */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0608]/95 backdrop-blur-xl border-t border-[#BE123C]/20 px-2 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] grid grid-cols-6 items-center text-[10px]"
      >
        <button
          onClick={() => setActiveTab('challenge')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'challenge' ? 'text-[#FB7185] font-bold' : 'text-stone-400'
          }`}
        >
          <Flame className="w-4 h-4 text-[#FB7185]" />
          <span className="mt-0.5 truncate">21 Days</span>
        </button>

        <button
          onClick={() => setActiveTab('play')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'play' ? 'text-[#FB7185] font-bold' : 'text-stone-400'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="mt-0.5 truncate">Play</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors relative ${
            activeTab === 'discover' ? 'text-[#FB7185] font-bold' : 'text-stone-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="mt-0.5 truncate">Discover</span>
          {!isUnlocked && (
            <span className="absolute top-1 right-2 text-[9px] text-stone-500">
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors relative ${
            activeTab === 'likes' ? 'text-[#FB7185] font-bold' : 'text-stone-400'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="mt-0.5 truncate">Likes</span>
          {pendingRequestsCount > 0 && isUnlocked && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#E11D48] shadow-[0_0_6px_#E11D48]" />
          )}
          {!isUnlocked && (
            <span className="absolute top-1 right-2 text-[9px] text-stone-500">
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors relative ${
            activeTab === 'connections' ? 'text-[#FB7185] font-bold' : 'text-stone-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="mt-0.5 truncate">Circle</span>
          {!isUnlocked && (
            <span className="absolute top-1 right-2 text-[9px] text-stone-500">
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'profile' ? 'text-[#FB7185] font-bold' : 'text-stone-400'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="mt-0.5 truncate">Profile</span>
        </button>
      </nav>

      {/* Global Quick Checkin Modal */}
      {globalCheckinOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#151515] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Daily Challenge Check-in
                </h3>
                <p className="text-xs text-stone-400">Log today's deliberate practice</p>
              </div>
              <button
                onClick={() => setGlobalCheckinOpen(false)}
                className="text-stone-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {checkinError && (
              <div className="p-3 rounded-xl bg-[#2B0813] border border-rose-500/40 text-xs text-rose-300">
                {checkinError}
              </div>
            )}

            <form onSubmit={handleQuickSubmitCheckin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Craft / Pursuit</label>
                <select
                  value={checkinHobby}
                  onChange={(e) => setCheckinHobby(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
                >
                  {currentUser.hobbies.map((h) => (
                    <option key={h.hobbyId} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  What did you practice today?
                </label>
                <input
                  type="text"
                  required
                  value={checkinActivity}
                  onChange={(e) => setCheckinActivity(e.target.value)}
                  placeholder="e.g. 35 min wheel throwing, trimmed foot rings"
                  className="w-full px-3 py-2 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Time spent: <span className="font-mono text-white font-bold">{checkinDuration} min</span>
                </label>
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={checkinDuration}
                  onChange={(e) => setCheckinDuration(Number(e.target.value))}
                  className="w-full accent-[#E11D48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGlobalCheckinOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Complete Today's Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Check-in Celebration Modal */}
      {appCelebration?.isOpen && (
        <CheckinCelebrationModal
          isOpen={appCelebration.isOpen}
          onClose={() => setAppCelebration(null)}
          stats={appCelebration.stats}
          dayNumber={appCelebration.dayNumber}
          hobbyName={appCelebration.hobbyName}
          onViewCalendar={() => {
            setAppCelebration(null);
            setActiveTab('challenge');
          }}
        />
      )}

      {/* Modals */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <GeminiModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      <AgeGateModal
        isOpen={isAgeGateModalOpen}
        calculatedAge={blockedAge}
        onAcknowledge={() => setIsAgeGateModalOpen(false)}
      />

      <BlockModal
        target={blockTarget}
        isOpen={Boolean(blockTarget)}
        onClose={() => setBlockTarget(null)}
        onBlocked={() => {
          setActiveTab('discover');
        }}
      />

      <ReportModal
        target={reportTarget}
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onReported={() => {}}
      />

      {/* Quiet Dark Romantic Footer */}
      <footer className="border-t border-white/10 bg-[#090909] py-6 px-4 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LovbeeLogo size="xs" showWordmark={true} />
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-stone-400">Find your buzz. Feel the love.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>18+ Verified Adult Community</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <button
              onClick={() => setLegalModalType('terms')}
              className="hover:text-white transition-colors"
            >
              Terms
            </button>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-[#FB7185] hover:text-[#FDA4AF] transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3" />
              <span>{isLive ? 'Supabase Connected' : isDemo ? 'Demo Mode' : 'Live Community'}</span>
            </button>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isGeminiConfigured() ? 'Gemini AI Ready' : 'Connect Gemini AI'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
