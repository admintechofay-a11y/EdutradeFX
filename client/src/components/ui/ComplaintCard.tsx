'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';

export interface ComplaintCardProps {
  complaint: {
    _id: string;
    caseId: string;
    title: string;
    brokerName: string;
    category: string;
    disputeAmount: number;
    currency: string;
    incidentDate?: string;
    description: string;
    status: string;
    scamWarning?: boolean;
    createdAt?: string;
    complainant?: {
      name: string;
      country?: string;
    };
  };
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const getStatusBadge = (status: string, scamWarning?: boolean) => {
    if (scamWarning || status === 'scam_warning') {
      return (
        <span className="badge-red flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Scam Warning
        </span>
      );
    }
    if (status === 'resolved') {
      return (
        <span className="badge-green flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Resolved
        </span>
      );
    }
    if (status === 'in_mediation') {
      return (
        <span className="badge-gold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          In Mediation
        </span>
      );
    }
    return (
      <span className="badge-regulation text-blue-400 border-blue-500/30 bg-blue-500/10 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Under Review
      </span>
    );
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      withdrawal_delay: 'Withdrawal Refusal / Delay',
      slippage_manipulation: 'Severe Slippage / Spread Spike',
      account_freeze: 'Arbitrary Account Freeze',
      bonus_trap: 'Bonus Volume Trap',
      unauthorized_trades: 'Unauthorized Orders',
      signal_fraud: 'Signal / Manager Fraud',
    };
    return map[cat] || cat.replace(/_/g, ' ');
  };

  return (
    <div
      className={`rounded-2xl glass-card border p-5 transition-all duration-300 flex flex-col justify-between ${
        complaint.scamWarning
          ? 'border-rose-500/40 bg-rose-950/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header: Case ID, Status, Broker */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {complaint.caseId}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[140px]">
              {complaint.brokerName}
            </span>
          </div>
          {getStatusBadge(complaint.status, complaint.scamWarning)}
        </div>

        {/* Title & Category */}
        <div className="pt-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {getCategoryLabel(complaint.category)}
          </span>
          <h4 className="text-sm font-bold text-white mt-1 line-clamp-2">
            {complaint.title}
          </h4>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Footer: Amount & Link */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500">
            Disputed:
          </span>
          <span className="text-xs font-extrabold text-rose-400">
            ${complaint.disputeAmount?.toLocaleString()} {complaint.currency || 'USD'}
          </span>
        </div>

        <Link
          href={`/complaints/${complaint.caseId}`}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
        >
          Track Case
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
