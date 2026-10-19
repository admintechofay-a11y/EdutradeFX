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
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Calendar,
  DollarSign,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SignalProvider, Signal, SignalProviderReview } from '@/types';
import { StarRating } from '@/components/common/StarRating';
import { Skeleton } from '@/components/common/Skeleton';
import { SignalCard } from '@/components/sp/SignalCard';
import { Modal } from '@/components/ui/Modal';

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
        console.error('Failed to load SP detail', err);
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
        setEnquiryForm({ name: '', email: '', phone: '', message: '' });
      }, 2000);
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
        <h2 className="text-2xl font-bold text-text-heading mb-2">Signal Provider Not Found</h2>
        <p className="text-text-muted mb-6">This provider is unavailable or has not been approved for public listing.</p>
        <Link
          href="/signal-providers"
          className="px-6 py-2.5 bg-blue text-white rounded-full text-sm font-semibold hover:bg-blue-hover transition"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const activeSignals = signals.filter((s) => s.status === 'ACTIVE');
  const closedSignals = signals.filter((s) => s.status !== 'ACTIVE');
  const plans = provider.plans || [];

  return (
    <div className="min-h-screen pb-24 text-text-body bg-white">
      {/* ─── Hero Header ────────────────────────────────────────── */}
      <div className="bg-surface-tint border-b border-border pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-soft">
                {provider.photo ? (
                  <img src={provider.photo} alt={provider.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-blue">
                    {provider.displayName[0]?.toUpperCase() || 'S'}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">{provider.displayName}</h1>
                  {provider.verificationStatus && (
                    <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Provider
                    </span>
                  )}
                  {provider.usesMartingale && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      Martingale Disclosed
                    </span>
                  )}
                </div>

                {provider.strategy && (
                  <p className="text-sm font-semibold text-text-heading mb-2">{provider.strategy}</p>
                )}

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={provider.avgRating || 0} />
                    <span className="font-bold text-text-heading ml-1">
                      {provider.avgRating ? provider.avgRating.toFixed(1) : '5.0'}
                    </span>
                    <span>({provider.totalReviews || 0} reviews)</span>
                  </div>
                  {provider.winRate !== undefined && provider.winRate !== null && (
                    <span className="text-green font-bold">
                      {provider.winRate}% Platform Win Rate
                    </span>
                  )}
                  <span>{provider.totalSignals || 0} signals issued</span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {provider.performanceLink && provider.performanceLinkVerified && (
                <a
                  href={provider.performanceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-border hover:bg-surface-tint text-text-heading rounded-xl text-xs font-bold shadow-soft transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue" />
                  <span>Verified Track Record</span>
                </a>
              )}
              {provider.telegramChannelUrl && (
                <a
                  href={provider.telegramChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue rounded-xl text-xs font-bold shadow-soft transition hover:bg-blue-100"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Channel</span>
                </a>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-xl text-xs font-bold shadow-sm transition min-h-[42px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Provider</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Persistent Risk Disclaimer Block ───────────────────── */}
      <div className="bg-amber-50/70 border-b border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-amber-950 flex items-start sm:items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong>Educational Purpose &amp; Risk Disclosure: </strong>
            Signals are for educational purposes only. Trading carries a high risk of loss. Past performance doesn&apos;t guarantee future results. EdutradeFX doesn&apos;t verify self-declared figures.
          </p>
        </div>
      </div>

      {/* ─── Main Content Grid ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Strategy Architecture (S5 Fix: Zero fabricated fallback text) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-text-heading flex items-center gap-2">
                <Radio className="w-5 h-5 text-green" />
                <span>Strategy Architecture</span>
              </h3>

              {provider.bio && (
                <p className="text-sm text-text-body leading-relaxed whitespace-pre-line">
                  {provider.bio}
                </p>
              )}

              {provider.strategyDetail ? (
                <div className="p-5 rounded-2xl bg-surface-tint border border-border space-y-2">
                  <h4 className="text-xs font-bold text-text-heading uppercase tracking-wider">
                    Detailed Methodology
                  </h4>
                  <p className="text-xs text-text-body leading-relaxed whitespace-pre-line">
                    {provider.strategyDetail}
                  </p>
                </div>
              ) : !provider.bio ? (
                <p className="text-xs text-text-muted italic">Strategy details not provided.</p>
              ) : null}

              {provider.specializedExpertise && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Specialized Expertise
                  </h4>
                  <p className="text-xs text-text-body leading-relaxed">{provider.specializedExpertise}</p>
                </div>
              )}

              {provider.marketAdaptation && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Market Condition Adaptation
                  </h4>
                  <p className="text-xs text-text-body leading-relaxed">{provider.marketAdaptation}</p>
                </div>
              )}

              {provider.uniqueValue && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    What Sets This Service Apart
                  </h4>
                  <p className="text-xs text-text-body leading-relaxed">{provider.uniqueValue}</p>
                </div>
              )}

              {/* Covered Instruments */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Active Instruments Traded
                </h4>
                <div className="flex flex-wrap gap-2">
                  {provider.instruments && provider.instruments.length > 0 ? (
                    provider.instruments.map((inst, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-surface-tint border border-border text-xs font-semibold text-text-heading"
                      >
                        {inst}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">Multi-Asset</span>
                  )}
                </div>
              </div>
            </div>

            {/* Declared Performance vs EdutradeFX Performance */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <h3 className="text-lg font-bold text-text-heading flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue" />
                    <span>Track Record &amp; Metrics</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    Self-Declared Track Record (Not Verified by EdutradeFX)
                  </span>
                </div>
                {provider.performancePeriodNote && (
                  <p className="text-xs text-text-muted italic">
                    Period declared by provider: &ldquo;{provider.performancePeriodNote}&rdquo;
                  </p>
                )}
              </div>

              {/* Declared Metrics Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Avg Monthly Return</div>
                  <div className="text-lg font-black font-mono text-navy mt-1">
                    {provider.declaredAvgMonthlyReturn !== undefined && provider.declaredAvgMonthlyReturn !== null
                      ? `${provider.declaredAvgMonthlyReturn}%`
                      : '—'}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">Self-Declared</div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Max Drawdown</div>
                  <div className="text-lg font-black font-mono text-red-600 mt-1">
                    {provider.declaredMaxDrawdown !== undefined && provider.declaredMaxDrawdown !== null
                      ? `${provider.declaredMaxDrawdown}%`
                      : '—'}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">Self-Declared</div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Declared Win Rate</div>
                  <div className="text-lg font-black font-mono text-green mt-1">
                    {provider.declaredWinRate !== undefined && provider.declaredWinRate !== null
                      ? `${provider.declaredWinRate}%`
                      : '—'}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">Self-Declared</div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Max Consec. Losses</div>
                  <div className="text-lg font-black font-mono text-text-heading mt-1">
                    {provider.maxConsecutiveLosses !== undefined && provider.maxConsecutiveLosses !== null
                      ? provider.maxConsecutiveLosses
                      : '—'}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">Self-Declared</div>
                </div>
              </div>

              {/* EdutradeFX Actual Performance */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-text-heading uppercase tracking-wider mb-3">
                  Verified Performance on EdutradeFX Broadcasts
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-2xl bg-green/5 border border-green/20">
                    <div className="text-[10px] uppercase font-bold text-text-muted">
                      Platform Win Rate
                    </div>
                    <div className="text-xl font-black font-mono text-green mt-1">
                      {provider.winRate !== undefined && provider.winRate !== null ? `${provider.winRate}%` : '—'}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      On provider-reported pips
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue/5 border border-blue/20">
                    <div className="text-[10px] uppercase font-bold text-text-muted">Total Broadcasts</div>
                    <div className="text-xl font-black font-mono text-navy mt-1">
                      {provider.totalSignals || 0}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">Signals issued</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-tint border border-border col-span-2 sm:col-span-1">
                    <div className="text-[10px] uppercase font-bold text-text-muted">Preferred Timeframes</div>
                    <div className="text-sm font-bold text-text-heading mt-1 truncate">
                      {provider.preferredTimeframes && provider.preferredTimeframes.length > 0
                        ? provider.preferredTimeframes.join(', ')
                        : '—'}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">Chart analysis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Management & Philosophy */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h3 className="text-lg font-bold text-text-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange" />
                <span>Risk Management Controls</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Max Leverage Used</div>
                  <div className="text-sm font-bold font-mono text-text-heading mt-0.5">
                    {provider.maxLeverageUsed ? `1 : ${provider.maxLeverageUsed}` : '—'}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Risk-Reward Preference</div>
                  <div className="text-sm font-bold font-mono text-text-heading mt-0.5">
                    {provider.riskRewardPreference || '—'}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Self-Assessed Risk</div>
                  <div className="text-sm font-bold text-text-heading mt-0.5">
                    {provider.riskCategory || '—'}
                  </div>
                </div>
              </div>

              {provider.riskPhilosophy && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase mb-1">Risk Philosophy</h4>
                  <p className="text-xs text-text-body leading-relaxed whitespace-pre-line">
                    {provider.riskPhilosophy}
                  </p>
                </div>
              )}

              {/* Hedging & Martingale Disclosure */}
              <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-text-heading">Hedging &amp; Martingale:</span>
                  {provider.usesHedging && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue font-bold text-[10px] border border-blue-200">
                      Uses Hedging
                    </span>
                  )}
                  {provider.usesMartingale && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-300">
                      Uses Martingale
                    </span>
                  )}
                  {!provider.usesHedging && !provider.usesMartingale && (
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold text-[10px] border border-green-200">
                      No Hedging or Martingale
                    </span>
                  )}
                </div>
                {provider.hedgingMartingaleNotes && (
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {provider.hedgingMartingaleNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Historical Closed Signals */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-heading">Recent Completed Trades</h3>
              {closedSignals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {closedSignals.slice(0, 6).map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-border text-text-muted text-xs shadow-soft">
                  Historical closed trades will populate here as signals are settled.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            {/* Subscription & Pricing Card */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Subscription &amp; Plans
              </h4>

              {provider.subscriptionModel === 'PAID' && plans.length > 0 ? (
                <div className="space-y-3">
                  {plans.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-heading">{p.name}</div>
                        <div className="text-[10px] text-text-muted uppercase">{p.period}</div>
                        {p.description && (
                          <div className="text-[11px] text-text-body mt-1">{p.description}</div>
                        )}
                      </div>
                      <div className="text-base font-black font-mono text-navy">
                        {p.currency} {Number(p.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <div className="text-xs font-bold text-green-800">Free Broadcast Channel</div>
                  <p className="text-[11px] text-green-700 mt-1">
                    Traders can follow this provider&apos;s educational broadcasts free of charge.
                  </p>
                </div>
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 py-3 bg-blue hover:bg-blue-hover text-white font-bold text-xs rounded-xl transition shadow-soft flex items-center justify-center gap-2 min-h-[42px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Provider</span>
              </button>
            </div>

            {/* Trading Styles & Experience */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Trading Profile &amp; Experience
              </h4>

              <div className="space-y-3 text-xs">
                {provider.yearsTrading !== undefined && provider.yearsTrading !== null && (
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-text-muted">Market Experience</span>
                    <span className="font-bold text-text-heading">{provider.yearsTrading} Years</span>
                  </div>
                )}
                {provider.updateFrequency && (
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-text-muted">Update Frequency</span>
                    <span className="font-semibold text-text-heading">
                      {provider.updateFrequency.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="text-text-muted">Live Q&amp;A / Webinars</span>
                  <span className="font-semibold text-text-heading">
                    {provider.offersLiveQA ? `Yes (${provider.liveQAFrequency || 'Periodic'})` : 'No'}
                  </span>
                </div>
              </div>

              {provider.tradingStyles && provider.tradingStyles.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] font-bold text-text-muted uppercase mb-1.5">Styles</div>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.tradingStyles.map((style, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue font-semibold text-xs border border-blue-100"
                      >
                        {style.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {provider.tradingStyleDescription && (
                <p className="text-[11px] text-text-muted leading-relaxed bg-surface-tint p-3 rounded-xl border border-border">
                  {provider.tradingStyleDescription}
                </p>
              )}

              {provider.inquiryHandlingApproach && (
                <div className="pt-2">
                  <div className="text-[10px] font-bold text-text-muted uppercase mb-1">
                    Inquiry Handling Approach
                  </div>
                  <p className="text-[11px] text-text-body leading-relaxed bg-surface-tint p-3 rounded-xl border border-border">
                    {provider.inquiryHandlingApproach}
                  </p>
                </div>
              )}
            </div>

            {/* Independent Verification Badges */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Compliance Verification Status
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-tint border border-border">
                  <span className="text-text-muted">Identity Document (KYC)</span>
                  <span className={`font-bold ${provider.idVerified ? 'text-green' : 'text-text-muted'}`}>
                    {provider.idVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-tint border border-border">
                  <span className="text-text-muted">Account Statement</span>
                  <span className={`font-bold ${provider.statementVerified ? 'text-green' : 'text-text-muted'}`}>
                    {provider.statementVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-tint border border-border">
                  <span className="text-text-muted">Performance Link</span>
                  <span className={`font-bold ${provider.performanceLinkVerified ? 'text-green' : 'text-text-muted'}`}>
                    {provider.performanceLinkVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        title={`Message ${provider.displayName}`}
        subtitle="Inquire about signal calls, strategy, or subscription details."
      >
        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-green mx-auto" />
            <h4 className="text-sm font-bold text-text-heading">Message Sent Successfully</h4>
            <p className="text-xs text-text-muted">
              The provider has received your inquiry and will reply via email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Your Name</label>
              <input
                type="text"
                required
                value={enquiryForm.name}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Your Email</label>
              <input
                type="email"
                required
                value={enquiryForm.email}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                placeholder="trader@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Phone <span className="text-text-muted font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={enquiryForm.phone}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                placeholder="+1 234 567 890"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Message</label>
              <textarea
                required
                rows={3}
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                placeholder="Write your questions regarding trading style, risk management, or subscriptions..."
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm mt-2"
            >
              {submitting ? 'Sending...' : 'Send Inquiry to Provider'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
