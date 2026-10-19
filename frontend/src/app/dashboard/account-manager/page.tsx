'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  User,
  Star,
  MessageSquare,
  AlertTriangle,
  Edit3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AccountManager } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

export default function AccountManagerDashboardPage() {
  const [profile, setProfile] = useState<AccountManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiryCount, setEnquiryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, enquiriesRes] = await Promise.all([
          api.get('/account-managers/my/profile'),
          api.get('/account-managers/my/enquiries?limit=1').catch(() => ({ data: { meta: { total: 0 } } })),
        ]);
        setProfile(profileRes.data?.data || null);
        setEnquiryCount(enquiriesRes.data?.meta?.total || 0);
      } catch (err: any) {
        console.error('Failed to load AM profile', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-text-heading mb-2">Failed to load Account Manager Profile</h2>
        <p className="text-sm text-text-muted mb-4">{error || 'Profile not found'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const completionPercent = profile.completionPercent || 0;
  const isApproved = profile.status === 'APPROVED';
  const isPending = profile.status === 'PENDING' && profile.onboardingStatus === 'SUBMITTED';
  const isChangesRequested = profile.onboardingStatus === 'CHANGES_REQUESTED';
  const isRejected = profile.status === 'REJECTED';
  const isDraft = profile.onboardingStatus === 'DRAFT';

  // Map missing field to step
  const getStepForField = (field: string): { step: number; label: string } => {
    if (['entityType', 'companyLegalName', 'photo', 'address', 'countryCode', 'city', 'zipCode', 'contactEmail', 'contactPhone'].includes(field)) {
      return { step: 1, label: 'Personal Information' };
    }
    if (['isRegulated', 'regulatorName', 'regulatorRegistrationNumber', 'regulatorCountry'].includes(field)) {
      return { step: 2, label: 'Regulatory Details' };
    }
    if (['bio', 'speciality', 'cvResume'].includes(field)) {
      return { step: 3, label: 'About Trader & CV' };
    }
    if (['yearsExperience'].includes(field)) {
      return { step: 4, label: 'Market Experience' };
    }
    if (['preferredInstruments', 'tradingStyles', 'preferredPlatforms', 'preferredBrokerTypes'].includes(field)) {
      return { step: 5, label: 'Trading Style & Platforms' };
    }
    if (['indicators', 'technical'].includes(field)) {
      return { step: 6, label: 'Trading Strategy' };
    }
    if (['riskRewardRatio', 'riskTolerance', 'lossPerTradePercent', 'dailyTrades', 'dailyLots', 'dailyStopLossPoints', 'dailyTakeProfitPoints', 'favouriteTimeframe', 'tradingTime', 'lossRecoveryStrategy'].includes(field)) {
      return { step: 7, label: 'Risk Appetite' };
    }
    if (['settlementCycle'].includes(field)) {
      return { step: 8, label: 'Settlement Cycle' };
    }
    if (['clientFundSecurity', 'recommendsBroker', 'profitSharingPercent', 'lossSharingPercent'].includes(field)) {
      return { step: 9, label: 'Sharing & Settlements' };
    }
    return { step: 10, label: 'Agreements' };
  };

  const missingFieldsList = profile.missingFields || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-text-heading">Account Manager Portal</h1>
            {profile.regulatoryVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                <Shield className="w-3 h-3" /> Regulated Verified
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage your manager onboarding, profile credentials, trading style, and client enquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/account-manager/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-soft transition"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isDraft ? 'Complete Onboarding' : 'Edit Onboarding Form'}</span>
          </Link>
          <Link
            href="/dashboard/account-manager/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border hover:bg-surface-tint text-text-heading font-bold text-xs rounded-xl shadow-soft transition"
          >
            <ExternalLink className="w-4 h-4 text-text-muted" />
            <span>Public Preview</span>
          </Link>
        </div>
      </div>

      {/* Banners */}
      {/* 1. Legacy Profile Update Required Banner */}
      {profile.profileUpdateRequiredBy && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 flex-1">
            <span className="font-bold">Profile Update Required: </span>
            To maintain your active listing and ensure investor protection, please complete the updated Account Manager
            v2 onboarding sections before{' '}
            <span className="font-bold underline">
              {new Date(profile.profileUpdateRequiredBy).toLocaleDateString()}
            </span>
            .
            <div className="mt-2">
              <Link
                href="/dashboard/account-manager/onboarding"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
              >
                Update Profile Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Changes Requested Banner */}
      {isChangesRequested && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 flex-1">
            <div className="font-bold text-sm text-orange-800 mb-1">Changes Requested by Compliance Team</div>
            <p className="mb-2">
              {profile.changesRequestedNote ||
                'Please review the requested changes and re-submit your profile for verification.'}
            </p>
            <Link
              href="/dashboard/account-manager/onboarding"
              className="inline-flex items-center gap-1 font-bold text-orange-800 underline hover:text-orange-950"
            >
              Update and Re-submit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Rejection Banner */}
      {isRejected && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 flex-1">
            <div className="font-bold text-sm text-red-800 mb-1">Application Rejected</div>
            <p className="mb-2 font-medium">
              Reason: {profile.rejectionReason || 'Your profile did not satisfy the verification guidelines.'}
            </p>
            <Link
              href="/dashboard/account-manager/onboarding"
              className="inline-flex items-center gap-1 font-bold text-red-800 underline hover:text-red-950"
            >
              Make Revisions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Submitted & Pending Review */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 flex-1">
            <div className="font-bold text-sm text-blue-800 mb-1">Application Submitted & Under Review</div>
            <p>
              Your profile is currently undergoing verification by our compliance team. Reviews are typically processed
              within 24–48 hours.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Onboarding & Status */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Status</span>
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
          <div className="mt-2">
            <div className="text-2xl font-black text-text-heading">{profile.onboardingStatus || 'DRAFT'}</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {isApproved ? 'Public listing active' : 'Complete steps to go live'}
            </div>
          </div>
        </div>

        {/* Completion % */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Profile Completion</span>
            <span className="font-bold text-blue">{completionPercent}%</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-surface-tint rounded-full h-2.5 overflow-hidden border border-border mt-1">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completionPercent === 100 ? 'bg-green-500' : completionPercent > 50 ? 'bg-blue' : 'bg-orange'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-text-muted mt-2">
              {completionPercent === 100 ? 'All 10 sections complete' : `${missingFieldsList.length} required fields pending`}
            </div>
          </div>
        </div>

        {/* Enquiries */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Investor Enquiries</span>
            <MessageSquare className="w-4 h-4 text-blue" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-text-heading">{enquiryCount}</div>
            <Link
              href="/dashboard/account-manager/enquiries"
              className="text-[11px] text-blue font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              View Inbound Messages <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Reputation */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Reputation</span>
            <Star className="w-4 h-4 text-orange fill-orange" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-text-heading">
              {profile.avgRating ? profile.avgRating.toFixed(1) : '5.0'}{' '}
              <span className="text-xs font-semibold text-text-muted font-normal">/ 5.0</span>
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {profile.totalReviews || 0} investor reviews
            </div>
          </div>
        </div>
      </div>

      {/* Missing Fields / Action Plan */}
      {missingFieldsList.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-text-heading">Action Checklist for Verification</h3>
              <p className="text-xs text-text-muted">
                Complete the following required items to submit your profile for compliance review.
              </p>
            </div>
            <Link
              href="/dashboard/account-manager/onboarding"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition"
            >
              Resume Wizard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missingFieldsList.map((field) => {
              const { step, label } = getStepForField(field);
              return (
                <Link
                  key={field}
                  href={`/dashboard/account-manager/onboarding?step=${step}`}
                  className="p-3.5 rounded-2xl bg-surface-tint border border-blue-50 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center font-bold text-xs shrink-0">
                      {step}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-heading group-hover:text-blue transition">
                        {field}
                      </div>
                      <div className="text-[10px] text-text-muted">Step {step}: {label}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-blue transition" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trading Style & Preferences */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-heading">Trading Profile Snapshot</h3>
            <Link
              href="/dashboard/account-manager/onboarding?step=5"
              className="text-xs text-blue font-bold hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Market Experience:</span>
              <span className="font-bold text-text-heading">
                {profile.yearsExperience != null ? `${profile.yearsExperience} Years` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Trading Styles:</span>
              <span className="font-bold text-text-heading">
                {profile.tradingStyles && profile.tradingStyles.length > 0
                  ? profile.tradingStyles.join(', ')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Platforms:</span>
              <span className="font-bold text-text-heading">
                {profile.preferredPlatforms && profile.preferredPlatforms.length > 0
                  ? profile.preferredPlatforms.join(', ')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Risk Tolerance:</span>
              <span className="font-bold text-text-heading">
                {profile.riskTolerance || '—'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Settlement Cycle:</span>
              <span className="font-bold text-text-heading">
                {profile.settlementCycle || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance & Verification */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-heading">Compliance & Legal</h3>
            <Link
              href="/dashboard/account-manager/onboarding?step=10"
              className="text-xs text-blue font-bold hover:underline"
            >
              Review
            </Link>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Entity Type:</span>
              <span className="font-bold text-text-heading">{profile.entityType || 'INDIVIDUAL'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Regulated Status:</span>
              <span className="font-bold text-text-heading">
                {profile.isRegulated ? (profile.regulatoryVerified ? 'Verified' : 'Self-Declared') : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-text-muted">Documents Uploaded:</span>
              <span className="font-bold text-text-heading">
                {profile.documents?.length || 0} Files
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted">Agreements Accepted:</span>
              <span className="font-bold text-green-700">
                {profile.agreements?.length || 0} of 7 Legal Agreements
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
