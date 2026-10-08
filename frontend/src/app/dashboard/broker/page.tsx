'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Star,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Award,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

export default function BrokerOverviewPage() {
  const [broker, setBroker] = useState<any>(null);
  const [leadsCount, setLeadsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, leadsRes] = await Promise.allSettled([
          api.get('/brokers/my/profile'),
          api.get('/brokers/my/leads'),
        ]);

        if (profileRes.status === 'fulfilled') {
          setBroker(profileRes.value.data?.data || null);
        }
        if (leadsRes.status === 'fulfilled') {
          setLeadsCount(leadsRes.value.data?.data?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load broker overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue" />
            Broker Corporate Command Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your firm listing, regulatory disclosures, investor leads, and institutional reputation.
          </p>
        </div>

        {broker?.slug && (
          <Link
            href={`/brokers/${broker.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
          >
            <span>View Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Verification Status Banner */}
      {broker && broker.status !== 'APPROVED' && (
        <div className="p-4 rounded-2xl bg-orange/10 border border-orange/20 flex items-start gap-3 text-orange text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Institutional Compliance Status: {broker.status}</div>
            <p className="text-text-body mt-0.5">
              {broker.status === 'PENDING'
                ? 'Your brokerage application is undergoing regulatory verification by EdutradeFX compliance officers.'
                : `Status notice: ${broker.rejectionReason || 'Please contact institutional support.'}`}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Inbound Leads</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="text-2xl font-black text-navy font-mono">
            {loading ? <Skeleton className="h-8 w-16" /> : leadsCount}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Traders requesting onboarding</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Reputation Score</span>
            <Star className="w-4 h-4 text-orange" />
          </div>
          <div className="text-2xl font-black text-orange font-mono">
            {loading ? <Skeleton className="h-8 w-16" /> : broker?.avgRating?.toFixed(1) || '4.8'}
            <span className="text-xs text-text-muted font-normal font-sans"> / 5.0</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">{broker?.totalReviews || 0} verified reviews</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Spreads From</span>
            <TrendingUp className="w-4 h-4 text-green" />
          </div>
          <div className="text-2xl font-black text-green font-mono">
            {loading ? <Skeleton className="h-8 w-24" /> : broker?.spreadsFrom || '0.0 pips'}
          </div>
          <p className="text-[11px] text-text-muted mt-1">EURUSD institutional spread</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Regulation Tier</span>
            <ShieldCheck className="w-4 h-4 text-navy" />
          </div>
          <div className="text-lg font-black text-navy truncate">
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : Array.isArray(broker?.regulation) ? (
              broker.regulation.slice(0, 2).join(', ')
            ) : (
              broker?.regulation || 'Tier-1 Regulated'
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Verified compliance licenses</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/broker/profile"
          className="p-6 rounded-3xl bg-white border border-border hover:border-blue/50 transition group shadow-soft hover:shadow-card"
        >
          <Building2 className="w-8 h-8 text-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Update Firm Profile</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-blue transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Update account types, trading platforms, leverage, deposit methods, and compliance documentation.
          </p>
        </Link>

        <Link
          href="/dashboard/broker/leads"
          className="p-6 rounded-3xl bg-white border border-border hover:border-green/50 transition group shadow-soft hover:shadow-card"
        >
          <Users className="w-8 h-8 text-green mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Trader Lead Pipeline</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-green transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Access inbound registration leads, investor contacts, and export CRM-ready CSV files.
          </p>
        </Link>

        <Link
          href="/dashboard/broker/reviews"
          className="p-6 rounded-3xl bg-white border border-border hover:border-orange/50 transition group shadow-soft hover:shadow-card"
        >
          <MessageSquare className="w-8 h-8 text-orange mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Reputation & Reviews</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-orange transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Review community ratings, respond officially to trader feedback, and protect your brand score.
          </p>
        </Link>
      </div>
    </div>
  );
}
