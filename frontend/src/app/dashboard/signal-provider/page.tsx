'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  FileText,
  ChevronRight,
  Edit3,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/common/Skeleton';
import { SignalProvider } from '@/types';

export default function SignalProviderOverviewPage() {
  const [profile, setProfile] = useState<SignalProvider | null>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [enquiryCount, setEnquiryCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, signalsRes, enquiriesRes] = await Promise.allSettled([
          api.get('/signal-providers/my/profile'),
          api.get('/signal-providers/my/signals'),
          api.get('/signal-providers/my/enquiries?limit=1'),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data?.data || null);
        }
        if (signalsRes.status === 'fulfilled') {
          setSignals(signalsRes.value.data?.data || []);
        }
        if (enquiriesRes.status === 'fulfilled') {
          setEnquiryCount(enquiriesRes.value.data?.pagination?.total || enquiriesRes.value.data?.data?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load SP overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeSignals = signals.filter((s) => s.status === 'ACTIVE');
  const closedSignals = signals.filter((s) => s.status === 'CLOSED');
  const winCount = closedSignals.filter((s) => (s.pipsGained || 0) > 0).length;
  // S4 & S6 Fix: No fake 78% or 80% default. Computed from closed signals with recorded pips only.
  const winRate =
    closedSignals.length > 0 ? Math.round((winCount / closedSignals.length) * 100) : null;
  const totalPips = signals.reduce((acc, s) => acc + (s.pipsGained || 0), 0);

  const completionPercent = profile?.completionPercent || 0;
  const isApproved = profile?.status === 'APPROVED';
  const isPending = profile?.status === 'PENDING' && profile?.onboardingStatus === 'SUBMITTED';
  const isChangesRequested = profile?.onboardingStatus === 'CHANGES_REQUESTED';
  const isRejected = profile?.status === 'REJECTED';
  const isDraft = !profile?.onboardingStatus || profile?.onboardingStatus === 'DRAFT';

  // Map missing field to wizard step
  const getStepForField = (field: string): { step: number; label: string } => {
    if (['legalFullName', 'displayName', 'photo', 'contactPhone', 'residenceCountryCode', 'residenceCountry'].includes(field)) {
      return { step: 1, label: 'Personal Information' };
    }
    if (['yearsTrading', 'instruments', 'tradingStyles', 'tradingStyleDescription', 'previouslySignalProvider', 'previousProviderDetails'].includes(field)) {
      return { step: 2, label: 'Trading Experience' };
    }
    if (['declaredAvgMonthlyReturn', 'declaredMaxDrawdown', 'declaredWinRate', 'preferredTimeframes', 'maxConsecutiveLosses'].includes(field)) {
      return { step: 3, label: 'Performance Metrics' };
    }
    if (['maxLeverageUsed', 'riskRewardPreference', 'riskPhilosophy', 'usesHedgingOrMartingale', 'hedgingMartingaleNotes', 'riskCategory'].includes(field)) {
      return { step: 4, label: 'Risk Management' };
    }
    if (['documents', 'statementPeriodFrom', 'statementPeriodTo', 'statementAccountType', 'IDENTITY_DOCUMENT', 'ACCOUNT_STATEMENT'].includes(field)) {
      return { step: 5, label: 'Verification Documents' };
    }
    if (['commitments', 'principles'].includes(field)) {
      return { step: 6, label: 'EdutradeFX Principles' };
    }
    if (['strategy', 'strategyDetail', 'marketAdaptation', 'uniqueValue', 'updateFrequency', 'inquiryHandlingApproach', 'offersLiveQA', 'plans'].includes(field)) {
      return { step: 7, label: 'Strategy & Communication' };
    }
    if (['agreements'].includes(field)) {
      return { step: 8, label: 'Agreements' };
    }
    return { step: 9, label: 'Declaration & Review' };
  };

  const missingFieldsList = (profile as any)?.missingFields || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-navy flex items-center gap-2">
              <Radio className="w-6 h-6 text-green" />
              Signal Desk & Execution Console
            </h1>
            {profile?.verificationStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                <ShieldCheck className="w-3 h-3" /> Verified Provider
              </span>
            )}
            {profile?.usesMartingale && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Martingale Strategy Disclosed
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Broadcast high-conviction trades, monitor live open positions, and track track-record metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/signal-provider/onboarding"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border hover:bg-surface-tint text-text-heading font-bold text-xs rounded-xl shadow-soft transition"
          >
            <Edit3 className="w-4 h-4 text-text-muted" />
            <span>{isDraft ? 'Complete Onboarding' : 'Edit Onboarding Form'}</span>
          </Link>
          <Link
            href="/dashboard/signal-provider/signals"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-xl text-xs font-bold transition shadow-sm w-full sm:w-auto min-h-[42px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Signal Terminal</span>
          </Link>
        </div>
      </div>

      {/* Compliance & Workflow Banners */}
      {/* 1. Profile Update Required (30-day grace banner for existing providers) */}
      {profile?.profileUpdateRequiredBy && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 flex-1">
            <span className="font-bold">Verification Profile Update Required: </span>
            To maintain your active signal provider listing and comply with EdutradeFX verification guidelines, please complete the updated v2 onboarding sections before{' '}
            <span className="font-bold underline">
              {new Date(profile.profileUpdateRequiredBy).toLocaleDateString()}
            </span>
            .
            <div className="mt-2">
              <Link
                href="/dashboard/signal-provider/onboarding"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
              >
                Complete Onboarding Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Agreement Re-acceptance Banner */}
      {(profile as any)?.pendingAgreementReaccept && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 flex-1">
            <span className="font-bold">Updated Agreements Pending: </span>
            EdutradeFX has updated partner agreements. Signal publishing is paused until you review and re-accept the updated terms.
            <div className="mt-2">
              <Link
                href="/dashboard/signal-provider/onboarding?step=8"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 underline hover:text-blue-950"
              >
                Review & Accept Terms <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Changes Requested Banner */}
      {isChangesRequested && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 flex-1">
            <div className="font-bold text-sm text-orange-800 mb-1">Changes Requested by Compliance Team</div>
            <p className="mb-2">
              {profile?.changesRequestedNote ||
                'Please review the requested revisions in your onboarding form and re-submit your profile.'}
            </p>
            <Link
              href="/dashboard/signal-provider/onboarding"
              className="inline-flex items-center gap-1 font-bold text-orange-800 underline hover:text-orange-950"
            >
              Update and Re-submit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Rejection Banner */}
      {isRejected && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 flex-1">
            <div className="font-bold text-sm text-red-800 mb-1">Signal Provider Application Rejected</div>
            <p className="mb-2 font-medium">
              Reason: {profile?.rejectionReason || 'Your application did not satisfy the verification guidelines.'}
            </p>
            <Link
              href="/dashboard/signal-provider/onboarding"
              className="inline-flex items-center gap-1 font-bold text-red-800 underline hover:text-red-950"
            >
              Make Revisions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 5. In Review Banner */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 flex-1">
            <div className="font-bold text-sm text-blue-800 mb-1">Application Submitted & Under Review</div>
            <p>
              Your verification documents and trading disclosures are currently being audited by our compliance desk. Signal broadcasting requires an APPROVED status.
            </p>
          </div>
        </div>
      )}

      {/* KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Onboarding Status</span>
            {isApproved ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                APPROVED
              </span>
            ) : isPending ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                IN REVIEW
              </span>
            ) : isChangesRequested ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                REVISIONS NEEDED
              </span>
            ) : isRejected ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                REJECTED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                DRAFT
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-black text-navy">{profile?.onboardingStatus || 'DRAFT'}</div>
            <p className="text-[11px] text-text-muted mt-1">
              {isApproved ? 'Public broadcasting enabled' : 'Approval required to broadcast'}
            </p>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Verification Checklist</span>
            <span className="font-bold text-blue">{completionPercent}%</span>
          </div>
          <div>
            <div className="w-full bg-surface-tint rounded-full h-2.5 overflow-hidden border border-border mt-1">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completionPercent === 100 ? 'bg-green-500' : completionPercent > 50 ? 'bg-blue' : 'bg-orange'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              {completionPercent === 100
                ? 'All sections complete'
                : `${missingFieldsList.length} items remaining for submit`}
            </p>
          </div>
        </div>

        {/* S6: Win Rate on EdutradeFX */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Win Rate on EdutradeFX</span>
            <Award className="w-4 h-4 text-green" />
          </div>
          <div>
            <div className="text-2xl font-black text-green font-mono">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : winRate !== null ? (
                `${winRate}%`
              ) : (
                <span className="text-text-muted text-lg">—</span>
              )}
            </div>
            <p className="text-[11px] text-text-muted mt-1" title="Provider-reported pips on closed EdutradeFX signals">
              Provider-reported pips ({closedSignals.length} closed)
            </p>
          </div>
        </div>

        {/* Total Net Pips */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Net Pips Harvested</span>
            <TrendingUp className="w-4 h-4 text-blue" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy font-mono">
              {loading ? <Skeleton className="h-8 w-20" /> : `${totalPips > 0 ? '+' : ''}${totalPips} pips`}
            </div>
            <p className="text-[11px] text-text-muted mt-1">Cumulative on EdutradeFX</p>
          </div>
        </div>
      </div>

      {/* Missing Fields Action Checklist */}
      {missingFieldsList.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-text-heading">Action Checklist for Verification</h3>
              <p className="text-xs text-text-muted">
                Complete the following required items to submit your signal provider profile for compliance review.
              </p>
            </div>
            <Link
              href="/dashboard/signal-provider/onboarding"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition"
            >
              Resume Wizard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missingFieldsList.map((field: string) => {
              const { step, label } = getStepForField(field);
              return (
                <Link
                  key={field}
                  href={`/dashboard/signal-provider/onboarding?step=${step}`}
                  className="p-3.5 rounded-2xl bg-surface-tint border border-blue-50 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center font-bold text-xs shrink-0">
                      {step}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-heading group-hover:text-blue transition">
                        {label}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">{field}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-blue group-hover:translate-x-0.5 transition" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/signal-provider/signals"
          className="p-5 sm:p-6 rounded-3xl bg-white border border-border hover:border-green/50 transition group shadow-soft hover:shadow-card"
        >
          <Radio className="w-8 h-8 text-green mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Signals Terminal</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-green transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Publish forex, crypto, and commodity calls with entry, stop loss, and multiple take profit targets.
          </p>
        </Link>

        <Link
          href="/dashboard/signal-provider/enquiries"
          className="p-5 sm:p-6 rounded-3xl bg-white border border-border hover:border-blue/50 transition group shadow-soft hover:shadow-card"
        >
          <Users className="w-8 h-8 text-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Investor & Subscriber Inquiries ({enquiryCount})</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-blue transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Communicate with prospective VIP subscribers, answering copy-trading and risk-management questions.
          </p>
        </Link>

        <Link
          href="/dashboard/signal-provider/profile"
          className="p-5 sm:p-6 rounded-3xl bg-white border border-border hover:border-navy/40 transition group shadow-soft hover:shadow-card"
        >
          <ShieldCheck className="w-8 h-8 text-navy mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Public Profile Live Preview</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-navy transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Preview your public profile exactly as traders see it, with verified badges, disclosures, and plans.
          </p>
        </Link>
      </div>
    </div>
  );
}
