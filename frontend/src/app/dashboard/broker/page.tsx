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
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            Broker Corporate Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your firm listing, regulatory disclosures, investor leads, and institutional reputation.
          </p>
        </div>

        {broker?.slug && (
          <Link
            href={`/brokers/${broker.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20"
          >
            <span>View Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Verification Status Banner */}
      {broker && broker.status !== 'APPROVED' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Institutional Compliance Status: {broker.status}</div>
            <p className="text-slate-300 mt-0.5">
              {broker.status === 'PENDING'
                ? 'Your brokerage application is undergoing regulatory verification by EdutradeFX compliance officers.'
                : `Status notice: ${broker.rejectionReason || 'Please contact institutional support.'}`}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Inbound Leads</span>
            <Users className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-white">
            {loading ? <Skeleton className="h-8 w-16" /> : leadsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Traders requesting onboarding</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Reputation Score</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {loading ? <Skeleton className="h-8 w-16" /> : broker?.avgRating?.toFixed(1) || '4.8'}
            <span className="text-xs text-slate-500 font-normal"> / 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{broker?.totalReviews || 0} verified reviews</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Spreads From</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {loading ? <Skeleton className="h-8 w-24" /> : broker?.spreadsFrom || '0.0 pips'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">EURUSD institutional spread</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Regulation Tier</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : Array.isArray(broker?.regulation) ? (
              broker.regulation.slice(0, 2).join(', ')
            ) : (
              broker?.regulation || 'Tier-1 Regulated'
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified compliance licenses</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/broker/profile"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-purple-500/50 transition group shadow-xl"
        >
          <Building2 className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Update Firm Profile</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Update account types, trading platforms, leverage, deposit methods, and compliance documentation.
          </p>
        </Link>

        <Link
          href="/dashboard/broker/leads"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-brand-blue/50 transition group shadow-xl"
        >
          <Users className="w-8 h-8 text-brand-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Trader Lead Pipeline</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Access inbound registration leads, investor contacts, and export CRM-ready CSV files.
          </p>
        </Link>

        <Link
          href="/dashboard/broker/reviews"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-amber-500/50 transition group shadow-xl"
        >
          <MessageSquare className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Reputation & Reviews</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Review community ratings, respond officially to trader feedback, and protect your brand score.
          </p>
        </Link>
      </div>
    </div>
  );
}
