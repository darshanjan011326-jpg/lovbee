import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Check,
  X,
  Sparkles,
  Award,
  Heart,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Connection, ConnectionRequest, Profile } from '../types';
import { Avatar } from './Avatar';
import { store } from '../services/store';

interface ConnectionsViewProps {
  currentUser: Profile;
  onOpenChatWith: (connectionId: string) => void;
  onOpenReportModal: (target: Profile) => void;
  onOpenBlockModal: (target: Profile) => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  currentUser,
  onOpenChatWith,
  onOpenReportModal,
  onOpenBlockModal,
}) => {
  const [activeTab, setActiveTab] = useState<'connections' | 'received' | 'sent'>('connections');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const connections = store.getConnections();
  const receivedRequests = store.getConnectionRequests();
  const outgoingRequests = store.getOutgoingRequests();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAccept = (req: ConnectionRequest) => {
    const res = store.acceptConnectionRequest(req.id);
    if (res.success && res.connection) {
      showToast(`Connected with ${req.senderProfile.displayName}! You can now message.`);
      setActiveTab('connections');
    }
  };

  const handleDecline = (reqId: string) => {
    store.declineConnectionRequest(reqId);
    showToast('Invitation declined.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-[#E11D48]/40 text-white text-xs shadow-[0_10px_30px_rgba(225,29,72,0.3)] flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#FB7185] fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-xs font-semibold text-[#FB7185] mb-1.5">
            <Heart className="w-3.5 h-3.5 fill-[#E11D48] text-[#E11D48]" />
            <span>Mutual Connections</span>
            <span aria-hidden="true">·</span>
            <span>Sparks in Common</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Your Connections & Circle
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Private messaging is enabled only between mutually accepted connections.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-[#151515] border border-white/10 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'connections'
                ? 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Connected ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'received'
                ? 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Requests ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'sent'
                ? 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Sent ({outgoingRequests.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Mutual Connections */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-[#151515] rounded-3xl border border-white/10 hover:border-[#E11D48]/30 p-5 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={conn.partnerProfile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                          alt={conn.partnerProfile.displayName}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="text-base font-bold font-display text-white">
                              {conn.partnerProfile.displayName}
                            </h2>
                            <span className="text-xs text-stone-400">, {conn.partnerProfile.age}</span>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {conn.partnerProfile.occupation || conn.partnerProfile.location}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-[10px] font-semibold text-[#FB7185] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#F5D061]" />
                        <span>Connected</span>
                      </span>
                    </div>

                    {/* Shared crafts */}
                    <div className="flex flex-wrap gap-1.5">
                      {conn.partnerProfile.hobbies.slice(0, 3).map((h) => (
                        <span
                          key={h.hobbyId}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1C1C1E] border border-white/5 text-stone-300 font-medium"
                        >
                          {h.name}
                        </span>
                      ))}
                    </div>

                    {/* Last message note */}
                    {conn.lastMessage && (
                      <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 text-xs text-stone-300">
                        <p className="line-clamp-1 italic text-stone-300">
                          "{conn.lastMessage.content}"
                        </p>
                        <span className="text-[10px] text-stone-500 mt-1 block">
                          {new Date(conn.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => onOpenBlockModal(conn.partnerProfile)}
                      className="text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      Safety Options
                    </button>

                    <button
                      onClick={() => onOpenChatWith(conn.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#151515] border border-white/10 rounded-3xl space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 flex items-center justify-center mx-auto text-[#FB7185]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold font-display text-white">No Mutual Connections Yet</h3>
              <p className="text-xs text-stone-400">
                Express interest on Discover or accept incoming sparks to open your private conversations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#151515] rounded-3xl border border-white/10 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={req.senderProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                        alt={req.senderProfile.displayName}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold font-display text-white">
                            {req.senderProfile.displayName}
                          </h3>
                          <span className="text-xs text-stone-400">, {req.senderProfile.age}</span>
                        </div>
                        <p className="text-xs text-stone-400">{req.senderProfile.location}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1 text-xs">
                      <p className="text-[10px] font-semibold text-[#F5D061] uppercase">Personal Intro:</p>
                      <p className="text-stone-200 italic">"{req.introNote}"</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="px-3.5 py-2 text-xs text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(req)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#E11D48] to-[#9F1239] hover:brightness-110 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Connect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#151515] border border-white/10 rounded-3xl space-y-2 max-w-md mx-auto">
              <p className="text-sm font-semibold text-white">No Pending Received Invitations</p>
              <p className="text-xs text-stone-400">
                When singles send you a love note, you'll see them right here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Outgoing Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {outgoingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#151515] rounded-3xl border border-white/10 p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.recipientProfile?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                      alt={req.recipientProfile?.displayName || 'Recipient'}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {req.recipientProfile?.displayName || 'Recipient'}
                      </h3>
                      <p className="text-xs text-stone-400">
                        {req.recipientProfile?.location || 'Awaiting response'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/5 text-xs text-stone-300">
                    <p className="italic">"{req.introNote}"</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#151515] border border-white/10 rounded-3xl space-y-2 max-w-md mx-auto">
              <p className="text-sm font-semibold text-white">No Outgoing Invitations</p>
              <p className="text-xs text-stone-400">
                You haven't sent any invitations recently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
