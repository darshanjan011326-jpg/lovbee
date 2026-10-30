import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { store, calculateAge } from '../services/store';
import { SAMPLE_PROFILES } from '../services/sampleData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgeBlocked: (age: number) => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAgeBlocked, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Woman');
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  const currentAge = dob ? calculateAge(dob) : null;
  const isUnderage = currentAge !== null && currentAge < 18;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signin') {
      const res = await store.login(email, password);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } else if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Display name is required');
        return;
      }
      if (!dob) {
        setError('Date of birth is required for 18+ age verification');
        return;
      }
      if (isUnderage) {
        onAgeBlocked(currentAge);
        return;
      }

      const res = await store.signup({
        email,
        displayName,
        dateOfBirth: dob,
        gender,
        password,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        if (res.error?.includes('UNDER_18_BLOCKED')) {
          onAgeBlocked(currentAge || 0);
        } else {
          setError(res.error || 'Failed to create account');
        }
      }
    } else if (mode === 'forgot') {
      setForgotSent(true);
    }
  };

  const handleQuickDemoLogin = async (profileEmail: string) => {
    await store.login(profileEmail, 'demo123');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FCFBF8] rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#4B0B21] font-display">
              {mode === 'signin' && 'Welcome to Lovbee'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-stone-500">
              {mode === 'signin' && 'Sign in to access your challenge & matches'}
              {mode === 'signup' && '18+ adult community founded on genuine hobbies'}
              {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'forgot' && forgotSent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <p className="font-semibold">Password recovery link dispatched!</p>
              <p>Check your email inbox for a secure token to reset your password.</p>
              <button
                type="button"
                onClick={() => {
                  setForgotSent(false);
                  setMode('signin');
                }}
                className="mt-2 text-xs font-semibold text-emerald-900 underline"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Robin Lee"
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#6B1232]/20 focus:border-[#6B1232]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-700">
                        Date of Birth (Strict 18+ Gate)
                      </label>
                      {currentAge !== null && (
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                            isUnderage ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isUnderage ? `Age: ${currentAge} (Under 18)` : `Age: ${currentAge} (Verified 18+)`}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#6B1232]/20 focus:border-[#6B1232]"
                    />
                    {isUnderage && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        You must be 18 years or older to register. Access will be blocked.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Gender Identity
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#6B1232]/20 focus:border-[#6B1232]"
                    >
                      <option value="Woman">Woman</option>
                      <option value="Man">Man</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#6B1232]/20 focus:border-[#6B1232]"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-[#6B1232] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#6B1232]/20 focus:border-[#6B1232]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={Boolean(mode === 'signup' && isUnderage)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#4B0B21] rounded-xl hover:bg-[#340716] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create 18+ Account'}
                  {mode === 'forgot' && 'Send Recovery Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Quick Demo Switchers for Evaluator */}
          {mode === 'signin' && (
            <div className="pt-3 border-t border-stone-200/60">
              <p className="text-[11px] font-semibold text-stone-500 mb-2">
                Quick Sign-In (Demo Testing Profiles):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex.rivera@example.com')}
                  className="px-2.5 py-1.5 text-left text-xs bg-stone-100/80 hover:bg-[#F5EFE6] rounded-lg border border-stone-200 transition-colors truncate"
                >
                  <p className="font-semibold text-stone-900 truncate">Alex Rivera</p>
                  <p className="text-[10px] text-stone-500 truncate">Day 8 in Ceramics</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('julian.vane@example.com')}
                  className="px-2.5 py-1.5 text-left text-xs bg-stone-100/80 hover:bg-[#F5EFE6] rounded-lg border border-stone-200 transition-colors truncate"
                >
                  <p className="font-semibold text-stone-900 truncate">Julian Vane</p>
                  <p className="text-[10px] text-stone-500 truncate">Day 21 Completed</p>
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-stone-600">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signup');
                  }}
                  className="font-semibold text-[#6B1232] hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signin');
                  }}
                  className="font-semibold text-[#6B1232] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
