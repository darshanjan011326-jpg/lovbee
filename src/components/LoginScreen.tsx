import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Calendar,
  User,
  Mail,
  Loader2,
  Flame,
} from 'lucide-react';
import { store, calculateAge } from '../services/store';
import { LovbeeLogo } from './LovbeeLogo';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
  onAgeBlocked: (age: number) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenLegal,
  onAgeBlocked,
}) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register inputs
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('Woman');
  const [consent18, setConsent18] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Live age calculation for registration
  const currentAge = regDob ? calculateAge(regDob) : null;
  const isUnderage = currentAge !== null && currentAge < 18;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await store.login(email, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regDisplayName.trim()) {
      setErrorMessage('Please enter your display name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!regDob) {
      setErrorMessage('Date of birth is strictly required for age verification.');
      return;
    }
    if (isUnderage) {
      onAgeBlocked(currentAge || 0);
      return;
    }
    if (!consent18) {
      setErrorMessage('You must confirm that you are at least 18 years of age.');
      return;
    }
    if (!consentTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await store.signup({
        email: regEmail,
        displayName: regDisplayName,
        dateOfBirth: regDob,
        gender: regGender,
        password: regPassword,
      });
      setLoading(false);

      if (res.success) {
        onLoginSuccess();
      } else {
        if (res.error?.includes('UNDER_18_BLOCKED')) {
          onAgeBlocked(currentAge || 0);
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Failed to create account.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSuccess(true);
    }, 500);
  };

  const handleDemoLogin = async (userEmail?: string) => {
    setLoading(true);
    if (userEmail) {
      await store.login(userEmail, 'demo123');
    } else {
      store.loginDemoUser();
    }
    setLoading(false);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Cinematic Ambient Red and Burgundy Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-b from-[#E11D48]/25 via-[#330B17]/35 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[450px] h-[450px] bg-[#881337]/20 blur-[140px] pointer-events-none" />

      {/* Top Header with Brand Logo */}
      <header className="relative z-10 flex flex-col items-center justify-center pt-2 sm:pt-4">
        <LovbeeLogo size="lg" showWordmark={true} showTagline={true} />
      </header>

      {/* Main Glassmorphic Card Container */}
      <main className="relative z-10 w-full max-w-md mx-auto my-6">
        <div className="bg-[#150D11]/92 backdrop-blur-xl border border-[#BE123C]/25 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
          {/* Subtle top card glowing crimson hairline */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E11D48] to-transparent opacity-80" />

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-stone-400">
                  Step inside to connect with intentional singles.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-[#260A13] border border-[#E11D48]/40 text-xs text-rose-200 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-4 py-3 pl-10 text-sm bg-[#1C1216] border border-[#BE123C]/25 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-all"
                    />
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setView('forgot');
                      }}
                      className="text-xs text-[#FB7185] hover:text-[#FDA4AF] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pl-10 pr-10 text-sm bg-[#1C1216] border border-[#BE123C]/25 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-all"
                    />
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-sm shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Mode Quick Sign-in Section */}
              <div className="pt-2 border-t border-[#BE123C]/15 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 font-medium text-stone-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#FB7185]" />
                    Reviewer Demo Access
                  </span>
                  <span className="text-stone-500">1-Tap Quick Start</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin()}
                    className="py-2.5 px-3 rounded-xl bg-[#1C1216] hover:bg-[#25151C] border border-[#BE123C]/20 text-xs font-medium text-stone-300 hover:text-white transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-semibold text-white">Alex Rivera</p>
                      <p className="text-[10px] text-stone-400">Ceramics & Film</p>
                    </div>
                    <Flame className="w-3.5 h-3.5 text-[#FB7185] group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('clara.chen@example.com')}
                    className="py-2.5 px-3 rounded-xl bg-[#1C1216] hover:bg-[#25151C] border border-[#BE123C]/20 text-xs font-medium text-stone-300 hover:text-white transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-semibold text-white">Clara Chen</p>
                      <p className="text-[10px] text-stone-400">Botanical Artist</p>
                    </div>
                    <Flame className="w-3.5 h-3.5 text-[#FB7185] group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Switch to Register */}
              <div className="text-center pt-2">
                <p className="text-xs text-stone-400">
                  New to Lovbee?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setView('register');
                    }}
                    className="font-semibold text-[#FB7185] hover:text-[#FDA4AF] underline underline-offset-2 ml-1"
                  >
                    Create an Account (18+)
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW: REGISTER with strict 18+ verification */}
          {view === 'register' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/30 text-[11px] font-semibold text-[#FB7185]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F5D061]" />
                  <span>Strictly 18+ Adults Only</span>
                </div>
                <h1 className="text-2xl font-display font-bold text-white tracking-tight mt-1">
                  Join Lovbee
                </h1>
                <p className="text-xs text-stone-400">
                  Authentic singles sharing real passions.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-[#2B0813] border border-[#E11D48]/40 text-xs text-rose-200 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regDisplayName}
                      onChange={(e) => setRegDisplayName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      className="w-full px-4 py-2.5 pl-10 text-xs bg-[#1C1216] border border-[#BE123C]/25 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                    />
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-4 py-2.5 pl-10 text-xs bg-[#1C1216] border border-[#BE123C]/25 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                    />
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 pl-10 pr-10 text-xs bg-[#1C1216] border border-[#BE123C]/25 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                    />
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className={`w-full px-3 py-2.5 text-xs bg-[#1C1216] border rounded-xl text-white focus:outline-none ${
                          isUnderage
                            ? 'border-rose-500 bg-rose-950/30'
                            : currentAge !== null && currentAge >= 18
                            ? 'border-emerald-500/50'
                            : 'border-[#BE123C]/25 focus:border-[#E11D48]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Gender identity */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      I Identify As
                    </label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-[#1C1216] border border-[#BE123C]/25 rounded-xl text-white focus:outline-none focus:border-[#E11D48]"
                    >
                      <option value="Woman">Woman</option>
                      <option value="Man">Man</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Live Age Indicator feedback */}
                {currentAge !== null && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                      isUnderage
                        ? 'bg-[#2B0813] border-rose-500 text-rose-300'
                        : 'bg-[#1C1C1E] border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    <span>
                      Calculated Age: <strong className="font-mono">{currentAge} yrs</strong>
                    </span>
                    {isUnderage ? (
                      <span className="font-semibold text-rose-400">Must be 18+</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 18+ Verified
                      </span>
                    )}
                  </div>
                )}

                {/* Consents */}
                <div className="space-y-2 pt-1 text-xs text-stone-400">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent18}
                      onChange={(e) => setConsent18(e.target.checked)}
                      className="mt-0.5 rounded accent-[#E11D48] bg-[#1C1C1E] border-white/20"
                    />
                    <span>
                      I certify under penalty of perjury that I am at least 18 years old.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="mt-0.5 rounded accent-[#E11D48] bg-[#1C1C1E] border-white/20"
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal('terms')}
                        className="text-[#FB7185] underline hover:text-[#FDA4AF]"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal('privacy')}
                        className="text-[#FB7185] underline hover:text-[#FDA4AF]"
                      >
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || Boolean(isUnderage)}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs sm:text-sm shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete 18+ Verification & Enter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setView('login');
                    }}
                    className="font-semibold text-[#FB7185] hover:text-[#FDA4AF] underline underline-offset-2 ml-1"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                  Reset Password
                </h1>
                <p className="text-xs text-stone-400">
                  Enter your email and we'll send recovery instructions.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 rounded-2xl bg-[#1C1216] border border-[#BE123C]/25 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs text-stone-300 leading-relaxed">
                    If an account exists for <strong className="text-white">{email}</strong>, a secure reset link has been dispatched.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSuccess(false);
                      setView('login');
                    }}
                    className="text-xs font-semibold text-[#FB7185] hover:underline"
                  >
                    Back to Log In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-[#260A13] border border-[#E11D48]/40 text-xs text-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-4 py-3 text-xs sm:text-sm bg-[#1C1216] border border-[#BE123C]/25 rounded-2xl text-white placeholder-stone-500 focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs sm:text-sm shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full text-center text-xs text-stone-400 hover:text-white"
                  >
                    Cancel and return to Log In
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Elegant Dark Footer */}
      <footer className="relative z-10 text-center py-2 text-xs text-stone-500 space-y-1">
        <p className="flex items-center justify-center gap-3 text-[11px]">
          <span>Strictly 18+ Adults Only</span>
          <span>·</span>
          <button
            onClick={() => onOpenLegal('terms')}
            className="hover:text-stone-300 transition-colors"
          >
            Terms of Service
          </button>
          <span>·</span>
          <button
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-stone-300 transition-colors"
          >
            Privacy Policy
          </button>
        </p>
        <p className="text-[10px] text-stone-600">
          Lovbee © 2026. Real people. Shared passions. Meaningful connections.
        </p>
      </footer>
    </div>
  );
};
