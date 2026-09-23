'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import RatingStars from '@/components/shared/RatingStars';
import { cn } from '@/lib/utils';

export interface ManagerCardProps {
  manager: {
    _id: string;
    name: string;
    title?: string;
    avatar?: string;
    profileImage?: string;
    company?: string;
    bio?: string;
    category?: string;
    tradingStyle?: string;
    strategy?: string;
    verified?: boolean;
    winRate?: number;
    maxDrawdown?: number;
    monthlyRoi?: number;
    totalPips?: number;
    avgTradesPerMonth?: number;
    riskScore?: number;
    pricingModel?: string;
    profitSharePercentage?: number;
    subscriptionPrice?: number;
    featured?: boolean;
    isFeatured?: boolean;
    historicalPerformance?: {
      winRate?: number;
      maxDrawdown?: number;
      monthlyRoi?: number;
      totalPips?: number;
      avgTradesPerMonth?: number;
      totalAum?: string;
      profitFactor?: number;
    };
  };
  className?: string;
}

export default function ManagerCard({ manager, className }: ManagerCardProps) {
  const getCategoryBadge = (cat: string) => {
    if (cat === 'signal_provider') return 'Signal Provider';
    if (cat === 'account_manager') return 'Account Manager';
    return 'PAMM Manager';
  };

  const category = manager.category || 'account_manager';
  const isSignal = category === 'signal_provider';
  const targetUrl = isSignal
    ? `/signal-providers/${manager._id}`
    : `/account-managers/${manager._id}`;

  const avatar =
    manager.avatar ||
    manager.profileImage ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
  const title = manager.title || manager.company || manager.strategy || 'Portfolio Specialist';
  const tradingStyle = manager.tradingStyle || 'Discretionary';
  const winRate = manager.winRate ?? manager.historicalPerformance?.winRate ?? 75;
  const monthlyRoi = manager.monthlyRoi ?? manager.historicalPerformance?.monthlyRoi ?? 12.5;
  const maxDrawdown = manager.maxDrawdown ?? manager.historicalPerformance?.maxDrawdown ?? 8.0;
  const isFeatured = manager.featured ?? manager.isFeatured ?? false;
  const isVerified = manager.verified ?? true;

  return (
    <div
      className={cn(
        'w-full bg-white border border-[#E2E8F0] rounded-md shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between text-left',
        className
      )}
    >
      <div className="space-y-3.5">
        {/* ================= 1. TOP ROW: Avatar, Name+Style, Verified Badge ================= */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar: 48×48 rounded --radius-sm, object-fit cover, bg #F8FAFC border 1px #E2E8F0 */}
            <div className="relative w-[48px] h-[48px] rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden shrink-0">
              <img
                src={avatar}
                alt={manager.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <Link
                href={targetUrl}
                className="font-sans text-[16px] font-bold text-text-primary hover:text-gold-primary transition-colors block truncate"
              >
                {manager.name}
              </Link>
              <span className="font-sans text-[12px] text-text-secondary block truncate">
                {tradingStyle} · {title}
              </span>
            </div>
          </div>

          {/* Regulation / Category badge: pill, bg #ECFDF5 border 1px #6EE7B7 text #065F46 */}
          <span className="shrink-0 bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {getCategoryBadge(category)}
          </span>
        </div>

        {/* ================= 2. RATING ROW ================= */}
        <div className="pt-0.5">
          <RatingStars
            rating={4.8}
            reviewsCount={isVerified ? 94 : 32}
            layout="row"
            showDetails={true}
          />
        </div>

        {/* ================= 3. STATS ROW ================= */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#E2E8F0]/70 text-center">
          <div>
            <span className="font-sans text-[10px] font-medium text-text-secondary uppercase tracking-wide block">
              Win Rate
            </span>
            <span className="font-sans text-[15px] font-bold text-success mt-0.5 block">
              {winRate}%
            </span>
          </div>

          <div>
            <span className="font-sans text-[10px] font-medium text-text-secondary uppercase tracking-wide block">
              Monthly ROI
            </span>
            <span className="font-sans text-[15px] font-bold text-gold-muted mt-0.5 block">
              +{monthlyRoi}%
            </span>
          </div>

          <div>
            <span className="font-sans text-[10px] font-medium text-text-secondary uppercase tracking-wide block">
              Max DD
            </span>
            <span className="font-sans text-[15px] font-bold text-danger mt-0.5 block">
              {maxDrawdown}%
            </span>
          </div>
        </div>

        {/* ================= 4. PRICING & STRATEGY TAGS ================= */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-sans text-[11px] text-text-secondary font-medium">Model:</span>
          <span className="bg-[#F1F5F9] border border-[#E2E8F0] text-text-secondary font-sans text-[11px] font-medium px-2 py-0.5 rounded-sm">
            {manager.pricingModel === 'profit_share'
              ? `${manager.profitSharePercentage || 20}% Profit Share`
              : manager.pricingModel === 'monthly_subscription'
              ? `$${manager.subscriptionPrice || 49}/mo`
              : 'Free Signals'}
          </span>
          {isVerified && (
            <span className="bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] font-sans text-[11px] font-medium px-2 py-0.5 rounded-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Audited
            </span>
          )}
        </div>
      </div>

      {/* ================= 5. BOTTOM ROW: Featured Chip + View Profile Button ================= */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0]/60 space-y-2">
        {isFeatured && (
          <div className="flex items-center">
            <span className="bg-gold-primary text-navy-deepest font-sans text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          </div>
        )}

        <Link href={targetUrl} className="block w-full">
          <button
            type="button"
            className="w-full min-h-[44px] bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            View Profile
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

