'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import RatingStars from '@/components/shared/RatingStars';
import { cn } from '@/lib/utils';

export interface BrokerCardProps {
  broker: {
    _id?: string;
    name: string;
    slug: string;
    logo: string;
    country?: string;
    headquarters?: string;
    regulation?: string[] | string;
    rating: number;
    totalReviews?: number;
    maxLeverage?: string;
    minDeposit?: number;
    eurUsdSpread?: number;
    spreadType?: string;
    tradingPlatforms?: string[];
    featured?: boolean;
    scamWarning?: boolean;
    regulators?: string[];
    [key: string]: any;
  };
  className?: string;
}

export default function BrokerCard({ broker, className }: BrokerCardProps) {
  const displayCountry = broker.country || broker.headquarters || 'United Kingdom';
  const primaryRegulation = Array.isArray(broker.regulation) && broker.regulation.length > 0
    ? broker.regulation[0]
    : Array.isArray(broker.regulators) && broker.regulators.length > 0
    ? broker.regulators[0]
    : typeof broker.regulation === 'string'
    ? (broker.regulation as string).split(',')[0].trim()
    : 'Regulated';

  const platforms = broker.tradingPlatforms || (broker as any).platforms || ['MT4', 'MT5', 'cTrader'];
  const brokerSlug = broker.slug || broker._id || broker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const logoUrl = broker.logo || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80';

  return (
    <div
      className={cn(
        'w-full bg-white border border-[#E2E8F0] rounded-md shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between text-left',
        broker.scamWarning && 'border-danger/50 bg-red-50/20',
        className
      )}
    >
      <div className="space-y-3.5">
        {/* ================= 1. TOP ROW: Logo, Name+Country, Regulation Badge ================= */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo: 48×48 rounded --radius-sm, object-fit contain, bg #F8FAFC border 1px #E2E8F0 */}
            <div className="w-[48px] h-[48px] rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] p-1 shrink-0 flex items-center justify-center">
              <img
                src={logoUrl}
                alt={broker.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <Link
                href={`/brokers/${brokerSlug}`}
                className="font-sans text-[16px] font-bold text-text-primary hover:text-gold-primary transition-colors block truncate"
              >
                {broker.name}
              </Link>
              <span className="font-sans text-[12px] text-text-secondary block truncate">
                {displayCountry}
              </span>
            </div>
          </div>

          {/* Regulation badge: pill, bg #ECFDF5 border 1px #6EE7B7 text #065F46, Inter 11px weight 600 */}
          <span className="shrink-0 bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {primaryRegulation}
          </span>
        </div>

        {/* ================= 2. RATING ROW ================= */}
        <div className="pt-0.5">
          <RatingStars
            rating={broker.rating}
            reviewsCount={broker.totalReviews || 128}
            layout="row"
            showDetails={true}
          />
        </div>

        {/* ================= 3. STATS ROW ================= */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#E2E8F0]/70 text-center">
          <div>
            <span className="font-sans text-[10px] font-medium text-text-secondary uppercase tracking-wide block">
              Leverage
            </span>
            <span className="font-sans text-[15px] font-bold text-text-primary mt-0.5 block">
              {broker.maxLeverage || '1:500'}
            </span>
          </div>

          <div>
            <span className="font-sans text-[10px] font-medium text-text-secondary uppercase tracking-wide block">
              Min Dep
            </span>
            <span className="font-sans text-[15px] font-bold text-text-primary mt-0.5 block">
              ${broker.minDeposit ?? 10}
            </span>
          </div>

          <div>
            <span className="font-sans text-[10px] font-medium text-text-secondary uppercase tracking-wide block">
              Spreads
            </span>
            <span className="font-sans text-[15px] font-bold text-text-primary mt-0.5 block">
              {broker.eurUsdSpread !== undefined ? `${broker.eurUsdSpread} pip` : '0.1 pip'}
            </span>
          </div>
        </div>

        {/* ================= 4. PLATFORMS ================= */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-sans text-[11px] text-text-secondary font-medium">Platforms:</span>
          {platforms.slice(0, 3).map((platform) => (
            <span
              key={platform}
              className="bg-[#F1F5F9] border border-[#E2E8F0] text-text-secondary font-sans text-[11px] font-medium px-2 py-0.5 rounded-sm"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>

      {/* ================= 5. BOTTOM ROW: Featured Chip + View Profile Button ================= */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0]/60 space-y-2">
        {broker.featured && (
          <div className="flex items-center">
            <span className="bg-gold-primary text-navy-deepest font-sans text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          </div>
        )}

        <Link href={`/brokers/${broker.slug}`} className="block w-full">
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
