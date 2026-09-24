'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Check, X, ShieldAlert, Star, ExternalLink, Plus, Trash2, Edit } from 'lucide-react';
import { api } from '../../../lib/api';
import type { Broker, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminBrokersManagementPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New broker form
  const [newBroker, setNewBroker] = useState({
    companyName: '',
    website: '',
    headquarters: '',
    yearFounded: 2018,
    minDeposit: 50,
    maxLeverage: '1:500',
    spreadsFrom: '0.0 Pips',
    executionType: 'ECN / STP',
    regulation: 'FCA, ASIC, CySEC',
  });

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

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/brokers/${id}/feature`, { isFeatured: !current });
      setBrokers(brokers.map((b) => (b.id === id ? { ...b, isFeatured: !current } : b)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Featured update failed');
    }
  };

  const deleteBroker = async (id: string, companyName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${companyName}" from the broker directory?`)) return;
    try {
      await api.delete(`/admin/brokers/${id}`);
      setBrokers(brokers.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...newBroker,
        regulation: newBroker.regulation.split(',').map((s) => s.trim()),
      };
      const res = await api.post('/admin/brokers', payload);
      const created = res.data?.data;
      if (created) {
        setBrokers([created, ...brokers]);
      }
      setShowAddModal(false);
      setNewBroker({
        companyName: '',
        website: '',
        headquarters: '',
        yearFounded: 2018,
        minDeposit: 50,
        maxLeverage: '1:500',
        spreadsFrom: '0.0 Pips',
        executionType: 'ECN / STP',
        regulation: 'FCA, ASIC, CySEC',
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create broker');
    } finally {
      setSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Broker Directory & Regulatory Audits</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, approve, suspend, add, or delete broker listing profiles and tier-1 regulatory audits.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Broker</span>
        </button>
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
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
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
                    <div>Min: ${b.minDeposit || 10} • {b.executionType || 'ECN/STP'}</div>
                    <div className="text-slate-400">Leverage: {b.maxLeverage || '1:500'} • Raw: {b.spreadsFrom || '0.0 Pips'}</div>
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
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(b.id, !!b.isFeatured)}
                      className={`p-1.5 rounded-lg border transition ${
                        b.isFeatured
                          ? 'bg-brand-amber/20 border-brand-amber text-brand-amber'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                      }`}
                      title={b.isFeatured ? 'Remove Featured Badge' : 'Make Featured Broker'}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    {b.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        title="Approve"
                      >
                        Approve
                      </button>
                    )}
                    {b.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'SUSPENDED')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                        title="Suspend"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => deleteBroker(b.id, b.companyName)}
                      className="p-1.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition"
                      title="Delete Broker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Broker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span>Add Broker to Directory</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBroker} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Broker Name *</label>
                <input
                  type="text"
                  required
                  value={newBroker.companyName}
                  onChange={(e) => setNewBroker({ ...newBroker, companyName: e.target.value })}
                  placeholder="e.g. Apex Global Markets"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Website</label>
                  <input
                    type="url"
                    value={newBroker.website}
                    onChange={(e) => setNewBroker({ ...newBroker, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Headquarters</label>
                  <input
                    type="text"
                    value={newBroker.headquarters}
                    onChange={(e) => setNewBroker({ ...newBroker, headquarters: e.target.value })}
                    placeholder="London, UK"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={newBroker.minDeposit}
                    onChange={(e) => setNewBroker({ ...newBroker, minDeposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Leverage</label>
                  <input
                    type="text"
                    value={newBroker.maxLeverage}
                    onChange={(e) => setNewBroker({ ...newBroker, maxLeverage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Execution Type</label>
                  <input
                    type="text"
                    value={newBroker.executionType}
                    onChange={(e) => setNewBroker({ ...newBroker, executionType: e.target.value })}
                    placeholder="ECN / STP"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Regulations (Comma Separated)</label>
                <input
                  type="text"
                  value={newBroker.regulation}
                  onChange={(e) => setNewBroker({ ...newBroker, regulation: e.target.value })}
                  placeholder="FCA, ASIC, CySEC"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold"
                >
                  {saving ? 'Creating...' : 'Create Broker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
