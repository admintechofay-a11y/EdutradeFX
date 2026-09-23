'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Building,
  DollarSign,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_COMPLAINTS } from '@/lib/mockData';

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
  const complaint =
    MOCK_COMPLAINTS.find(
      (c) => c.caseId.toLowerCase() === params.id.toLowerCase() || c._id === params.id
    ) || MOCK_COMPLAINTS[0];

  const getStatusBadge = (status: string, scamWarning?: boolean) => {
    if (scamWarning || status === 'scam_warning') {
      return (
        <span className="badge-red text-xs flex items-center gap-1.5 px-3 py-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Public Scam Warning Issued
        </span>
      );
    }
    if (status === 'resolved') {
      return (
        <span className="badge-green text-xs flex items-center gap-1.5 px-3 py-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Dispute Resolved & Funds Recovered
        </span>
      );
    }
    if (status === 'in_mediation') {
      return (
        <span className="badge-gold text-xs flex items-center gap-1.5 px-3 py-1">
          <Clock className="w-3.5 h-3.5" />
          In Active Mediation
        </span>
      );
    }
    return (
      <span className="badge-regulation text-blue-400 border-blue-500/30 bg-blue-500/10 text-xs flex items-center gap-1.5 px-3 py-1">
        <Clock className="w-3.5 h-3.5" />
        Under Review
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dispute Ledger
      </Link>

      {/* Case Header Banner */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
              {complaint.caseId}
            </span>
            {getStatusBadge(complaint.status, complaint.scamWarning)}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white">{complaint.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1 text-white font-bold">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: {complaint.brokerName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Logged: {complaint.createdAt || 'May 2026'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Complainant: {complaint.complainant?.name || 'Verified Trader'} ({complaint.complainant?.country || 'Global'})</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-surface/80 rounded-2xl p-4 border border-slate-800 text-right shrink-0 w-full md:w-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Disputed Capital
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 block mt-0.5">
            ${complaint.disputeAmount?.toLocaleString()} {complaint.currency || 'USD'}
          </span>
        </div>
      </div>

      {/* Grid: Narrative & Interactive Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Broker Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Narrative description */}
          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Dispute Statement & Account Details
            </h2>

            <div className="p-3 rounded-xl bg-brand-surface/60 border border-slate-800/80 text-xs flex justify-between">
              <span className="text-slate-400">Trading Account Number:</span>
              <span className="text-white font-mono font-bold">
                {complaint.tradingAccountNumber}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
              {complaint.description}
            </p>
          </div>

          {/* Official Broker Response (if available) */}
          {complaint.brokerResponse && complaint.brokerResponse.text && (
            <div className="rounded-2xl glass-card border border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Official Response from {complaint.brokerResponse.respondedBy || complaint.brokerName}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {complaint.brokerResponse.respondedAt ? new Date(complaint.brokerResponse.respondedAt).toLocaleDateString() : 'Verified'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-brand-surface/40 p-4 rounded-xl border border-slate-800">
                "{complaint.brokerResponse.text}"
              </p>
            </div>
          )}

          {/* Mediation Findings */}
          {complaint.adminNotes && (
            <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                EduTradeFX Mediation Desk Findings
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {complaint.adminNotes}
              </p>
              {complaint.resolutionSummary && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <strong>Resolution Verdict:</strong> {complaint.resolutionSummary}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Case Timeline */}
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Case Progression Timeline
            </h3>

            <div className="space-y-6 relative pl-6 border-l-2 border-slate-800">
              {complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-brand-card ${
                        item.stage === 'scam_warning'
                          ? 'bg-rose-500'
                          : item.stage === 'resolved'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{item.title}</h4>
                    {item.note && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.note}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-slate-500 font-mono">Current</span>
                  <h4 className="text-xs font-bold text-white">Under Investigation</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mediation desk is examining evidence attachments.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
