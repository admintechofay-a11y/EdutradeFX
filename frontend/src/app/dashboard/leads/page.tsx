'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  MousePointerClick,
  TrendingUp,
  Clock,
  ExternalLink,
  Info,
  HelpCircle,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

interface LeadStats {
  totalLeads: number;
  recent30Days: number;
  openAccountClicks: number;
}

export default function BrokerLeadsPage() {
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    recent30Days: 0,
    openAccountClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/brokers/my/leads');
        const data = res.data?.data;
        if (data) {
          setStats({
            totalLeads: data.totalLeads ?? 0,
            recent30Days: data.recent30Days ?? 0,
            openAccountClicks: data.openAccountClicks ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load lead statistics', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Inbound Leads & Inquiry Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue/10 text-blue border border-blue/20 text-[11px] font-bold">
              Aggregated
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Real-time interest, conversion metrics, and account inquiries routed through EdutradeFX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/broker/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-border text-xs font-bold text-navy hover:bg-surface-tint transition shadow-sm"
          >
            Edit Broker Profile
          </Link>
          <a
            href="mailto:partners@edutradefx.com"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-blue hover:bg-blue-hover text-white text-xs font-bold transition shadow-sm"
          >
            Contact Concierge Desk
          </a>
        </div>
      </div>

      {/* Zero PII / Concierge Model Notice Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-blue/5 border border-blue/20 space-y-3">
        <div className="flex items-center gap-2 text-blue font-black text-sm uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-blue shrink-0" />
          <span>EdutradeFX Institutional Concierge Model & Zero PII Guarantee</span>
        </div>
        <p className="text-xs sm:text-sm text-text-body leading-relaxed max-w-4xl">
          To comply with international data privacy regulations (GDPR, CCPA) and protect our registered traders, individual contact details (emails, phone numbers, and identity documents) are <strong>never shared directly or sold</strong> to third-party brokerage sales desks.
        </p>
        <div className="pt-2 text-xs text-text-muted flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <FileCheck className="w-4 h-4 text-emerald-600" /> Compliance pre-checks handled by EdutradeFX
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue" /> Direct account facilitation via verified IB links
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange" /> Inquiries reviewed and routed within 24 hours
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Total Leads */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Total Inbound Inquiries
              </span>
              <div className="text-3xl font-black text-navy">{stats.totalLeads}</div>
              <div className="text-[11px] text-text-muted">Lifetime trader requests via profile</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
              <Users className="w-7 h-7" />
            </div>
          </div>

          {/* Card 2: Recent 30 Days */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Last 30 Days Inquiries
              </span>
              <div className="text-3xl font-black text-emerald-600">{stats.recent30Days}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Active qualified prospects</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>

          {/* Card 3: Open Account Clicks */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Open Account Clicks
              </span>
              <div className="text-3xl font-black text-orange">{stats.openAccountClicks}</div>
              <div className="text-[11px] text-text-muted">Referral traffic to your IB link</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange/10 text-orange flex items-center justify-center shrink-0">
              <MousePointerClick className="w-7 h-7" />
            </div>
          </div>
        </div>
      )}

      {/* How It Works Explainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center text-xs font-black">
              1
            </div>
            <h3 className="text-sm font-black text-navy uppercase tracking-wider">
              Direct Referral Link (IB Link)
            </h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            When prospective traders click &ldquo;Open Account&rdquo; on your public profile or in the broker comparison matrix, they are forwarded directly to your registered affiliate/IB link. You receive full attribution within your existing CRM and client portals.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange text-white flex items-center justify-center text-xs font-black">
              2
            </div>
            <h3 className="text-sm font-black text-navy uppercase tracking-wider">
              Concierge Inquiries
            </h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            When high-net-worth or corporate traders request institutional quotes, custom spreads, or white-label partnerships, our institutional team conducts pre-onboarding verification before facilitating a high-touch introduction with your compliance officers.
          </p>
        </div>
      </div>
    </div>
  );
}
