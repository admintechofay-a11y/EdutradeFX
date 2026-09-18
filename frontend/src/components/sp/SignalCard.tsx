'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Target, AlertTriangle } from 'lucide-react';
import { Signal } from '../../types';

interface SignalCardProps {
  signal: Signal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const isBuy = signal.direction === 'BUY';

  return (
    <div className="p-4 rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-750 transition space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">{signal.instrument}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
              isBuy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {signal.direction}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            signal.status === 'ACTIVE'
              ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30 animate-pulse'
              : signal.status === 'CLOSED'
              ? 'bg-slate-800 text-slate-400'
              : 'bg-amber-500/20 text-brand-amber'
          }`}
        >
          {signal.status}
        </span>
      </div>

      {/* Target Parameters */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-brand-navy-light/40 rounded-xl border border-slate-800">
        <div>
          <div className="text-[10px] text-slate-400">Entry</div>
          <div className="font-bold text-white">{signal.entryPrice || 'Market'}</div>
        </div>
        <div>
          <div className="text-[10px] text-rose-400">Stop Loss</div>
          <div className="font-bold text-rose-300">{signal.stopLoss || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[10px] text-emerald-400">Take Profit</div>
          <div className="font-bold text-emerald-300">{signal.takeProfit || 'N/A'}</div>
        </div>
      </div>

      {/* Pips / Description */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {new Date(signal.createdAt).toLocaleDateString()}
        </span>

        {signal.pipsGained !== null && signal.pipsGained !== undefined && (
          <span
            className={`font-black ${
              signal.pipsGained >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {signal.pipsGained >= 0 ? `+${signal.pipsGained}` : signal.pipsGained} Pips
          </span>
        )}
      </div>
    </div>
  );
};
