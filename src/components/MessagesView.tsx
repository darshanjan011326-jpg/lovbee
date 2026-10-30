import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Shield,
  Flag,
  Ban,
  Clock,
  Sparkles,
  Lock,
  ChevronLeft,
  Heart,
  Smile,
} from 'lucide-react';
import { Connection, Message, Profile } from '../types';
import { Avatar } from './Avatar';
import { store } from '../services/store';
import { generateIcebreakers, isGeminiConfigured } from '../services/gemini';

interface MessagesViewProps {
  currentUser: Profile;
  selectedConnectionId?: string;
  onOpenReportModal: (target: Profile) => void;
  onOpenBlockModal: (target: Profile) => void;
  onOpenGeminiModal?: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  selectedConnectionId,
  onOpenReportModal,
  onOpenBlockModal,
  onOpenGeminiModal,
}) => {
  const connections = store.getConnections();
  const [activeConnectionId, setActiveConnectionId] = useState<string>(
    selectedConnectionId || connections[0]?.id || ''
  );
  const [inputContent, setInputContent] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState<boolean>(Boolean(selectedConnectionId));
  const [aiLoading, setAiLoading] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConnectionId) {
      setActiveConnectionId(selectedConnectionId);
      setMobileDetailOpen(true);
    } else if (!activeConnectionId && connections.length > 0) {
      setActiveConnectionId(connections[0].id);
    }
  }, [selectedConnectionId, connections]);

  const activeConnection = connections.find((c) => c.id === activeConnectionId);
  const messages = activeConnection ? store.getMessages(activeConnection.id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeConnectionId) return;

    store.sendMessage(activeConnectionId, inputContent);
    setInputContent('');
  };

  const handleQuickHeart = () => {
    if (!activeConnectionId) return;
    store.sendMessage(activeConnectionId, '❤️');
  };

  const handleGenerateAiIcebreaker = async () => {
    if (!activeConnection) return;
    if (!isGeminiConfigured() && onOpenGeminiModal) {
      onOpenGeminiModal();
      return;
    }

    setAiLoading(true);
    try {
      const generated = await generateIcebreakers(activeConnection.partnerProfile, currentUser);
      setDynamicSuggestions(generated);
      if (generated.length > 0) {
        setInputContent(generated[0]);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const defaultSuggestions = [
    activeConnection?.partnerProfile.hobbies[0]
      ? `How is your recent practice in ${activeConnection.partnerProfile.hobbies[0].name} going?`
      : 'What ritual anchors your morning routine?',
    'Any favorite vinyl record or book you’ve loved recently?',
    'What drew you to start this craft initially?',
  ];

  const promptSuggestions = dynamicSuggestions || defaultSuggestions;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-6rem)] min-h-[520px]">
      <div className="bg-[#151515] rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] h-full flex overflow-hidden">
        {/* Left: Connection List */}
        <div
          className={`w-full md:w-80 border-r border-white/10 flex flex-col shrink-0 ${
            mobileDetailOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-white/10 bg-[#111111]">
            <h2 className="text-base font-bold text-white font-display">Conversations</h2>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mutual Connections Only</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {connections.length > 0 ? (
              connections.map((conn) => {
                const isSelected = conn.id === activeConnectionId;
                return (
                  <button
                    key={conn.id}
                    onClick={() => {
                      setActiveConnectionId(conn.id);
                      setMobileDetailOpen(true);
                    }}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-[#1C1C1E] border-l-3 border-[#E11D48]'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={conn.partnerProfile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                      alt={conn.partnerProfile.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">
                          {conn.partnerProfile.displayName}
                        </p>
                        {conn.lastMessage && (
                          <span className="text-[10px] text-stone-500 font-mono">
                            {new Date(conn.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#FB7185] truncate mt-0.5">
                        {conn.partnerProfile.hobbies[0]?.name || conn.partnerProfile.occupation}
                      </p>
                      <p className="text-xs text-stone-400 truncate mt-1">
                        {conn.lastMessage?.content || 'Felt the spark! Start talking.'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="font-semibold text-stone-300">No active conversations</p>
                <p className="text-[11px] text-stone-400">
                  Messaging unlocks when you form a mutual connection.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat View */}
        {activeConnection ? (
          <div
            className={`flex-1 flex flex-col bg-[#0E0E10] ${
              mobileDetailOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Chat Top Header */}
            <div className="p-4 border-b border-white/10 bg-[#151515] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileDetailOpen(false)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-stone-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <img
                  src={activeConnection.partnerProfile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                  alt={activeConnection.partnerProfile.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#E11D48]/40"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">
                      {activeConnection.partnerProfile.displayName}
                    </h3>
                    <span className="text-xs text-stone-400">
                      , {activeConnection.partnerProfile.age}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#FB7185] truncate">
                    {activeConnection.partnerProfile.hobbies[0]?.name || activeConnection.partnerProfile.location}
                  </p>
                </div>
              </div>

              {/* Safety & Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenReportModal(activeConnection.partnerProfile)}
                  title="Report user"
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenBlockModal(activeConnection.partnerProfile)}
                  title="Block user"
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Thread Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Mutual Match Banner */}
              <div className="text-center py-4 px-4 bg-[#151515] rounded-3xl border border-white/5 max-w-sm mx-auto space-y-1.5 shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#E11D48]/15 text-[#FB7185] flex items-center justify-center mx-auto">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Mutual Spark with {activeConnection.partnerProfile.displayName}
                </p>
                <p className="text-[11px] text-stone-400">
                  Connected over shared passions. Messages are protected and private.
                </p>
              </div>

              {/* Message Bubbles */}
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2.5 text-xs sm:text-sm leading-relaxed transition-all ${
                        isMe
                          ? 'rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white shadow-[0_4px_15px_rgba(225,29,72,0.35)]'
                          : 'rounded-2xl rounded-tl-xs bg-[#1C1216] border border-[#BE123C]/20 text-stone-200 shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Icebreaker suggestions */}
            {messages.length <= 4 && (
              <div className="px-4 py-2 border-t border-white/5 bg-[#121214] flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={handleGenerateAiIcebreaker}
                  disabled={aiLoading}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-[#BE123C]/20 border border-amber-500/30 text-[10px] font-semibold text-amber-300 hover:text-white flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                  title="Generate bespoke icebreaker with Gemini"
                >
                  <Sparkles className={`w-3 h-3 ${aiLoading ? 'animate-spin text-amber-400' : 'text-amber-300'}`} />
                  <span>{aiLoading ? 'Crafting...' : '✨ Gemini Wingman'}</span>
                </button>
                {promptSuggestions.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputContent(prompt)}
                    className="px-3 py-1 rounded-full bg-[#1C1C1E] hover:bg-white/10 border border-white/10 text-[11px] text-stone-300 hover:text-white whitespace-nowrap transition-colors shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-white/10 bg-[#151515]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickHeart}
                  title="Send quick heart"
                  className="p-2.5 rounded-2xl bg-[#1C1C1E] border border-white/10 hover:border-[#E11D48]/40 text-[#FB7185] hover:scale-105 active:scale-95 transition-all"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAiIcebreaker}
                  disabled={aiLoading}
                  title="Generate icebreaker with Gemini AI"
                  className="p-2.5 rounded-2xl bg-[#1C1710] border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                </button>

                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={`Message ${activeConnection.partnerProfile.displayName.split(' ')[0]}...`}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#1C1C1E] border border-white/10 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputContent.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-8 text-center text-xs text-stone-500">
            <div className="space-y-2">
              <MessageSquare className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="font-semibold text-stone-300">Select a connection to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
