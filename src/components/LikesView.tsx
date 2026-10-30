import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, ShieldCheck, ArrowRight, Flame } from 'lucide-react';
import { Profile, ConnectionRequest, Connection } from '../types';
import { store } from '../services/store';
import { MatchCelebrationModal } from './MatchCelebrationModal';
import { ProfileDetailModal } from './ProfileDetailModal';

interface LikesViewProps {
  currentUser: Profile;
  onOpenChat: (connectionId: string) => void;
  onNavigateToDiscover: () => void;
}

export const LikesView: React.FC<LikesViewProps> = ({
  currentUser,
  onOpenChat,
  onNavigateToDiscover,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [matchModalData, setMatchModalData] = useState<{
    isOpen: boolean;
    partner: Profile | null;
    connection?: Connection;
  }>({ isOpen: false, partner: null });

  const incomingRequests = store.getConnectionRequests();
  const outgoingRequests = store.getOutgoingRequests();
  const [activeSubTab, setActiveSubTab] = useState<'incoming' | 'sent'>('incoming');

  const handleSparkBack = (req: ConnectionRequest) => {
    const res = store.acceptConnectionRequest(req.id);
    if (res.success && res.connection) {
      setMatchModalData({
        isOpen: true,
        partner: req.senderProfile,
        connection: res.connection,
      });
    }
  };

  const handleDecline = (reqId: string) => {
    store.declineConnectionRequest(reqId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185] mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#E11D48] text-[#E11D48]" />
            <span>Sparks & Admirers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            People Who Felt the Buzz
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Singles who were drawn to your passions and sent a spark. Spark back to connect!
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="inline-flex p-1 bg-[#151515] rounded-2xl border border-white/10 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('incoming')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'incoming'
                ? 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Interested in You</span>
            {incomingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#9F1239] text-[10px] font-bold flex items-center justify-center">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('sent')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'sent'
                ? 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Sparks You Sent</span>
            <span className="text-stone-500 font-mono text-[11px]">({outgoingRequests.length})</span>
          </button>
        </div>
      </div>

      {/* Content for Incoming Likes */}
      {activeSubTab === 'incoming' && (
        <>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#151515] border border-white/10 rounded-3xl space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 flex items-center justify-center mx-auto text-[#FB7185]">
                <Heart className="w-8 h-8 fill-current opacity-80" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-white">No Pending Sparks Right Now</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  When someone likes your photos or shares your craft passion, their intro card will appear right here.
                </p>
              </div>
              <button
                onClick={onNavigateToDiscover}
                className="mt-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <span>Explore Discover Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingRequests.map((req) => {
                const sender = req.senderProfile;
                return (
                  <div
                    key={req.id}
                    className="group relative bg-[#151515] border border-white/10 hover:border-[#E11D48]/50 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between transition-all duration-300"
                  >
                    {/* Edge-to-edge photo header with romantic gradient */}
                    <div className="relative aspect-4/3 w-full bg-[#1C1C1E] overflow-hidden">
                      <img
                        src={sender.avatarUrl || sender.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'}
                        alt={sender.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 18+ Verified
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#E11D48]/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                          Sent Spark
                        </span>
                      </div>

                      {/* Name & Location Overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-xl font-bold font-display text-white">{sender.displayName}</h3>
                          <span className="text-base text-stone-300 font-medium">{sender.age}</span>
                        </div>
                        <p className="text-xs text-stone-400">{sender.occupation || sender.location}</p>
                      </div>
                    </div>

                    {/* Intro Note Content */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Personal Message Bubble */}
                        <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1.5 relative">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#F5D061]">
                            <Sparkles className="w-3 h-3" />
                            <span>Intro Note:</span>
                          </div>
                          <p className="text-xs text-stone-200 leading-relaxed italic">
                            "{req.introNote || 'Felt a mutual spark from your profile and passions!'}"
                          </p>
                        </div>

                        {/* Shared Passion */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-stone-400 text-[11px]">Resonated with:</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-[#FB7185] font-semibold text-[11px]">
                            {req.sharedHobbyReference || sender.hobbies[0]?.name || 'Shared Craft'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white text-xs font-medium transition-colors"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleSparkBack(req)}
                          className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white text-xs font-semibold hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] shadow-[0_0_20px_rgba(225,29,72,0.45)] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>Spark Back!</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Content for Sparks You Sent */}
      {activeSubTab === 'sent' && (
        <>
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#151515] border border-white/10 rounded-3xl space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-stone-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display text-white">No Outgoing Sparks</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  When you send an interest note to someone on Discover, you can check its status right here.
                </p>
              </div>
              <button
                onClick={onNavigateToDiscover}
                className="mt-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white text-xs font-semibold hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <span>Find Singles on Discover</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {outgoingRequests.map((req) => {
                const recipient = req.recipientProfile;
                if (!recipient) return null;
                return (
                  <div
                    key={req.id}
                    className="bg-[#151515] border border-white/10 rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={recipient.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                        alt={recipient.displayName}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold font-display text-white">
                            {recipient.displayName}
                          </h3>
                          <span className="text-xs text-stone-400">, {recipient.age}</span>
                        </div>
                        <p className="text-xs text-stone-400">{recipient.location}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 text-xs text-stone-300">
                      <p className="text-stone-400 text-[10px] uppercase font-semibold">Your note:</p>
                      <p className="italic mt-1">"{req.introNote}"</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <span className="text-stone-500">
                        Sent {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F5D061]/15 text-[#F5D061] border border-[#F5D061]/30 text-[11px] font-semibold">
                        Awaiting Spark
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Mutual Match Celebration Dialog */}
      <MatchCelebrationModal
        isOpen={matchModalData.isOpen}
        partner={matchModalData.partner}
        currentUser={currentUser}
        connection={matchModalData.connection}
        onClose={() => setMatchModalData({ isOpen: false, partner: null })}
        onOpenChat={onOpenChat}
      />
    </div>
  );
};
