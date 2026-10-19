'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, ArrowRight, ShieldCheck, Percent, Clock, TrendingUp } from 'lucide-react';
import { AccountManager } from '../../types';
import { StarRating } from '../common/StarRating';

interface AMCardProps {
  am: AccountManager;
}

export const AMCard: React.FC<AMCardProps> = ({ am }) => {
  const styles = am.tradingStyles && am.tradingStyles.length > 0 ? am.tradingStyles : [];
  const locationLabel = [am.city, am.stateRegion, am.country].filter(Boolean).join(', ') || 'Global';

  return (
    <div className="group rounded-3xl bg-white border border-border hover:border-blue/40 transition-all duration-300 hover:-translate-y-1 shadow-soft hover:shadow-lift p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header Photo + Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-tint border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {am.photo ? (
              <img src={am.photo} alt={am.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold font-mono text-blue">
                {am.fullName ? am.fullName[0].toUpperCase() : 'M'}
              </span>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <h3 className="text-base font-bold text-text-heading group-hover:text-blue transition truncate">
                {am.fullName}
              </h3>
              {am.isFeatured && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue text-[10px] font-bold border border-blue-200">
                  FEATURED
                </span>
              )}
              {am.regulatoryVerified && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              )}
            </div>

            <p className="text-xs text-text-muted truncate">
              {am.tagline || am.speciality || 'Portfolio & Capital Allocation Manager'}
            </p>

            <div className="flex items-center gap-1 mt-1 text-xs">
              <StarRating rating={am.avgRating || 5.0} />
              <span className="font-bold text-text-heading ml-1">{(am.avgRating || 5.0).toFixed(1)}</span>
              <span className="text-text-muted">({am.totalReviews || 0})</span>
            </div>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="grid grid-cols-2 gap-2 text-xs text-text-body py-2.5 border-t border-b border-border mb-3.5">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{am.yearsExperience != null ? `${am.yearsExperience} yrs exp` : 'Verified Exp'}</span>
          </div>
        </div>

        {/* Key Metrics: Risk Badge, Settlement, Profit Share */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-surface-tint border border-blue-50 mb-4 text-center">
          <div>
            <div className="text-[10px] text-text-muted font-semibold uppercase">Risk</div>
            <div className="text-xs font-black text-text-heading mt-0.5">
              <span
                className={`inline-block px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  am.riskTolerance === 'LOW'
                    ? 'bg-green-100 text-green-800'
                    : am.riskTolerance === 'MODERATE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {am.riskTolerance || 'MODERATE'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted font-semibold uppercase">Settlement</div>
            <div className="text-xs font-black text-text-heading mt-0.5 truncate">
              {am.settlementCycle ? am.settlementCycle.replace('LY', '') : 'Monthly'}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted font-semibold uppercase">Share</div>
            <div className="text-xs font-black text-green-700 mt-0.5">
              {am.profitSharingPercent != null ? `${am.profitSharingPercent}%` : '20%'}
            </div>
          </div>
        </div>

        {/* Trading Style Chips */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Trading Styles</div>
          <div className="flex flex-wrap gap-1.5">
            {styles.length > 0 ? (
              styles.slice(0, 3).map((st, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue text-[10px] font-bold border border-blue-100"
                >
                  {st.replace('_', ' ')}
                </span>
              ))
            ) : am.expertise && am.expertise.length > 0 ? (
              am.expertise.slice(0, 3).map((exp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-surface-tint text-text-body text-[10px] font-medium border border-border"
                >
                  {exp}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-text-muted">PAMM / Discretionary</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-2">
        <Link
          href={`/account-managers/${am.slug}`}
          className="w-full py-2.5 bg-surface-tint hover:bg-blue hover:text-white text-text-heading rounded-full text-xs font-bold border border-border hover:border-blue transition-all flex items-center justify-center gap-2 shadow-sm group/btn"
        >
          <span>View Profile & Track Record</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
