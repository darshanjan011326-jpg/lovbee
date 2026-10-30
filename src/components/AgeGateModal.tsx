import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  calculatedAge?: number;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ isOpen, onAcknowledge, calculatedAge }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#151515] rounded-3xl shadow-[0_25px_60px_rgba(225,29,72,0.4)] border border-[#E11D48]/40 p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-[#2B0813] text-[#FB7185] border border-[#E11D48]/50 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white font-display">18+ Age Restriction</h2>
          <p className="text-xs text-[#FB7185] font-semibold">
            Strict verification policy · Access denied
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 text-xs text-stone-300 leading-relaxed text-left space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
            <p>
              Lovbee is strictly reserved for adults aged 18 and older. Our community standards and legal terms prohibit anyone under the age of majority from accessing profiles, discovering singles, or sending messages.
            </p>
          </div>
          {typeof calculatedAge === 'number' && calculatedAge < 18 && (
            <p className="font-semibold text-rose-300">
              Entered date of birth indicates age <span className="font-mono text-white">{calculatedAge}</span>. You cannot register or proceed.
            </p>
          )}
        </div>

        <p className="text-[11px] text-stone-500">
          This restriction is strictly enforced at both the client layer and the PostgreSQL database constraint level.
        </p>

        <button
          onClick={onAcknowledge}
          className="w-full py-3 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] rounded-2xl transition-all shadow-sm cursor-pointer"
        >
          I Understand & Acknowledge
        </button>
      </div>
    </div>
  );
};
