'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';
import { SignalProvider } from '../../types';
import { StarRating } from '../common/StarRating';

interface SPCardProps {
  provider?: SignalProvider;
  sp?: SignalProvider;
}

export const SPCard: React.FC<SPCardProps> = ({ provider: propProvider, sp }) => {
  const provider = propProvider || sp!;
  if (!provider) return null;

  // Determine pricing label
  let priceLabel = 'Free';
  if (provider.subscriptionModel === 'PAID' && provider.plans && provider.plans.length > 0) {
    const activePlans = provider.plans.filter((p) => p.isActive !== false);
    if (activePlans.length > 0) {
      const minPrice = Math.min(...activePlans.map((p) => Number(p.price)));
      const currency = activePlans[0].currency || 'USD';
      priceLabel = `From ${currency} ${minPrice.toFixed(0)}`;
    }
  }

  return (
    <div className="group rounded-2xl bg-white border border-border hover:border-blue/40 transition-all duration-300 hover:-translate-y-1 shadow-soft hover:shadow-lift p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-tint border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {provider.photo ? (
              <img src={provider.photo} alt={provider.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold font-mono text-blue">
                {provider.displayName ? provider.displayName[0].toUpperCase() : 'S'}
              </span>
            )}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <h3 className="text-base font-bold text-text-heading group-hover:text-blue transition truncate">
                {provider.displayName}
              </h3>
              {provider.verificationStatus && (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED
                </span>
              )}
            </div>

            {provider.strategy && (
              <p className="text-xs text-text-muted truncate">{provider.strategy}</p>
            )}

            <div className="flex items-center gap-1 mt-1 text-xs">
              <StarRating rating={provider.avgRating || 0} />
              <span className="font-bold text-text-heading ml-1">
                {provider.avgRating ? provider.avgRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-text-muted">({provider.totalReviews || 0})</span>
            </div>
          </div>
        </div>

        {/* Badges: Risk, Martingale, Pricing */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {provider.riskCategory && (
            <span className="px-2 py-0.5 rounded-md bg-surface-tint text-text-heading font-semibold text-[10px] border border-border">
              {provider.riskCategory} Risk
            </span>
          )}
          {provider.usesMartingale && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-300 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
              Martingale
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue font-bold text-[10px] border border-blue-100 ml-auto">
            {priceLabel}
          </span>
        </div>

        {/* Win Rate & Signal Volume (Real Data Only, S4/S6 fix) */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-border mb-4 text-center">
          <div className="p-2.5 rounded-xl bg-surface-tint border border-border">
            <div className="text-[10px] uppercase font-bold text-text-muted" title="Win rate on EdutradeFX closed signals">
              Platform Win Rate
            </div>
            <div className="text-base font-black font-mono text-green">
              {provider.winRate !== undefined && provider.winRate !== null ? `${provider.winRate}%` : '—'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-tint border border-border">
            <div className="text-[10px] uppercase font-bold text-text-muted">Total Signals</div>
            <div className="text-base font-black font-mono text-text-heading">
              {provider.totalSignals !== undefined && provider.totalSignals !== null
                ? provider.totalSignals
                : 0}
            </div>
          </div>
        </div>

        {/* Trading Styles Chips */}
        {provider.tradingStyles && provider.tradingStyles.length > 0 && (
          <div className="space-y-1 mb-3">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Style
            </div>
            <div className="flex flex-wrap gap-1">
              {provider.tradingStyles.slice(0, 2).map((style, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-blue-50/70 text-blue text-[10px] font-medium border border-blue-100"
                >
                  {style.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instruments Traded Chips */}
        <div className="space-y-1 mb-4">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Covered Instruments
          </div>
          <div className="flex flex-wrap gap-1.5">
            {provider.instruments && provider.instruments.length > 0 ? (
              provider.instruments.slice(0, 4).map((inst, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-surface-tint text-text-body text-[10px] font-medium border border-border"
                >
                  {inst}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-text-muted italic">Multi-Asset</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Link
          href={`/signal-providers/${provider.slug}`}
          className="w-full py-2.5 bg-surface-tint hover:bg-blue hover:text-white text-text-heading rounded-xl text-xs font-bold border border-border hover:border-blue transition-all flex items-center justify-center gap-2 shadow-sm group/btn"
        >
          <span>View Real-Time Signals</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
