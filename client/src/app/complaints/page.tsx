'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { MOCK_COMPLAINTS } from '@/lib/mockData';
import ComplaintCard from '@/components/ui/ComplaintCard';

export default function ComplaintsRadarPage() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'withdrawal_delay', label: 'Withdrawal Delay / Refusal' },
    { value: 'slippage_manipulation', label: 'Severe Slippage / Spread Spike' },
    { value: 'account_freeze', label: 'Arbitrary Account Freeze' },
    { value: 'bonus_trap', label: 'Bonus Volume Trap' },
  ];

  const resetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCategory('all');
  };

  const filteredComplaints = useMemo(() => {
    return MOCK_COMPLAINTS.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCase = c.caseId.toLowerCase().includes(q);
        const matchesBroker = c.brokerName.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        if (!matchesCase && !matchesBroker && !matchesTitle) return false;
      }

      if (selectedStatus !== 'all') {
        if (selectedStatus === 'scam_warning' && !c.scamWarning && c.status !== 'scam_warning') return false;
        if (selectedStatus !== 'scam_warning' && c.status !== selectedStatus) return false;
      }

      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;

      return true;
    });
  }, [search, selectedStatus, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Stats Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/40 via-brand-card to-amber-950/20 border border-rose-500/30 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Independent Trader Protection Desk
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Scam Warning Radar & <span className="gold-gradient-text">Dispute Ledger</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Public transparency portal tracking verified trader disputes against Forex brokers. We investigate claims, mediate with compliance desks, and publish public warnings on bad actors.
          </p>
        </div>

        <Link
          href="/complaints/new"
          className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          File New Dispute
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-card border border-slate-800 p-4 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Disputed</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">$2,450,000+</span>
        </div>
        <div className="rounded-2xl glass-card border border-slate-800 p-4 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Resolved Cases</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">84%</span>
        </div>
        <div className="rounded-2xl glass-card border border-slate-800 p-4 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Active In Mediation</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">14 Cases</span>
        </div>
        <div className="rounded-2xl glass-card border border-slate-800 p-4 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 block">Scam Warnings Issued</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">6 Entities</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-brand-card/80 border border-slate-800 rounded-2xl p-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID (e.g. ETF-2026-8812), broker name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-brand-surface border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'all'
                ? 'bg-amber-500 text-brand-darkest'
                : 'bg-brand-surface text-slate-400 hover:text-white'
            }`}
          >
            All Cases
          </button>
          <button
            onClick={() => setSelectedStatus('scam_warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'scam_warning'
                ? 'bg-rose-500 text-white'
                : 'bg-brand-surface text-slate-400 hover:text-white'
            }`}
          >
            Scam Warnings
          </button>
          <button
            onClick={() => setSelectedStatus('in_mediation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'in_mediation'
                ? 'bg-amber-500 text-brand-darkest'
                : 'bg-brand-surface text-slate-400 hover:text-white'
            }`}
          >
            In Mediation
          </button>
          <button
            onClick={() => setSelectedStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'resolved'
                ? 'bg-emerald-500 text-brand-darkest'
                : 'bg-brand-surface text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.map((complaint) => (
          <ComplaintCard key={complaint.caseId} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}
