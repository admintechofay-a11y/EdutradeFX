'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Star,
  MapPin,
  Clock,
  Briefcase,
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { AccountManager } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

export default function AccountManagerProfilePreviewPage() {
  const [profile, setProfile] = useState<AccountManager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.get('/account-managers/my/profile');
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load profile', err);
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
        <p className="text-sm text-text-muted">No profile found.</p>
        <Link
          href="/dashboard/account-manager/onboarding"
          className="mt-4 inline-block px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  const approvedCertificates = (profile.documents || []).filter(
    (d) => d.docType === 'CERTIFICATE' && (d.isPublic || d.reviewStatus === 'APPROVED')
  );
  const approvedScreenshots = (profile.documents || []).filter(
    (d) => d.docType === 'PAST_RESULT_SCREENSHOT' && (d.isPublic || d.reviewStatus === 'APPROVED')
  );

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
              This preview matches what prospective investors see. Private contact details (email, phone, address, internal documents) are never exposed.
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/account-manager/onboarding"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit In Wizard
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar / Photo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-tint border-2 border-border shadow-soft shrink-0">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl text-blue bg-blue-50">
                {profile.fullName ? profile.fullName[0].toUpperCase() : 'A'}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-text-heading">{profile.fullName}</h1>
              {profile.regulatoryVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                  <Shield className="w-3 h-3" /> Regulated Verified
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-tint text-text-muted border border-border">
                {profile.entityType || 'INDIVIDUAL'}
              </span>
            </div>

            {profile.tagline && (
              <p className="text-xs sm:text-sm font-semibold text-text-muted">{profile.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
              {(profile.city || profile.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue" />
                  {[profile.city, profile.stateRegion, profile.country].filter(Boolean).join(', ')}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange" />
                {profile.yearsExperience != null ? `${profile.yearsExperience} Years Market Exp.` : 'Experience Unstated'}
              </span>
              <span className="flex items-center gap-1 font-bold text-orange">
                <Star className="w-3.5 h-3.5 fill-orange" />
                {profile.avgRating ? profile.avgRating.toFixed(1) : '5.0'} ({profile.totalReviews || 0} reviews)
              </span>
            </div>
          </div>

          {/* Quick Edit */}
          <Link
            href="/dashboard/account-manager/onboarding?step=1"
            className="self-start md:self-center px-3 py-1.5 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-text-heading hover:bg-surface-tint transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Header
          </Link>
        </div>
      </div>

      {/* Section: About & Speciality */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-text-heading uppercase tracking-wider">About Trader & Speciality</h2>
          <Link
            href="/dashboard/account-manager/onboarding?step=3"
            className="text-xs font-bold text-blue hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Section
          </Link>
        </div>

        {profile.speciality && (
          <div>
            <div className="text-xs font-bold text-text-muted mb-1">Trading Speciality</div>
            <p className="text-xs sm:text-sm text-text-heading font-semibold leading-relaxed bg-surface-tint p-4 rounded-2xl border border-blue-50">
              {profile.speciality}
            </p>
          </div>
        )}

        <div>
          <div className="text-xs font-bold text-text-muted mb-1">Biography & Market Background</div>
          <p className="text-xs sm:text-sm text-text-heading leading-relaxed whitespace-pre-wrap">
            {profile.bio || 'No biography provided.'}
          </p>
        </div>
      </div>

      {/* Section: Trading Style & Platforms */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-text-heading uppercase tracking-wider">Trading Style & Platforms</h2>
          <Link
            href="/dashboard/account-manager/onboarding?step=5"
            className="text-xs font-bold text-blue hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Section
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold text-text-muted mb-2">Trading Styles</div>
            <div className="flex flex-wrap gap-2">
              {profile.tradingStyles && profile.tradingStyles.length > 0 ? (
                profile.tradingStyles.map((style) => (
                  <span
                    key={style}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue border border-blue-200"
                  >
                    {style.replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted">None specified</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-text-muted mb-2">Preferred Trading Platforms</div>
            <div className="flex flex-wrap gap-2">
              {profile.preferredPlatforms && profile.preferredPlatforms.length > 0 ? (
                profile.preferredPlatforms.map((plat) => (
                  <span
                    key={plat}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-surface-tint text-text-heading border border-border"
                  >
                    {plat === 'OTHER' && profile.otherPlatformName ? profile.otherPlatformName : plat}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted">None specified</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-text-muted mb-2">Preferred Broker Types</div>
            <div className="flex flex-wrap gap-2">
              {profile.preferredBrokerTypes && profile.preferredBrokerTypes.length > 0 ? (
                profile.preferredBrokerTypes.map((bt) => (
                  <span
                    key={bt}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-50 text-gray-800 border border-gray-200"
                  >
                    {bt.replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted">None specified</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-text-muted mb-2">Self-Reported Accuracy</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-text-heading">
                {profile.accuracyLevel != null ? `${profile.accuracyLevel}%` : '—'}
              </span>
              {profile.accuracyPeriodNote && (
                <span className="text-xs text-text-muted font-medium">({profile.accuracyPeriodNote})</span>
              )}
            </div>
          </div>
        </div>

        {/* Preferred Instruments */}
        {profile.preferredInstruments && profile.preferredInstruments.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs font-bold text-text-muted mb-2">Preferred Trading Instruments / Scripts</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferredInstruments.map((inst) => (
                <span
                  key={inst}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-tint text-text-heading border border-border"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section: Risk Appetite & Parameters */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-text-heading uppercase tracking-wider">Risk Profile & Discipline</h2>
          <Link
            href="/dashboard/account-manager/onboarding?step=7"
            className="text-xs font-bold text-blue hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Section
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Risk Tolerance</div>
            <div className="text-sm font-black text-text-heading mt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                  profile.riskTolerance === 'LOW'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : profile.riskTolerance === 'MODERATE'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {profile.riskTolerance || '—'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Risk / Reward Ratio</div>
            <div className="text-sm font-black text-text-heading mt-1">
              {profile.riskRewardRatio || '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Loss per Trade Ratio</div>
            <div className="text-sm font-black text-text-heading mt-1">
              {profile.lossPerTradePercent != null ? `${profile.lossPerTradePercent}%` : '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Daily Trades (1000 USD base)</div>
            <div className="text-sm font-black text-text-heading mt-1">
              {profile.dailyTrades != null ? `${profile.dailyTrades} trades` : '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Daily Lots (1000 USD base)</div>
            <div className="text-sm font-black text-text-heading mt-1">
              {profile.dailyLots != null ? `${profile.dailyLots} lots` : '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Daily SL / TP</div>
            <div className="text-sm font-black text-text-heading mt-1">
              {profile.dailyStopLossPoints != null ? `${profile.dailyStopLossPoints} pts` : '—'} /{' '}
              {profile.dailyTakeProfitPoints != null ? `${profile.dailyTakeProfitPoints} pts` : '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Favourite Timeframe</div>
            <div className="text-sm font-black text-text-heading mt-1">
              {profile.favouriteTimeframe || '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-[11px] font-semibold text-text-muted">Trading Window (IST)</div>
            <div className="text-xs font-black text-text-heading mt-1">
              {profile.tradingTimeFrom && profile.tradingTimeTo
                ? `${profile.tradingTimeFrom} – ${profile.tradingTimeTo} IST`
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Sharing & Settlements */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-text-heading uppercase tracking-wider">Sharing & Settlements</h2>
          <Link
            href="/dashboard/account-manager/onboarding?step=9"
            className="text-xs font-bold text-blue hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Section
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-xs font-semibold text-text-muted">Settlement Cycle</div>
            <div className="text-base font-black text-text-heading mt-1">
              {profile.settlementCycle ? profile.settlementCycle.replace('LY', '') : '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-xs font-semibold text-text-muted">Manager's Share of Client Profit</div>
            <div className="text-base font-black text-green-700 mt-1">
              {profile.profitSharingPercent != null ? `${profile.profitSharingPercent}%` : '—'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border">
            <div className="text-xs font-semibold text-text-muted">Manager's Share of Client Loss</div>
            <div className="text-base font-black text-text-heading mt-1">
              {profile.lossSharingPercent != null ? `${profile.lossSharingPercent}%` : '0%'}
            </div>
          </div>
        </div>

        {profile.clientFundSecurity && (
          <div className="p-4 rounded-2xl bg-surface-tint border border-blue-50">
            <div className="text-xs font-bold text-text-muted mb-1">Security of Client Funds</div>
            <p className="text-xs text-text-heading leading-relaxed">{profile.clientFundSecurity}</p>
          </div>
        )}

        {profile.recommendsBroker && (
          <div className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-text-heading">Recommended Broker & Platform</div>
              <div className="text-xs text-text-muted mt-0.5">
                {profile.recommendedBrokerName || 'Specified Broker'} ({profile.recommendedBrokerPlatform || 'MT5'})
              </div>
            </div>
            {profile.recommendedBrokerId && (
              <span className="text-xs font-bold text-blue">Verified EdutradeFX Partner Broker</span>
            )}
          </div>
        )}
      </div>

      {/* Section: Achievements & Screenshots (Public Only) */}
      {(approvedCertificates.length > 0 || approvedScreenshots.length > 0) && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-bold text-text-heading uppercase tracking-wider">
              Approved Performance Proofs & Certificates
            </h2>
            <Link
              href="/dashboard/account-manager/onboarding?step=4"
              className="text-xs font-bold text-blue hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Manage Proofs
            </Link>
          </div>

          {approvedScreenshots.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-text-muted">Performance Screenshots</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {approvedScreenshots.map((shot) => (
                  <div key={shot.id} className="rounded-2xl border border-border overflow-hidden bg-surface-tint">
                    <img src={shot.fileUrl} alt={shot.caption || 'Account result'} className="w-full h-36 object-cover" />
                    {shot.caption && (
                      <div className="p-2.5 text-[11px] font-semibold text-text-heading truncate">
                        {shot.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted italic">
                Self-reported results. Screenshots can be edited. Past performance is not indicative of future results.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Risk Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
        <span className="font-bold">Risk Disclaimer: </span>
        Information shown above is self-reported by the Account Manager and is not independently verified by EdutradeFX
        unless accompanied by an official verification badge. Past performance does not guarantee future results.
        Trading forex and CFDs involves substantial risk of loss and is not suitable for all investors. Capital is at risk.
      </div>
    </div>
  );
}
