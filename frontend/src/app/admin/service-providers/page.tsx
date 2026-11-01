'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Eye,
  Filter,
  Building2,
} from 'lucide-react';
import { api } from '@/lib/api';
import PageContainer from '@/components/ui/PageContainer';
import Button from '@/components/ui/Button';

export default function AdminServiceProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/service-providers');
      setProviders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load solutions providers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase();
    const nameMatch =
      (p.brandName || '').toLowerCase().includes(q) ||
      (p.legalName || '').toLowerCase().includes(q) ||
      (p.providerCode || '').toLowerCase().includes(q) ||
      (p.user?.email || '').toLowerCase().includes(q);

    if (!nameMatch) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Solutions Providers Review Desk</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Compliance vetting for institutional bridge providers, CRM systems, and financial tech firms.
            </p>
          </div>
          <Link href="/admin/provider-forms">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 self-start">
              <span>Form Builder & Options</span>
            </Button>
          </Link>
        </div>

        {/* Filter controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by company name, provider code, or user email..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted / In Review</option>
              <option value="APPROVED">Approved / Live</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Providers Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading provider dossiers...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Solutions Providers Found</h3>
            <p className="text-xs text-slate-500 mt-1">No applications matched the current filters.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Code / Ref</th>
                    <th className="px-5 py-3">Categories</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Verification</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {prov.brandName ? prov.brandName[0] : 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{prov.brandName || prov.legalName}</p>
                            <p className="text-xs text-slate-400">{prov.user?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 block">
                          {prov.providerCode || 'PENDING'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {prov.applicationRef || 'DRAFT'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-slate-700">
                          {prov.categorySelections?.length || 0} selected
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            prov.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prov.status === 'SUBMITTED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : prov.status === 'CHANGES_REQUESTED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prov.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold ${
                            prov.verificationStatus === 'VERIFIED'
                              ? 'text-emerald-600 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {prov.verificationStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/service-providers/${prov.id}`}>
                          <Button variant="primary" size="sm" className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Audit Dossier</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
