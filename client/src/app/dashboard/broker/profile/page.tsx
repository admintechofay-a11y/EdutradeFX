'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Save, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function BrokerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    website: '',
    headquarters: '',
    foundedYear: 2010,
    regulatorsText: '',
    platformsText: '',
    minDeposit: 50,
    maxLeverage: 500,
    eurUsdSpread: 0.1,
    tradingInstrumentsText: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await api.getBrokerProfile();
        if (data) {
          setForm({
            name: data.name || '',
            tagline: data.tagline || '',
            description: data.description || '',
            website: data.website || '',
            headquarters: data.headquarters || '',
            foundedYear: data.foundedYear || 2010,
            regulatorsText: Array.isArray(data.regulators) ? data.regulators.join(', ') : '',
            platformsText: Array.isArray(data.platforms) ? data.platforms.join(', ') : '',
            minDeposit: data.minDeposit || 50,
            maxLeverage: data.maxLeverage || 500,
            eurUsdSpread: data.eurUsdSpread || 0.1,
            tradingInstrumentsText: Array.isArray(data.tradingInstruments) ? data.tradingInstruments.join(', ') : '',
          });
        }
      } catch (err) {
        console.error('Failed to load broker profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      website: form.website,
      headquarters: form.headquarters,
      foundedYear: Number(form.foundedYear),
      minDeposit: Number(form.minDeposit),
      maxLeverage: Number(form.maxLeverage),
      eurUsdSpread: Number(form.eurUsdSpread),
      regulators: form.regulatorsText.split(',').map((s) => s.trim()).filter(Boolean),
      platforms: form.platformsText.split(',').map((s) => s.trim()).filter(Boolean),
      tradingInstruments: form.tradingInstrumentsText.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await api.updateBrokerProfile(payload);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Broker profile and trading terms updated successfully!' });
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to save profile changes.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-text-muted-dark">
        Loading broker profile data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/broker"
            className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-white">Edit Broker Profile & Spreads</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Update your public profile, trading platforms, regulatory authorizations, and commercial terms.
          </p>
        </div>
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
        {/* Company Identity */}
        <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Corporate Identification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Brokerage Brand Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. IC Markets Global"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Official Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://www.icmarkets.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Global Headquarters
              </label>
              <input
                type="text"
                value={form.headquarters}
                onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
                placeholder="Sydney, Australia"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Founded Year
              </label>
              <input
                type="number"
                value={form.foundedYear}
                onChange={(e) => setForm({ ...form, foundedYear: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Marketing Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="e.g. True ECN Forex Trading with Raw Spreads from 0.0 Pips"
              className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Company Overview & Execution Summary
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide a detailed overview of your liquidity providers, execution speed, and customer fund segregation."
              className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
            />
          </div>
        </div>

        {/* Trading Terms & Conditions */}
        <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Trading Specifications & Commercials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Minimum Deposit ($ USD)
              </label>
              <input
                type="number"
                value={form.minDeposit}
                onChange={(e) => setForm({ ...form, minDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Maximum Leverage (1:X)
              </label>
              <input
                type="number"
                value={form.maxLeverage}
                onChange={(e) => setForm({ ...form, maxLeverage: Number(e.target.value) })}
                placeholder="500"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                EUR/USD Typical Spread (pips)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.eurUsdSpread}
                onChange={(e) => setForm({ ...form, eurUsdSpread: Number(e.target.value) })}
                placeholder="0.0"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Regulatory Licenses (comma-separated)
              </label>
              <input
                type="text"
                value={form.regulatorsText}
                onChange={(e) => setForm({ ...form, regulatorsText: e.target.value })}
                placeholder="ASIC, FCA, CySEC, FSA Seychelles"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
              <span className="text-[11px] text-text-muted-dark">
                Official regulatory acronyms separated by commas
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                Supported Platforms (comma-separated)
              </label>
              <input
                type="text"
                value={form.platformsText}
                onChange={(e) => setForm({ ...form, platformsText: e.target.value })}
                placeholder="MetaTrader 4, MetaTrader 5, cTrader, TradingView"
                className="w-full px-3.5 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-sm shadow-glow-gold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
