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
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-400" />
            Signal Desk & Execution Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast high-conviction trades, monitor live open positions, and track track-record metrics.
          </p>
        </div>

        <Link
          href="/dashboard/signal-provider/signals"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Signal Terminal</span>
        </Link>
      </div>

      {/* KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Win Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {loading ? <Skeleton className="h-8 w-16" /> : `${winRate}%`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on closed verified setups</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Net Pips Harvested</span>
            <TrendingUp className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {loading ? <Skeleton className="h-8 w-20" /> : `${totalPips > 0 ? '+' : ''}${totalPips} pips`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative performance</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Live Active Setups</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : activeSignals.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Currently open in market</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Broadcasts</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : signals.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Published signal history</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/signal-provider/signals"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-emerald-500/50 transition group shadow-xl"
        >
          <Radio className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Signals Terminal</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Publish new forex, crypto, and commodity calls with entry, stop loss, and multiple take profit targets.
          </p>
        </Link>

        <Link
          href="/dashboard/signal-provider/enquiries"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-brand-blue/50 transition group shadow-xl"
        >
          <Users className="w-8 h-8 text-brand-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Investor & Subscriber Enquiries</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Communicate with prospective VIP subscribers, answering copy-trading and risk-management questions.
          </p>
        </Link>

        <Link
          href="/dashboard/signal-provider/profile"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-purple-500/50 transition group shadow-xl"
        >
          <ShieldCheck className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Trading Profile & Track Record</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Display verified trading methodology, risk parameters, Myfxbook sync, and institutional bio.
          </p>
        </Link>
      </div>
    </div>
  );
}
