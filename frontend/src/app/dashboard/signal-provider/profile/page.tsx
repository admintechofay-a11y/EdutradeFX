'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Star,
  Clock,
  Radio,
  TrendingUp,
  Percent,
  AlertTriangle,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Globe,
  Share2,
  Lock,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SignalProvider } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

export default function SignalProviderProfilePreviewPage() {
  const [profile, setProfile] = useState<SignalProvider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.get('/signal-providers/my/profile');
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load SP profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-sm text-text-muted">No signal provider profile found.</p>
        <Link
          href="/dashboard/signal-provider/onboarding"
          className="mt-4 inline-block px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  const plans = profile.plans || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-24">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue text-white flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-heading">Public Profile Live Preview</div>
            <div className="text-[11px] text-text-muted">
              This preview matches what prospective traders see. Private contact details (legal name, phone, residence, KYC documents) are strictly private.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile.slug && (
            <Link
              href={`/signal-providers/${profile.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-border hover:bg-surface-tint text-text-heading rounded-xl text-xs font-bold transition shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-text-muted" /> Public URL
            </Link>
          )}
          <Link
            href="/dashboard/signal-provider/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit In Wizard
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar / Photo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-tint border-2 border-border shadow-soft shrink-0">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl text-blue bg-blue-50">
                {profile.displayName ? profile.displayName[0].toUpperCase() : 'S'}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-text-heading truncate">
                {profile.displayName}
              </h1>
              {profile.verificationStatus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                  <ShieldCheck className="w-3 h-3" /> Verified Provider
                </span>
              )}
              {profile.usesMartingale && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> Martingale Disclosed
                </span>
              )}
            </div>

            <p className="text-xs text-text-body font-medium mb-3 line-clamp-2">
              {profile.strategy || 'Multi-Asset Trading & Signal Execution'}
            </p>

            <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
              {profile.yearsTrading !== undefined && profile.yearsTrading !== null && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  <span className="font-semibold text-text-heading">{profile.yearsTrading} Years</span> Experience
                </span>
              )}
              {profile.riskCategory && (
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-text-muted" />
                  Risk Level: <span className="font-semibold text-text-heading">{profile.riskCategory}</span>
                </span>
              )}
              {profile.avgRating ? (
                <span className="flex items-center gap-1 text-orange">
                  <Star className="w-3.5 h-3.5 fill-orange" />
                  <span className="font-bold text-text-heading">{profile.avgRating.toFixed(1)}</span>
                  <span>({profile.totalReviews || 0} reviews)</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 flex md:flex-col gap-2">
            <Link
              href="/dashboard/signal-provider/onboarding?step=1"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-tint border border-border text-xs font-semibold text-text-heading hover:bg-blue-50 hover:text-blue transition"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Identity
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy & Biography */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <Radio className="w-4 h-4 text-green" />
                <span>Strategy Architecture & Methodology</span>
              </h2>
              <Link
                href="/dashboard/signal-provider/onboarding?step=7"
                className="text-xs text-blue font-bold hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </Link>
            </div>

            {profile.bio && (
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase mb-1">Provider Overview / Bio</h4>
                <p className="text-xs text-text-body leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            {profile.strategyDetail ? (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-text-muted uppercase mb-1">Detailed Strategy Logic</h4>
                <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs text-text-body leading-relaxed whitespace-pre-line">
                  {profile.strategyDetail}
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">No detailed strategy description submitted yet.</p>
            )}

            {profile.specializedExpertise && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-text-muted uppercase mb-1">Specialized Expertise</h4>
                <p className="text-xs text-text-body leading-relaxed">{profile.specializedExpertise}</p>
              </div>
            )}

            {profile.marketAdaptation && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-text-muted uppercase mb-1">Market Condition Adaptation</h4>
                <p className="text-xs text-text-body leading-relaxed">{profile.marketAdaptation}</p>
              </div>
            )}

            {profile.uniqueValue && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-text-muted uppercase mb-1">What Sets This Service Apart</h4>
                <p className="text-xs text-text-body leading-relaxed">{profile.uniqueValue}</p>
              </div>
            )}
          </div>

          {/* Declared Performance vs Platform Performance */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue" />
                  <span>Performance Track Record</span>
                </h2>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Self-declared metrics vs. verified trades recorded directly on EdutradeFX.
                </p>
              </div>
              <Link
                href="/dashboard/signal-provider/onboarding?step=3"
                className="text-xs text-blue font-bold hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </Link>
            </div>

            {/* Declared Metrics Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-heading uppercase tracking-wider">
                  Self-Declared Track Record Metrics
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Self-Declared (Not Verified)
                </span>
              </div>
              {profile.performancePeriodNote && (
                <p className="text-[11px] text-text-muted mb-3 italic">
                  Period covered: &ldquo;{profile.performancePeriodNote}&rdquo;
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Avg Monthly Return</div>
                  <div className="text-base font-black font-mono text-navy mt-1">
                    {profile.declaredAvgMonthlyReturn !== undefined && profile.declaredAvgMonthlyReturn !== null
                      ? `${profile.declaredAvgMonthlyReturn}%`
                      : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Max Drawdown</div>
                  <div className="text-base font-black font-mono text-red-600 mt-1">
                    {profile.declaredMaxDrawdown !== undefined && profile.declaredMaxDrawdown !== null
                      ? `${profile.declaredMaxDrawdown}%`
                      : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Declared Win Rate</div>
                  <div className="text-base font-black font-mono text-green mt-1">
                    {profile.declaredWinRate !== undefined && profile.declaredWinRate !== null
                      ? `${profile.declaredWinRate}%`
                      : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Max Consec. Losses</div>
                  <div className="text-base font-black font-mono text-text-heading mt-1">
                    {profile.maxConsecutiveLosses !== undefined && profile.maxConsecutiveLosses !== null
                      ? profile.maxConsecutiveLosses
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* EdutradeFX Verified Terminal Stats */}
            <div className="pt-4 border-t border-border">
              <div className="text-xs font-bold text-text-heading uppercase tracking-wider mb-2">
                Performance On EdutradeFX Signals
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-green/5 border border-green/20">
                  <div className="text-[10px] uppercase font-bold text-text-muted">
                    Win Rate (Reported Pips)
                  </div>
                  <div className="text-base font-black font-mono text-green mt-1">
                    {profile.winRate !== undefined && profile.winRate !== null ? `${profile.winRate}%` : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-blue/5 border border-blue/20">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Total Signals Issued</div>
                  <div className="text-base font-black font-mono text-navy mt-1">
                    {profile.totalSignals || 0}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-tint border border-border col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Timeframes</div>
                  <div className="text-xs font-bold text-text-heading mt-1 truncate">
                    {profile.preferredTimeframes && profile.preferredTimeframes.length > 0
                      ? profile.preferredTimeframes.join(', ')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Management & Hedging/Martingale */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange" />
                <span>Risk Management Parameters</span>
              </h2>
              <Link
                href="/dashboard/signal-provider/onboarding?step=4"
                className="text-xs text-blue font-bold hover:underline inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Max Leverage Used</div>
                <div className="text-sm font-bold font-mono text-text-heading mt-0.5">
                  {profile.maxLeverageUsed ? `1 : ${profile.maxLeverageUsed}` : '—'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Risk-to-Reward Ratio</div>
                <div className="text-sm font-bold font-mono text-text-heading mt-0.5">
                  {profile.riskRewardPreference || '—'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-tint border border-border">
                <div className="text-[10px] uppercase font-bold text-text-muted">Risk Category</div>
                <div className="text-sm font-bold text-text-heading mt-0.5">
                  {profile.riskCategory || '—'}
                </div>
              </div>
            </div>

            {profile.riskPhilosophy && (
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase mb-1">Risk Philosophy</h4>
                <p className="text-xs text-text-body leading-relaxed whitespace-pre-line">
                  {profile.riskPhilosophy}
                </p>
              </div>
            )}

            {/* Martingale / Hedging Disclosure */}
            <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-heading">Hedging & Martingale Disclosure:</span>
                {profile.usesHedging && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue font-bold text-[10px] border border-blue-200">
                    Uses Hedging
                  </span>
                )}
                {profile.usesMartingale && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-300">
                    Uses Martingale
                  </span>
                )}
                {!profile.usesHedging && !profile.usesMartingale && (
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold text-[10px] border border-green-200">
                    No Hedging or Martingale
                  </span>
                )}
              </div>
              {profile.hedgingMartingaleNotes && (
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {profile.hedgingMartingaleNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Instruments & Trading Styles */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Trading Styles & Instruments</h3>
              <Link
                href="/dashboard/signal-provider/onboarding?step=2"
                className="text-xs text-blue font-bold hover:underline"
              >
                Edit
              </Link>
            </div>

            <div>
              <div className="text-[11px] font-bold text-text-muted uppercase mb-1.5">Styles</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.tradingStyles && profile.tradingStyles.length > 0 ? (
                  profile.tradingStyles.map((style, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue font-semibold text-xs border border-blue-100"
                    >
                      {style.replace(/_/g, ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted italic">No style specified</span>
                )}
              </div>
            </div>

            {profile.tradingStyleDescription && (
              <div className="text-xs text-text-body leading-relaxed bg-surface-tint p-3 rounded-xl border border-border">
                {profile.tradingStyleDescription}
              </div>
            )}

            <div>
              <div className="text-[11px] font-bold text-text-muted uppercase mb-1.5">Instruments Covered</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.instruments && profile.instruments.length > 0 ? (
                  profile.instruments.map((inst, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-surface-tint text-text-heading font-medium text-xs border border-border"
                    >
                      {inst}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted italic">No instruments specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Subscription & Pricing ({profile.subscriptionModel || 'FREE'})
              </h3>
              <Link
                href="/dashboard/signal-provider/onboarding?step=7"
                className="text-xs text-blue font-bold hover:underline"
              >
                Edit
              </Link>
            </div>

            {profile.subscriptionModel === 'PAID' && plans.length > 0 ? (
              <div className="space-y-2">
                {plans.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-surface-tint border border-border flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-text-heading">{p.name}</div>
                      <div className="text-[10px] text-text-muted uppercase">{p.period}</div>
                    </div>
                    <div className="text-sm font-black font-mono text-navy">
                      {p.currency} {Number(p.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                <span className="text-xs font-bold text-green-800">Free Broadcast Channel</span>
                <p className="text-[11px] text-green-700 mt-0.5">
                  Traders can follow your broadcast calls free of charge on EdutradeFX.
                </p>
              </div>
            )}
          </div>

          {/* Investor Communication */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Investor Communication</h3>
              <Link
                href="/dashboard/signal-provider/onboarding?step=7"
                className="text-xs text-blue font-bold hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="text-xs space-y-2 text-text-muted">
              <div>
                <span className="font-bold text-text-heading">Update Frequency: </span>
                <span>{profile.updateFrequency ? profile.updateFrequency.replace(/_/g, ' ') : '—'}</span>
              </div>
              <div>
                <span className="font-bold text-text-heading">Offers Live Q&amp;A: </span>
                <span>{profile.offersLiveQA ? `Yes (${profile.liveQAFrequency || 'Periodic'})` : 'No'}</span>
              </div>
              {profile.inquiryHandlingApproach && (
                <div className="pt-1">
                  <span className="font-bold text-text-heading block mb-0.5">Inquiry Handling:</span>
                  <p className="text-[11px] text-text-body bg-surface-tint p-2.5 rounded-xl border border-border">
                    {profile.inquiryHandlingApproach}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
