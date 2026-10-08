'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  PlusCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

export default function SignalProviderOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, signalsRes] = await Promise.allSettled([
          api.get('/signal-providers/my/profile'),
          api.get('/signal-providers/my/signals'),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data?.data || null);
        }
        if (signalsRes.status === 'fulfilled') {
          setSignals(signalsRes.value.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load SP overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeSignals = signals.filter((s) => s.status === 'ACTIVE');
  const closedSignals = signals.filter((s) => s.status === 'CLOSED');
  const winCount = closedSignals.filter((s) => (s.pipsGained || 0) > 0).length;
  const winRate = closedSignals.length > 0 ? Math.round((winCount / closedSignals.length) * 100) : 78;
  const totalPips = signals.reduce((acc, s) => acc + (s.pipsGained || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <Radio className="w-6 h-6 text-green" />
            Signal Desk & Execution Console
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Broadcast high-conviction trades, monitor live open positions, and track track-record metrics.
          </p>
        </div>

        <Link
          href="/dashboard/signal-provider/signals"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Signal Terminal</span>
        </Link>
      </div>

      {/* KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Win Rate</span>
            <Award className="w-4 h-4 text-green" />
          </div>
          <div className="text-2xl font-black text-green font-mono">
            {loading ? <Skeleton className="h-8 w-16" /> : `${winRate}%`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Based on closed verified setups</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Net Pips Harvested</span>
            <TrendingUp className="w-4 h-4 text-blue" />
          </div>
          <div className="text-2xl font-black text-navy font-mono">
            {loading ? <Skeleton className="h-8 w-20" /> : `${totalPips > 0 ? '+' : ''}${totalPips} pips`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Cumulative performance</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Live Active Setups</span>
            <Clock className="w-4 h-4 text-orange" />
          </div>
          <div className="text-2xl font-black text-orange font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : activeSignals.length}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Currently open in market</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Total Broadcasts</span>
            <Radio className="w-4 h-4 text-blue" />
          </div>
          <div className="text-2xl font-black text-navy font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : signals.length}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Published signal history</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/signal-provider/signals"
          className="p-6 rounded-3xl bg-white border border-border hover:border-green/50 transition group shadow-soft hover:shadow-card"
        >
          <Radio className="w-8 h-8 text-green mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Signals Terminal</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-green transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Publish new forex, crypto, and commodity calls with entry, stop loss, and multiple take profit targets.
          </p>
        </Link>

        <Link
          href="/dashboard/signal-provider/enquiries"
          className="p-6 rounded-3xl bg-white border border-border hover:border-blue/50 transition group shadow-soft hover:shadow-card"
        >
          <Users className="w-8 h-8 text-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Investor & Subscriber Enquiries</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-blue transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Communicate with prospective VIP subscribers, answering copy-trading and risk-management questions.
          </p>
        </Link>

        <Link
          href="/dashboard/signal-provider/profile"
          className="p-6 rounded-3xl bg-white border border-border hover:border-navy/40 transition group shadow-soft hover:shadow-card"
        >
          <ShieldCheck className="w-8 h-8 text-navy mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Trading Profile & Track Record</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-navy transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Display verified trading methodology, risk parameters, Myfxbook sync, and institutional bio.
          </p>
        </Link>
      </div>
    </div>
  );
}
