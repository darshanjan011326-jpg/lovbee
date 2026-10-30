import React, { useState } from 'react';
import { Database, ShieldCheck, Copy, Check, X, RefreshCw, KeyRound } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema'>('config');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      saveSupabaseConfig('', '');
      setTestResult({ success: true, message: 'Switched back to Demo Mode.' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, key);
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      saveSupabaseConfig(url, key);
    }
  };

  const handleCopySchema = () => {
    const sqlText = `-- Lovbee PostgreSQL Schema with RLS
-- Please run this in your Supabase SQL Editor:
-- (Found in /supabase_schema.sql in the project root)
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#151515] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2B0813] flex items-center justify-center text-[#FB7185]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                PostgreSQL & Supabase Architecture
              </h2>
              <p className="text-xs text-stone-400">
                Production persistence layer with Row-Level Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-[#151515] text-xs font-semibold px-6 pt-3">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-[#E11D48] text-[#FB7185]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Credentials & Live Link
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-[#E11D48] text-[#FB7185]'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            PostgreSQL DDL & RLS Policies
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-300">
          {activeTab === 'config' ? (
            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 text-stone-300 leading-relaxed">
                Lovbee includes a dual database architecture: if no external Supabase URL is supplied, it operates with rich interactive demo storage. Connect your production credentials anytime:
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#2B0813] border-rose-500/40 text-rose-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{testResult.message}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-[#1C1C1E] border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#E11D48]"
                />
              </div>

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
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold flex items-center gap-1.5 hover:from-[#E11D48] hover:via-[#F43F5E] hover:to-[#BE123C] shadow-sm cursor-pointer"
                >
                  {testing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Test & Save Connection</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  Execute this migration script in your Supabase SQL editor:
                </p>
                <button
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#090909] border border-white/10 text-stone-300 text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
{`-- Lovbee Schema
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text not null,
  date_of_birth date not null,
  age int not null check (age >= 18),
  gender text default 'Prefer not to say',
  bio text,
  location text,
  occupation text,
  avatar_url text,
  profile_complete boolean default false,
  challenge_unlocked boolean default false,
  is_incognito boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
create policy "Public discover profiles" on public.profiles
  for select using (is_incognito = false or auth.uid() = id);`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
