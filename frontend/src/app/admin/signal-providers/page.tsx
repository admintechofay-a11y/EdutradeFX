'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Search, Check, X, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api';
import { SignalProvider, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminSPManagementPage() {
  const [providers, setProviders] = useState<SignalProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const updateStatus = async (id: string, status: ApprovalStatus) => {
    try {
      await api.patch(`/admin/signal-providers/${id}/status`, { status });
      setProviders(providers.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const toggleVerification = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/signal-providers/${id}/verify`, { verified: !current });
      setProviders(providers.map((p) => (p.id === id ? { ...p, verificationStatus: !current } : p)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const filtered = providers.filter((p) =>
    p.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy">Signal Provider Verification</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Audit provider track records, grant verified badges, and moderate trading channels.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 rounded-3xl bg-white border border-border shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider channel name..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
          />
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
                <th className="p-4">Channel / Provider</th>
                <th className="p-4">Strategy</th>
                <th className="p-4">Win Rate</th>
                <th className="p-4">Signals</th>
                <th className="p-4">Audited Status</th>
                <th className="p-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-surface-tint/60 transition">
                  <td className="p-4">
                    <div className="font-bold text-navy">{p.displayName}</div>
                    <div className="text-text-muted text-xs">{p.user?.email || 'Provider User'}</div>
                  </td>
                  <td className="p-4 text-text-body text-xs">{p.strategy || 'Price Action'}</td>
                  <td className="p-4 font-bold text-green">{p.winRate || 75}%</td>
                  <td className="p-4 text-text-muted text-xs">{p.totalSignals} signals</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleVerification(p.id, p.verificationStatus)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        p.verificationStatus
                          ? 'bg-blue/10 text-blue border border-blue/20'
                          : 'bg-surface-tint text-text-muted border border-border'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {p.verificationStatus ? 'Audited' : 'Unverified'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {p.status !== 'APPROVED' ? (
                      <button
                        onClick={() => updateStatus(p.id, 'APPROVED')}
                        className="px-3.5 py-1 bg-green hover:bg-green-hover text-white rounded-full text-xs font-bold transition shadow-sm"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(p.id, 'SUSPENDED')}
                        className="px-3.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full text-xs font-bold transition"
                      >
                        Suspend
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
