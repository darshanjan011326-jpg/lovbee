import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Ban,
  CheckCircle2,
  Database,
  Lock,
  LogOut,
} from 'lucide-react';
import { Profile } from '../types';
import { store } from '../services/store';

interface SettingsViewProps {
  currentUser: Profile;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenSupabaseModal,
  onLogout,
}) => {
  const [isIncognito, setIsIncognito] = useState(currentUser.isIncognito || false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const blockedUsers = store.getBlockedUsers();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleIncognito = () => {
    const nextVal = !isIncognito;
    setIsIncognito(nextVal);
    store.updateProfile({ isIncognito: nextVal });
    showToast(
      nextVal
        ? 'Incognito enabled: Your profile is now hidden from Discover.'
        : 'Public mode enabled: Your profile is visible to compatible members.'
    );
  };

  const handleExportData = () => {
    const jsonStr = store.exportUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lovbee_data_${currentUser.displayName.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Personal data archive exported successfully!');
  };

  const handleUnblock = (targetId: string) => {
    store.unblockUser(targetId);
    showToast('User unblocked.');
  };

  const handleDeleteAccount = () => {
    store.deleteAccount();
    onLogout();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 px-4 py-3 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white text-xs shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-3 border-b border-white/10">
        <h1 className="text-2xl font-bold font-display text-white">Settings & Privacy</h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Manage your safety, data visibility, and database persistence
        </p>
      </div>

      {/* Section 1: Visibility & Privacy */}
      <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#FB7185]" />
          <span>Profile Visibility & Discovery Controls</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1C1C1E] border border-white/5">
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-2 font-semibold text-xs text-white">
              {isIncognito ? (
                <EyeOff className="w-4 h-4 text-stone-400" />
              ) : (
                <Eye className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isIncognito ? 'Incognito Mode Active' : 'Public Discovery Active'}</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {isIncognito
                ? 'Your card is hidden from Discover. Only your current mutual connections can view your profile.'
                : 'Your profile is shown to compatible adults who share your passions.'}
            </p>
          </div>

          <button
            onClick={handleToggleIncognito}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer ${
              isIncognito
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-gradient-to-r from-[#E11D48] to-[#9F1239] text-white hover:brightness-110 shadow-xs'
            }`}
          >
            {isIncognito ? 'Disable Incognito' : 'Enable Incognito'}
          </button>
        </div>
      </div>

      {/* Section 2: Account & 18+ Verification */}
      <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#FB7185]" />
          <span>Account Credentials & Verification Status</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1">
            <span className="text-stone-400">Account Email:</span>
            <p className="font-semibold text-white">{currentUser.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1">
            <span className="text-stone-400">Age Gate Verification:</span>
            <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>18+ Verified Adult (Age {currentUser.age})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Blocked Users */}
      <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Ban className="w-4 h-4 text-rose-400" />
          <span>Blocked Members ({blockedUsers.length})</span>
        </h2>

        {blockedUsers.length > 0 ? (
          <div className="divide-y divide-white/5">
            {blockedUsers.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-stone-300 font-mono">User ID: {b.blockedId}</span>
                <button
                  onClick={() => handleUnblock(b.blockedId)}
                  className="px-3 py-1 text-xs text-[#FB7185] hover:text-[#FDA4AF] bg-white/5 rounded-lg"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500">
            You haven't blocked anyone. You can block any member from their profile or chat.
          </p>
        )}
      </div>

      {/* Section 4: Data Portability & Database */}
      <div className="bg-[#151515] rounded-3xl border border-white/10 p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#FB7185]" />
          <span>Database & GDPR Data Export</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-white">Export Personal Archive (JSON)</p>
            <p className="text-stone-400">
              Download all check-in logs, mutual connections, profile details, and conversations.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1C1216] border border-[#BE123C]/20 text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-white">Supabase / PostgreSQL Credentials</p>
            <p className="text-stone-400">
              Inspect database schema or attach live cloud Supabase keys.
            </p>
          </div>
          <button
            onClick={onOpenSupabaseModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold transition-all hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] shrink-0 cursor-pointer shadow-sm"
          >
            <span>Inspect Database</span>
          </button>
        </div>
      </div>

      {/* Section 5: Account Termination */}
      <div className="bg-[#151515] rounded-3xl border border-rose-950/40 p-6 space-y-4">
        <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone</span>
        </h2>

        {deleteConfirmOpen ? (
          <div className="p-4 rounded-2xl bg-[#2B0813] border border-rose-500/40 space-y-3 text-xs">
            <p className="font-semibold text-rose-200">
              Are you sure? This will delete your profile, check-ins, and mutual connections.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400">Permanently terminate your account data</span>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/40 text-xs font-semibold transition-colors"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
