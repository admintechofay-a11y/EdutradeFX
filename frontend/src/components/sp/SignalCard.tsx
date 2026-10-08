'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Signal } from '../../types';

interface SignalCardProps {
  signal: Signal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const isBuy = signal.direction === 'BUY';

  return (
    <div className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-lift transition-all space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-text-heading">{signal.instrument}</span>
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
              isBuy
                ? 'bg-green-50 text-green border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {signal.direction}
          </span>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            signal.status === 'ACTIVE'
              ? 'bg-blue-50 text-blue border border-blue-200'
              : signal.status === 'CLOSED'
              ? 'bg-slate-100 text-text-muted'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          {signal.status}
        </span>
      </div>

      {/* Target Parameters */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2.5 bg-surface-tint rounded-xl border border-border font-mono">
        <div>
          <div className="text-[10px] text-text-muted font-sans font-semibold">Entry</div>
          <div className="font-bold text-text-heading">{signal.entryPrice || 'Market'}</div>
        </div>
        <div>
          <div className="text-[10px] text-red-600 font-sans font-semibold">Stop Loss</div>
          <div className="font-bold text-red-600">{signal.stopLoss || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[10px] text-green font-sans font-semibold">Take Profit</div>
          <div className="font-bold text-green">{signal.takeProfit || 'N/A'}</div>
        </div>
      </div>

      {/* Pips / Description */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          {new Date(signal.createdAt).toLocaleDateString()}
        </span>

        {signal.pipsGained !== null && signal.pipsGained !== undefined && (
          <span
            className={`font-mono font-black ${
              signal.pipsGained >= 0 ? 'text-green' : 'text-red-600'
            }`}
          >
            {signal.pipsGained >= 0 ? `+${signal.pipsGained}` : signal.pipsGained} Pips
          </span>
        )}
      </div>
    </div>
  );
};
