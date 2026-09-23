'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Save,
  Radio,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Globe,
  Upload,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function SignalProviderProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [strategy, setStrategy] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [tradingStyle, setTradingStyle] = useState('Day Trading & Swing');
  const [telegramLink, setTelegramLink] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/signal-providers/my/profile');
        if (res.data?.success && res.data?.data) {
          const p = res.data.data;
          setProfile(p);
          setDisplayName(p.displayName || '');
          setBio(p.bio || '');
          setStrategy(p.strategy || '');
          setExperienceYears(p.experienceYears ? String(p.experienceYears) : '5');
          setTradingStyle(p.tradingStyle || 'Day Trading & Swing');
          setTelegramLink(p.telegramLink || '');
        }
      } catch (err) {
        console.error('Failed to load SP profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload = {
        displayName,
        bio,
        strategy,
        experienceYears: parseInt(experienceYears, 10) || 5,
        tradingStyle,
        telegramLink,
      };

      const res = await api.put('/signal-providers/my/profile', payload);
      if (res.data?.success) {
        setSuccessMsg('Signal provider trading profile updated successfully.');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Provider Public Bio & Strategy Disclosures
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure how your signal track record, risk parameters, and bio are presented to traders.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Public Trading Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Provider Display Name / Trading Desk
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Apex Alpha FX Signals"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Trading Style
              </label>
              <select
                value={tradingStyle}
                onChange={(e) => setTradingStyle(e.target.value)}
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Day Trading & Scalping">Day Trading & Scalping</option>
                <option value="Day Trading & Swing">Day Trading & Swing</option>
                <option value="Swing & Macro Fundamental">Swing & Macro Fundamental</option>
                <option value="Algorithmic Quantitative">Algorithmic Quantitative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Years of Market Experience
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                VIP Telegram / Community Link (Optional)
              </label>
              <input
                type="url"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="https://t.me/your_signals"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trader Bio & Credentials
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summary of trading background, market philosophy, and edge..."
              className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Strategy & Risk Management Protocol
            </label>
            <textarea
              rows={4}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="Explain how stop losses are calculated, max risk per trade (e.g. 1-2%), and take-profit scaling..."
              className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Bio...' : 'Save Provider Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
