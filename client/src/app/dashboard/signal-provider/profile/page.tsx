'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Check, AlertCircle, Radio } from 'lucide-react';
import { api } from '@/lib/api';

export default function SignalProviderProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    strategyName: '',
    bio: '',
    pricePerMonth: 49,
    marketsTradedText: 'EUR/USD, GBP/USD, XAU/USD',
    tradingStyle: 'Day Trading / SMC',
    riskLevel: 'Moderate (1% per trade)',
    myfxbookUrl: '',
    telegramChannel: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSignalProviderProfile();
        if (data) {
          setForm({
            name: data.name || '',
            strategyName: data.strategyName || '',
            bio: data.bio || '',
            pricePerMonth: data.pricePerMonth || 49,
            marketsTradedText: Array.isArray(data.marketsTraded) ? data.marketsTraded.join(', ') : 'EUR/USD, GBP/USD, XAU/USD',
            tradingStyle: data.tradingStyle || 'Day Trading / SMC',
            riskLevel: data.riskLevel || 'Moderate (1% per trade)',
            myfxbookUrl: data.myfxbookUrl || '',
            telegramChannel: data.telegramChannel || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      name: form.name,
      strategyName: form.strategyName,
      bio: form.bio,
      pricePerMonth: Number(form.pricePerMonth),
      tradingStyle: form.tradingStyle,
      riskLevel: form.riskLevel,
      myfxbookUrl: form.myfxbookUrl,
      telegramChannel: form.telegramChannel,
      marketsTraded: form.marketsTradedText.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await api.updateSignalProviderProfile(payload);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Strategy disclosures and pricing parameters updated successfully!' });
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error saving changes.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/signal-provider"
          className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-white">Strategy Parameters & Pricing</h1>
        <p className="text-xs text-text-muted-dark mt-1">
          Configure risk management boundaries, track record verification URLs, and subscriber pricing.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Strategy Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Provider / Brand Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Apex Alpha Signals"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Strategy Designation
              </label>
              <input
                type="text"
                value={form.strategyName}
                onChange={(e) => setForm({ ...form, strategyName: e.target.value })}
                placeholder="e.g. Institutional Liquidity & SMC Breakouts"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Methodology & Risk Disclosures
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Outline your entry conditions, max daily drawdown, position sizing, and how you manage high-impact news events."
              className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Commercials & Verification Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Monthly Subscription Fee ($ USD)
              </label>
              <input
                type="number"
                value={form.pricePerMonth}
                onChange={(e) => setForm({ ...form, pricePerMonth: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Trading Style
              </label>
              <input
                type="text"
                value={form.tradingStyle}
                onChange={(e) => setForm({ ...form, tradingStyle: e.target.value })}
                placeholder="Scalping / Day Trading / Swing"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Risk Model
              </label>
              <input
                type="text"
                value={form.riskLevel}
                onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
                placeholder="Low (0.5% risk) / Moderate (1%)"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Audited Track Record URL (Myfxbook / FXBlue)
              </label>
              <input
                type="url"
                value={form.myfxbookUrl}
                onChange={(e) => setForm({ ...form, myfxbookUrl: e.target.value })}
                placeholder="https://www.myfxbook.com/members/apexsignals"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Broadcast Telegram Channel / Community Hook
              </label>
              <input
                type="text"
                value={form.telegramChannel}
                onChange={(e) => setForm({ ...form, telegramChannel: e.target.value })}
                placeholder="https://t.me/apexsignalsvip"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Tradable Assets (comma-separated)
            </label>
            <input
              type="text"
              value={form.marketsTradedText}
              onChange={(e) => setForm({ ...form, marketsTradedText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-brand-darkest font-bold text-sm shadow-glow-green transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Strategy Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
