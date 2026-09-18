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
        <h1 className="text-2xl sm:text-3xl font-black text-white">Signal Provider Verification</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Audit provider track records, grant verified badges, and moderate trading channels.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider channel name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
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
                <th className="p-4">Channel / Provider</th>
                <th className="p-4">Strategy</th>
                <th className="p-4">Win Rate</th>
                <th className="p-4">Signals</th>
                <th className="p-4">Audited Status</th>
                <th className="p-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="font-bold text-white">{p.displayName}</div>
                    <div className="text-slate-500 text-xs">{p.user?.email || 'Provider User'}</div>
                  </td>
                  <td className="p-4 text-slate-300">{p.strategy || 'Price Action'}</td>
                  <td className="p-4 font-bold text-emerald-400">{p.winRate || 75}%</td>
                  <td className="p-4 text-slate-400">{p.totalSignals} signals</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleVerification(p.id, p.verificationStatus)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        p.verificationStatus
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-500'
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
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(p.id, 'SUSPENDED')}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
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
