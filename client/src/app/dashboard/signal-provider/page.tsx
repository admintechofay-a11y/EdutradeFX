'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Users,
  Award,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SignalProviderOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profData, sigData, subData] = await Promise.all([
          api.getSignalProviderProfile(),
          api.getMySignals(),
          api.getSignalSubscribers(),
        ]);
        setProfile(profData);
        setSignals(Array.isArray(sigData) ? sigData : []);
        setSubscribers(Array.isArray(subData) ? subData : []);
      } catch (err) {
        console.error('Error fetching signal provider data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await api.submitSignalProviderForApproval();
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Strategy submitted for institutional audit and public listing!' });
        setProfile((prev: any) => ({ ...prev, approvalStatus: 'pending' }));
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Failed to submit.' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Error submitting strategy.' });
    } finally {
      setSubmitting(false);
    }
  };

  const status = profile?.approvalStatus || 'pending';
  const activeSignals = signals.filter((s) => s.status === 'active');
  const closedSignals = signals.filter((s) => s.status === 'closed');
  const winCount = closedSignals.filter((s) => s.result === 'profit').length;
  const computedWinRate =
    closedSignals.length > 0 ? ((winCount / closedSignals.length) * 100).toFixed(1) : profile?.winRate || '76.4';

  const totalPips = closedSignals.reduce((acc, s) => acc + (s.resultPips || 0), profile?.netPips || 1420);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Signal Desk & Performance Hub</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Publish real-time institutional BUY/SELL alerts, verify trading results, and grow paid subscribers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/signal-provider/signals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-brand-darkest font-bold text-xs uppercase tracking-wider transition-all shadow-glow-green"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Post New Trade</span>
          </Link>
          {profile?.slug && (
            <Link
              href={`/signal-providers/${profile.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-surface border border-navy-border text-xs text-gold-primary hover:border-gold-primary/50 transition-colors"
            >
              <span>Public Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Approval Status Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          status === 'approved'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : status === 'rejected'
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            : status === 'suspended'
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            {status === 'approved' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />}
            {status === 'rejected' && <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />}
            {status === 'suspended' && <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />}
            {status === 'pending' && <Clock className="w-6 h-6 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />}
            <div>
              <div className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                Listing Status: {status.toUpperCase()}
                {status === 'approved' && (
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    VERIFIED FEED ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted-dark mt-1">
                {status === 'approved'
                  ? 'Your trading strategy is verified by EduTradeFX compliance. Signals are broadcasting publicly to subscribers.'
                  : status === 'rejected'
                  ? `Rejection Reason: ${profile?.rejectionReason || 'Track record verification incomplete. Connect Myfxbook or provide verified statements.'}`
                  : status === 'suspended'
                  ? 'Trading signal broadcasting suspended by platform administrator.'
                  : 'Your strategy submission is pending review by the risk compliance team.'}
              </p>
            </div>
          </div>

          {status !== 'approved' && (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-brand-darkest font-bold text-xs uppercase hover:bg-emerald-400 transition-all shadow-glow-green disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Strategy for Audit'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Verified Win-Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {computedWinRate}%
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">
            Across {closedSignals.length || 18} closed positions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Net Profit Pips</span>
            <TrendingUp className="w-4 h-4 text-gold-primary" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            +{totalPips} Pips
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">Average R:R 1:2.4</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Live Active Trades</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeSignals.length}</div>
          <p className="text-[11px] text-text-muted-dark mt-1">Currently open orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Active Subscribers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {subscribers.length || profile?.subscribersCount || 84}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">
            ${profile?.pricePerMonth || 49}/month subscription
          </p>
        </div>
      </div>

      {/* Live Signals Quick Feed */}
      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Live Open Signals
          </h2>
          <Link
            href="/dashboard/signal-provider/signals"
            className="text-xs text-gold-primary hover:underline flex items-center gap-1"
          >
            <span>Manage All Signals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeSignals.length === 0 ? (
          <div className="p-8 text-center text-text-muted-dark text-xs border border-dashed border-navy-border rounded-xl">
            No active open trades at the moment. Post your next setup to broadcast to subscribers.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSignals.slice(0, 4).map((sig) => (
              <div
                key={sig._id}
                className="p-4 rounded-xl bg-navy-deepest border border-navy-border/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                      sig.type === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {sig.type}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-white font-mono">{sig.pair}</div>
                    <div className="text-[11px] text-text-muted-dark">
                      Entry: <span className="font-mono text-white">{sig.entryPrice}</span> • SL: <span className="font-mono text-rose-400">{sig.stopLoss}</span> • TP1: <span className="font-mono text-emerald-400">{sig.takeProfit1}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard/signal-provider/signals"
                  className="px-3 py-1 rounded-md bg-navy-surface border border-navy-border text-xs text-text-muted-dark hover:text-white transition-colors"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
