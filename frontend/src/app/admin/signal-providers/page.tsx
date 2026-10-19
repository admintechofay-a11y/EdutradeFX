'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  Search,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Eye,
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SignalProvider, ApprovalStatus } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

export default function AdminSPManagementPage() {
  const [providers, setProviders] = useState<SignalProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/signal-providers');
      setProviders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load SPs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filtered = providers.filter((p) => {
    const matchesSearch =
      p.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return p.status === 'PENDING' || p.onboardingStatus === 'SUBMITTED';
    if (statusFilter === 'APPROVED') return p.status === 'APPROVED';
    if (statusFilter === 'REJECTED') return p.status === 'REJECTED';
    if (statusFilter === 'CHANGES_REQUESTED') return p.onboardingStatus === 'CHANGES_REQUESTED';
    if (statusFilter === 'DRAFT') return p.onboardingStatus === 'DRAFT';

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy flex items-center gap-2">
            <Radio className="w-6 h-6 text-green" />
            <span>Signal Providers Verification &amp; Moderation</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review onboarding submissions, audit statements and KYC documents, and moderate live signal desks.
          </p>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by provider name, email, or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue transition"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {['ALL', 'PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-blue text-white shadow-sm'
                  : 'bg-surface-tint border border-border text-text-muted hover:text-text-heading'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full min-w-[850px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Channel / Provider</th>
                <th className="p-4">Status / Onboarding</th>
                <th className="p-4">Completion</th>
                <th className="p-4">Flags</th>
                <th className="p-4">Signals / Win Rate</th>
                <th className="p-4">Verification</th>
                <th className="p-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    No signal providers found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const flags = Array.isArray(p.reviewFlags) ? p.reviewFlags : [];
                  const isPending = p.status === 'PENDING' && p.onboardingStatus === 'SUBMITTED';

                  return (
                    <tr key={p.id} className="hover:bg-surface-tint/60 transition">
                      <td className="p-4">
                        <div className="font-bold text-navy flex items-center gap-1.5">
                          <span>{p.displayName}</span>
                          {p.usesMartingale && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              Martingale
                            </span>
                          )}
                        </div>
                        <div className="text-text-muted text-xs font-mono">{p.user?.email || '—'}</div>
                        {p.strategy && <div className="text-[11px] text-text-muted truncate max-w-xs">{p.strategy}</div>}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                              p.status === 'APPROVED'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : p.status === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {p.status}
                          </span>
                          <div className="text-[10px] text-text-muted">
                            Flow: <span className="font-semibold text-text-heading">{p.onboardingStatus || 'DRAFT'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] font-bold text-text-muted mb-0.5">
                            <span>{p.completionPercent || 0}%</span>
                          </div>
                          <div className="w-full bg-surface-tint rounded-full h-1.5 border border-border overflow-hidden">
                            <div
                              className="bg-blue h-full rounded-full"
                              style={{ width: `${p.completionPercent || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {flags.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            {flags.length} Flag{flags.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-muted">Clean</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-mono text-xs font-bold text-text-heading">
                          {p.winRate !== undefined && p.winRate !== null ? `${p.winRate}% WR` : '—'}
                        </div>
                        <div className="text-[10px] text-text-muted">{p.totalSignals || 0} signals</div>
                      </td>

                      <td className="p-4">
                        {p.verificationStatus ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-muted">Unverified</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/signal-providers/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue hover:bg-blue-hover text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Dossier</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
