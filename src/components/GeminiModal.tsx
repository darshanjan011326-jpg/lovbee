import React, { useState } from 'react';
import { Sparkles, KeyRound, CheckCircle2, AlertCircle, RefreshCw, X, ExternalLink, Bot, Copy, Check } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, saveGeminiApiKey, testGeminiConnection, isGeminiConfigured } from '../services/gemini';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose }) => {
  const currentKey = getGeminiApiKey();
  const [apiKey, setApiKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [sampleHobby, setSampleHobby] = useState('Pour-over Coffee & Ceramics');
  const [sampleOutput, setSampleOutput] = useState<string | null>(null);
  const [generatingSample, setGeneratingSample] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  if (!isOpen) return null;

  const isConfigured = Boolean(apiKey.trim() || isGeminiConfigured());

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();

    if (!cleanKey) {
      saveGeminiApiKey('');
      setTestResult({ success: true, message: 'Gemini API key cleared. Operating in offline mode.' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const result = await testGeminiConnection(cleanKey);
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      saveGeminiApiKey(cleanKey);
    }
  };

  const handleQuickSample = async () => {
    setGeneratingSample(true);
    setSampleOutput(null);

    const testRes = await testGeminiConnection(apiKey.trim() || undefined);
    if (!testRes.success) {
      setGeneratingSample(false);
      setTestResult(testRes);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() || getGeminiApiKey() });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create one authentic, charming 1-sentence opening message for someone passionate about "${sampleHobby}". Keep it playful and genuine.`,
      });
      setSampleOutput(res.text?.trim() || 'What got you drawn to your craft initially?');
    } catch (err: any) {
      setSampleOutput(err?.message || 'Failed to generate sample');
    } finally {
      setGeneratingSample(false);
    }
  };

  const handleCopySample = () => {
    if (sampleOutput) {
      navigator.clipboard.writeText(sampleOutput);
      setCopiedSample(true);
      setTimeout(() => setCopiedSample(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#151515] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#BE123C]/30 to-[#881337]/40 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>Google Gemini AI</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                  v2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Powers AI wingman icebreakers, prompt polishing & challenge motivation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isConfigured ? 'bg-emerald-400 shadow-[0_0_10px_#34D399]' : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-white">
                {isConfigured ? 'Gemini AI Ready' : 'API Key Unconfigured'}
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
            >
              <span>Get Free Key in AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 pr-20 rounded-xl bg-[#0C0C0E] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-[11px]"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Saved in local browser storage and loaded from <code className="text-stone-400">GEMINI_API_KEY</code>.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{testResult.success ? 'Success' : 'Connection Error'}</p>
                  <p className="text-[11px] mt-0.5 opacity-90">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={testing}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#BE123C] to-[#881337] text-white font-semibold flex items-center gap-1.5 hover:opacity-95 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>Test & Save Key</span>
              </button>
            </div>
          </form>

          {/* Interactive Playground Section */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-300 font-semibold">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Test Live Generation</span>
              </div>
              <button
                type="button"
                onClick={handleQuickSample}
                disabled={generatingSample}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {generatingSample ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                )}
                <span>Generate Prompt</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={sampleHobby}
                onChange={(e) => setSampleHobby(e.target.value)}
                placeholder="e.g. Bouldering, Vinyl Records, Bonsai"
                className="flex-1 px-3 py-2 rounded-xl bg-[#0C0C0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {sampleOutput && (
              <div className="p-3.5 rounded-2xl bg-[#0E0E10] border border-white/10 flex items-start justify-between gap-3 animate-in fade-in">
                <p className="text-stone-300 italic text-[11px] leading-relaxed">
                  "{sampleOutput}"
                </p>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="p-1 text-stone-400 hover:text-white shrink-0 rounded-lg hover:bg-white/5"
                  title="Copy sample prompt"
                >
                  {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
