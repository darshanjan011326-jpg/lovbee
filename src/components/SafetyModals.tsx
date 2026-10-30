import React, { useState } from 'react';
import { Ban, Flag, X, ShieldCheck } from 'lucide-react';
import { Profile } from '../types';
import { store } from '../services/store';

interface BlockModalProps {
  target: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onBlocked: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({ target, isOpen, onClose, onBlocked }) => {
  if (!isOpen || !target) return null;

  const handleConfirm = () => {
    store.blockUser(target.id);
    onBlocked();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#151515] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 mx-auto flex items-center justify-center">
          <Ban className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white font-display">
            Block {target.displayName}?
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            They will no longer see your profile, your mutual connection will be severed, and neither of you will be able to message.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
          >
            Confirm Block
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReportModalProps {
  target: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onReported: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ target, isOpen, onClose, onReported }) => {
  const [reason, setReason] = useState('Inappropriate communication or behavior');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.reportUser(target.id, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onReported();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#151515] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FB7185]">
            <Flag className="w-4 h-4 text-[#FB7185]" />
            <span>Safety Report: {target.displayName}</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Report Dispatched</p>
            <p className="text-xs text-stone-400">
              Our safety team has received your report. Thank you for protecting the Lovbee community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Select Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
              >
                <option value="Inappropriate communication or behavior">Inappropriate communication or harassment</option>
                <option value="Suspected underage account (under 18)">Suspected underage account (under 18)</option>
                <option value="Fake profile, impersonation or bot">Fake profile, impersonation or bot</option>
                <option value="Commercial solicitation or spam">Commercial solicitation or spam</option>
                <option value="Other terms violation">Other community guidelines violation</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe what happened..."
                className="w-full px-3 py-2 text-xs bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] rounded-xl hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] shadow-sm cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
