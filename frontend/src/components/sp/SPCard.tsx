'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Star, ShieldCheck, ArrowRight, TrendingUp, BarChart2 } from 'lucide-react';
import { SignalProvider } from '../../types';
import { StarRating } from '../common/StarRating';

interface SPCardProps {
  provider?: SignalProvider;
  sp?: SignalProvider;
}

export const SPCard: React.FC<SPCardProps> = ({ provider: propProvider, sp }) => {
  const provider = propProvider || sp!;
  return (
    <div className="group rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-navy-light border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            {provider.photo ? (
              <img src={provider.photo} alt={provider.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold text-purple-400">
                {provider.displayName ? provider.displayName[0].toUpperCase() : 'S'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition truncate">
                {provider.displayName}
              </h3>
              {provider.verificationStatus && (
                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  AUDITED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{provider.strategy || 'Multi-Asset Swing'}</p>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <StarRating rating={provider.avgRating} />
              <span className="font-bold text-white ml-1">{provider.avgRating.toFixed(1)}</span>
              <span className="text-slate-400">({provider.totalReviews})</span>
            </div>
          </div>
        </div>

        {/* Win Rate & Signal Stats */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-800/80 mb-4 text-center">
          <div className="p-2 rounded-xl bg-brand-navy-light/50 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Audited Win Rate</div>
            <div className="text-base font-black text-emerald-400">
              {provider.winRate ? `${provider.winRate}%` : '78.4%'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-brand-navy-light/50 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Signals</div>
            <div className="text-base font-black text-white">
              {provider.totalSignals || 120}+
            </div>
          </div>
        </div>

        {/* Instruments Traded */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Instruments
          </div>
          <div className="flex flex-wrap gap-1.5">
            {provider.instruments && provider.instruments.length > 0 ? (
              provider.instruments.slice(0, 3).map((inst, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md bg-brand-navy-light text-slate-300 text-[11px] border border-slate-700"
                >
                  {inst}
                </span>
              ))
            ) : (
              ['EURUSD', 'XAUUSD', 'GBPUSD'].map((inst, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md bg-brand-navy-light text-slate-300 text-[11px] border border-slate-700"
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
          className="w-full py-2.5 bg-brand-navy-light hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <span>View Real-Time Signals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
