import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#151515] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2.5">
            {type === 'terms' ? (
              <FileText className="w-5 h-5 text-[#FB7185]" />
            ) : (
              <Shield className="w-5 h-5 text-[#FB7185]" />
            )}
            <h2 className="text-base font-bold text-white font-display">
              {type === 'terms' ? 'Lovbee Terms of Service' : 'Lovbee Privacy Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300 leading-relaxed font-sans">
          {type === 'terms' ? (
            <>
              <div className="p-3.5 rounded-2xl bg-[#2B0813] border border-[#E11D48]/40 text-[#FB7185] font-semibold">
                Important: Lovbee is strictly restricted to individuals aged 18 and older. Zero tolerance for fraudulent or underage accounts.
              </div>
              <h3 className="font-bold text-white text-sm">1. Community & Eligibility</h3>
              <p>
                By creating an account on Lovbee, you affirm that you are at least 18 years old and legally competent to enter into this agreement. Any attempt to misrepresent your age will result in immediate and permanent account termination.
              </p>
              <h3 className="font-bold text-white text-sm">2. Real Profiles & Authentic Content</h3>
              <p>
                Lovbee values genuine human connection. All photographs, biographies, hobby selections, and personal narratives must represent your real identity. Impersonation, automated bots, commercial solicitation, and artificial intelligence-generated personas are strictly banned.
              </p>
              <h3 className="font-bold text-white text-sm">3. Mutual Consent & Harassment Protection</h3>
              <p>
                Direct messaging is permitted only between mutually connected users. Harassment, unwanted solicitation, hate speech, and abusive communications are grounds for immediate blocking, reporting, and removal.
              </p>
              <h3 className="font-bold text-white text-sm">4. The 21-Day Ritual Engine</h3>
              <p>
                Lovbee uses a consistency challenge to encourage intentional dating. Check-ins must represent genuine activities. Submitting falsified check-ins defeats the intentional spirit of our community.
              </p>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/10 text-stone-200 font-medium">
                Your privacy is paramount. Lovbee never sells personal data or publicizes exact dates of birth.
              </div>
              <h3 className="font-bold text-white text-sm">1. Information We Collect</h3>
              <p>
                We collect your email address, date of birth for age verification (stored privately and never displayed publicly), display name, self-selected hobbies, profile photo, and lifestyle habits.
              </p>
              <h3 className="font-bold text-white text-sm">2. Age Verification Safeguards</h3>
              <p>
                Your date of birth is processed strictly to compute eligibility. Only your calculated age in full years is shared on your dating card. Underage attempts are immediately blocked.
              </p>
              <h3 className="font-bold text-white text-sm">3. Messaging Confidentiality</h3>
              <p>
                Messages exchanged between mutual connections are private and accessible only by you and your partner. We do not index conversations for advertising.
              </p>
              <h3 className="font-bold text-white text-sm">4. Incognito Mode & Deletion</h3>
              <p>
                You can toggle Incognito Mode at any time in Settings to hide your profile card from the Discover feed. You also have the right to export all personal data or permanently delete your account.
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#111111] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
