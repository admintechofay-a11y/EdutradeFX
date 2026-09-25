'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Check, X, Star, Trash2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import type { AccountManager, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminAMManagementPage() {
  const [managers, setManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/account-managers');
      setManagers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load Account Managers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const updateStatus = async (id: string, status: ApprovalStatus) => {
    try {
      await api.patch(`/admin/account-managers/${id}/status`, { status });
      setManagers(managers.map((m) => (m.id === id ? { ...m, status } : m)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/account-managers/${id}/feature`, { isFeatured: !current });
      setManagers(managers.map((m) => (m.id === id ? { ...m, isFeatured: !current } : m)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Featured update failed');
    }
  };

  const deleteAM = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete account manager "${name}"?`)) return;
    try {
      await api.delete(`/admin/account-managers/${id}`);
      setManagers(managers.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete account manager');
    }
  };

  const filtered = managers.filter((m) => {
    const matchesSearch =
      m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.strategy?.toLowerCase().includes(search.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Account Manager Governance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit PAMM/MAM managers, inspect trading strategies, feature top performers, and moderate directory profiles.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Total AMs: <span className="text-white font-mono">{managers.length}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by manager name, email, or strategy..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Approval</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 text-xs uppercase font-bold">
                <th className="p-4">Manager Profile</th>
                <th className="p-4">Strategy & Experience</th>
                <th className="p-4">Min. Investment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{m.fullName}</span>
                        {m.isFeatured && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-amber/15 text-brand-amber border border-brand-amber/30 font-bold">
                            TOP AM
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-xs">{m.user?.email || 'Registered User'}</div>
                      <div className="text-[11px] text-slate-400">{m.country || 'Global'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200 font-medium">{m.strategy || 'Multi-Asset PAMM'}</div>
                      <div className="text-xs text-slate-400">{m.yearsExperience || 3}+ years experience</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {m.minInvestment ? `$${m.minInvestment.toLocaleString()}` : '$500'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          m.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : m.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(m.id, !!m.isFeatured)}
                        className={`p-1.5 rounded-lg border transition ${
                          m.isFeatured
                            ? 'bg-brand-amber/20 border-brand-amber text-brand-amber'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                        }`}
                        title={m.isFeatured ? 'Remove Featured Badge' : 'Make Featured Manager'}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.status !== 'APPROVED' && (
                          <button
                            onClick={() => updateStatus(m.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
                            title="Approve Manager"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {m.status !== 'REJECTED' && (
                          <button
                            onClick={() => updateStatus(m.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition"
                            title="Reject / Suspend"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAM(m.id, m.fullName)}
                          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No account managers found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
