'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Check, X, ShieldAlert, Star, ExternalLink } from 'lucide-react';
import { api } from '../../../lib/api';
import { Broker, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminBrokersManagementPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/brokers');
      setBrokers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load brokers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const updateStatus = async (id: string, status: ApprovalStatus) => {
    try {
      await api.patch(`/admin/brokers/${id}/status`, { status });
      setBrokers(brokers.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const filtered = brokers.filter((b) => {
    const matchesSearch =
      b.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      b.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Broker Regulatory Audits</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review, approve, suspend, or reject broker listing applications and compliance audits.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search broker company name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Audit</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 text-xs uppercase font-bold">
                <th className="p-4">Broker Entity</th>
                <th className="p-4">Licenses</th>
                <th className="p-4">Trading Conditions</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{b.companyName}</span>
                      {b.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded bg-brand-amber/15 text-brand-amber text-[10px] font-bold">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {b.headquarters || 'London'} • Est. {b.yearFounded || 2012}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {b.regulation && b.regulation.length > 0 ? (
                        b.regulation.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">Unregulated</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-300">
                    <div>Min: ${b.minDeposit || 10}</div>
                    <div>Leverage: {b.maxLeverage || '1:500'}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/15 text-brand-amber'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {b.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'APPROVED')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Approve
                      </button>
                    )}
                    {b.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'SUSPENDED')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                      >
                        Suspend
                      </button>
                    )}
                    {b.status !== 'REJECTED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'REJECTED')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
