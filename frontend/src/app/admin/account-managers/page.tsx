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
          <h1 className="text-2xl sm:text-3xl font-black text-navy">Account Manager Governance</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Audit PAMM/MAM managers, inspect trading strategies, feature top performers, and moderate directory profiles.
          </p>
        </div>
        <div className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white border border-border text-text-body shadow-sm">
          Total AMs: <span className="text-navy font-bold font-mono">{managers.length}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-3xl bg-white border border-border shadow-soft">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by manager name, email, or strategy..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
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
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Manager Profile</th>
                <th className="p-4">Strategy & Experience</th>
                <th className="p-4">Min. Investment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-tint/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-navy flex items-center gap-2">
                        <span>{m.fullName}</span>
                        {m.isFeatured && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange/15 text-orange border border-orange/30 font-bold">
                            TOP AM
                          </span>
                        )}
                      </div>
                      <div className="text-text-muted text-xs">{m.user?.email || 'Registered User'}</div>
                      <div className="text-[11px] text-text-muted">{m.country || 'Global'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-text-heading font-medium">{m.strategy || 'Multi-Asset PAMM'}</div>
                      <div className="text-xs text-text-muted">{m.yearsExperience || 3}+ years experience</div>
                    </td>
                    <td className="p-4 font-bold text-green">
                      {m.minInvestment ? `$${m.minInvestment.toLocaleString()}` : '$500'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          m.status === 'APPROVED'
                            ? 'bg-green/10 text-green border border-green/20'
                            : m.status === 'PENDING'
                            ? 'bg-orange/10 text-orange border border-orange/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(m.id, !!m.isFeatured)}
                        className={`p-1.5 rounded-full border transition ${
                          m.isFeatured
                            ? 'bg-orange/15 border-orange/30 text-orange'
                            : 'bg-surface-tint border-border text-text-muted hover:text-navy'
                        }`}
                        title={m.isFeatured ? 'Remove Featured Badge' : 'Make Featured Manager'}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.status !== 'APPROVED' && (
                          <button
                            onClick={() => updateStatus(m.id, 'APPROVED')}
                            className="p-1.5 rounded-full bg-green/10 border border-green/20 text-green hover:bg-green/20 transition"
                            title="Approve Manager"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {m.status !== 'REJECTED' && (
                          <button
                            onClick={() => updateStatus(m.id, 'REJECTED')}
                            className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition"
                            title="Reject / Suspend"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAM(m.id, m.fullName)}
                          className="p-1.5 rounded-full bg-surface-tint border border-border text-text-muted hover:text-red-500 transition"
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
                  <td colSpan={6} className="p-8 text-center text-text-muted text-xs">
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
