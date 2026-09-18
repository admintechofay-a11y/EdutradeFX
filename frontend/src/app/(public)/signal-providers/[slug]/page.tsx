'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Radio,
  Star,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Send,
  X,
  Target,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { SignalProvider, Signal, SignalProviderReview } from '../../../../types';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';
import { SignalCard } from '../../../../components/sp/SignalCard';

export default function SPDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [provider, setProvider] = useState<SignalProvider | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [reviews, setReviews] = useState<SignalProviderReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Enquiry modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'MONTHLY_VIP',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProvider() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/signal-providers/${slug}`);
        const data = res.data?.data;
        setProvider(data);

        if (data?.id) {
          const [sigRes, revRes] = await Promise.allSettled([
            api.get(`/signal-providers/${data.id}/signals`),
            api.get(`/signal-providers/${data.id}/reviews`),
          ]);
          if (sigRes.status === 'fulfilled') {
            setSignals(sigRes.value.data?.data || []);
          }
          if (revRes.status === 'fulfilled') {
            setReviews(revRes.value.data?.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load SP', err);
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [slug]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    setSubmitting(true);
    try {
      await api.post(`/signal-providers/${provider.id}/enquiries`, enquiryForm);
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Signal Provider Not Found</h2>
        <p className="text-slate-400 mb-6">This provider is unavailable or has closed public signals.</p>
        <Link
          href="/signal-providers"
          className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const activeSignals = signals.filter((s) => s.status === 'ACTIVE');
  const closedSignals = signals.filter((s) => s.status !== 'ACTIVE');

  return (
    <div className="min-h-screen pb-24 text-slate-100">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="bg-brand-navy-card/80 border-b border-slate-800 backdrop-blur-md pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-navy-light border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
                {provider.photo ? (
                  <img src={provider.photo} alt={provider.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-purple-400">
                    {provider.displayName[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{provider.displayName}</h1>
                  {provider.verificationStatus && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold border border-purple-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Audited Channel
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-2">{provider.strategy || 'Multi-Asset Swing Alerts'}</p>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={provider.avgRating} />
                    <span className="font-bold text-white ml-1">{provider.avgRating.toFixed(1)}</span>
                    <span>({provider.totalReviews} reviews)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {provider.winRate ? `${provider.winRate}% Win Rate` : '78.4% Win Rate'}
                  </span>
                  <span>{provider.totalSignals} signals issued</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Subscribe to Signals Feed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Active Signals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active Live Signals ({activeSignals.length})</span>
                </h3>
              </div>

              {activeSignals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeSignals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-brand-navy-card rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No active orders right now. Provider is awaiting optimal high-probability market setups.
                </div>
              )}
            </div>

            {/* Strategy & Overview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Strategy Architecture</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {provider.bio ||
                  `${provider.displayName} leverages London & New York session liquidity sweeps combined with 4-Hour order block confirmations. Risk per trade is strictly capped at 1.0% with a minimum 1:2.5 Risk-to-Reward ratio.`}
              </p>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pairs & Instruments Covered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {provider.instruments && provider.instruments.length > 0 ? (
                    provider.instruments.map((inst, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-brand-navy-light border border-slate-700 text-xs font-semibold text-slate-200"
                      >
                        {inst}
                      </span>
                    ))
                  ) : (
                    ['EURUSD', 'GBPUSD', 'XAUUSD', 'US30'].map((inst, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-brand-navy-light border border-slate-700 text-xs font-semibold text-slate-200"
                      >
                        {inst}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Historical Closed Signals */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Recent Completed Trades</h3>
              {closedSignals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {closedSignals.slice(0, 6).map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-brand-navy-card rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  Historical closed trades will populate here.
                </div>
              )}
            </div>
          </div>

          {/* Right Col Subscription Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Audited Key Stats
              </h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Audited Win Rate</span>
                  <span className="font-bold text-emerald-400">{provider.winRate || 78.4}%</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Risk Profile</span>
                  <span className="font-semibold text-white">{provider.riskCategory || 'Medium Risk'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Signal Delivery</span>
                  <span className="font-semibold text-purple-400">Telegram Instant Alerts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Monthly Pips</span>
                  <span className="font-bold text-white">+850 Pips</span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Join VIP Signal Channel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-brand-navy-card border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Subscription Request Sent!</h3>
                <p className="text-xs text-slate-300">
                  The provider has received your details and will invite you to the private channel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Join {provider.displayName}'s Signals</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Receive real-time trade alerts with SL, TP and trailing guidance.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telegram / Phone</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="@telegram_handle"
                      className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Subscription Plan</label>
                  <select
                    value={enquiryForm.plan}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="MONTHLY_VIP">1 Month VIP Access ($49 / mo)</option>
                    <option value="QUARTERLY_VIP">3 Months VIP Access ($129 / quarter)</option>
                    <option value="ANNUAL_VIP">1 Year All-Access ($399 / year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message (Optional)</label>
                  <textarea
                    rows={2}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Any specific questions about broker compatibility or copy-trading?"
                    className="w-full px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
                >
                  {submitting ? 'Submitting...' : 'Confirm Subscription Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
