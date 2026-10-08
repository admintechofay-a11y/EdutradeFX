'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SignalProvider } from '../../types';
import { StarRating } from '../common/StarRating';

interface SPCardProps {
  provider?: SignalProvider;
  sp?: SignalProvider;
}

export const SPCard: React.FC<SPCardProps> = ({ provider: propProvider, sp }) => {
  const provider = propProvider || sp!;
  return (
    <div className="group rounded-2xl bg-white border border-border hover:border-orange/40 transition-all duration-300 hover:-translate-y-1 shadow-soft hover:shadow-lift p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-tint border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {provider.photo ? (
              <img src={provider.photo} alt={provider.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold font-mono text-orange">
                {provider.displayName ? provider.displayName[0].toUpperCase() : 'S'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-text-heading group-hover:text-orange transition truncate">
                {provider.displayName}
              </h3>
              {provider.verificationStatus && (
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange text-[10px] font-bold border border-orange-200">
                  AUDITED
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted truncate">{provider.strategy || 'Multi-Asset Swing'}</p>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <StarRating rating={provider.avgRating} />
              <span className="font-bold text-text-heading ml-1">{provider.avgRating.toFixed(1)}</span>
              <span className="text-text-muted">({provider.totalReviews})</span>
            </div>
          </div>
        </div>

        {/* Win Rate & Signal Stats */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-border mb-4 text-center">
          <div className="p-2.5 rounded-xl bg-surface-tint border border-border">
            <div className="text-[10px] uppercase font-bold text-text-muted">Audited Win Rate</div>
            <div className="text-base font-black font-mono text-green">
              {provider.winRate ? `${provider.winRate}%` : '78.4%'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-tint border border-border">
            <div className="text-[10px] uppercase font-bold text-text-muted">Total Signals</div>
            <div className="text-base font-black font-mono text-text-heading">
              {provider.totalSignals || 120}+
            </div>
          </div>
        </div>

        {/* Instruments Traded */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Active Instruments
          </div>
          <div className="flex flex-wrap gap-1.5">
            {provider.instruments && provider.instruments.length > 0 ? (
              provider.instruments.slice(0, 3).map((inst, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-surface-tint text-text-body text-[11px] font-medium border border-border"
                >
                  {inst}
                </span>
              ))
            ) : (
              ['EURUSD', 'XAUUSD', 'GBPUSD'].map((inst, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-surface-tint text-text-body text-[11px] font-medium border border-border"
                >
                  {inst}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Link
          href={`/signal-providers/${provider.slug}`}
          className="w-full py-2.5 bg-surface-tint hover:bg-orange hover:text-white text-text-heading rounded-full text-xs font-bold border border-border hover:border-orange transition-all flex items-center justify-center gap-2 shadow-sm group/btn"
        >
          <span>View Real-Time Signals</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
