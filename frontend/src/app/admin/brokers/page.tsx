'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, Check, X, ShieldAlert, Star, ExternalLink, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { api } from '../../../lib/api';
import type { Broker, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';

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
          <h1 className="text-2xl sm:text-3xl font-black text-navy">Broker Directory & Regulatory Audits</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review, approve, suspend, add, or delete broker listing profiles and tier-1 regulatory audits.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Broker</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search broker company name..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
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
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Broker Entity</th>
                <th className="p-4">Licenses</th>
                <th className="p-4">Trading Conditions</th>
                <th className="p-4">Status</th>
                <th className="p-4">Onboarding Dossier</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-surface-tint/60 transition">
                  <td className="p-4">
                    <div className="font-bold text-navy flex items-center gap-2">
                      <span>{b.companyName}</span>
                      {b.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange/15 text-orange text-[10px] font-bold">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div className="text-text-muted text-xs mt-0.5">
                      {b.headquarters || 'London'} • Est. {b.yearFounded || 2012}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {b.regulation && b.regulation.length > 0 ? (
                        b.regulation.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-green/10 text-green border border-green/20 text-[11px] font-medium"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-text-muted">Unregulated</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-text-body">
                    <div>Min: ${b.minDeposit || 10} • {b.executionType || 'ECN/STP'}</div>
                    <div className="text-text-muted">Leverage: {b.maxLeverage || '1:500'} • Raw: {b.spreadsFrom || '0.0 Pips'}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'APPROVED'
                          ? 'bg-green/10 text-green'
                          : b.status === 'PENDING'
                          ? 'bg-orange/10 text-orange'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-full bg-surface-tint border border-border text-[10px] font-bold text-navy uppercase">
                        {b.onboardingStatus || 'DRAFT'}
                      </span>
                      <div className="text-[10px] text-text-muted font-bold">
                        {b.completenessPct ?? 0}% Complete
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(b.id, !!b.isFeatured)}
                      className={`p-1.5 rounded-full border transition ${
                        b.isFeatured
                          ? 'bg-orange/15 border-orange/30 text-orange'
                          : 'bg-surface-tint border-border text-text-muted hover:text-navy'
                      }`}
                      title={b.isFeatured ? 'Remove Featured Badge' : 'Make Featured Broker'}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <Link
                      href={`/admin/brokers/${b.id}`}
                      className="px-3 py-1 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                      title="Audit Broker Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Audit
                    </Link>
                    {b.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'APPROVED')}
                        className="px-3 py-1 bg-green hover:bg-green-hover text-white rounded-full text-xs font-bold transition shadow-sm"
                        title="Approve"
                      >
                        Approve
                      </button>
                    )}
                    {b.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => updateStatus(b.id, 'SUSPENDED')}
                        className="px-3 py-1 bg-orange/10 text-orange hover:bg-orange/20 border border-orange/20 rounded-full text-xs font-bold transition"
                        title="Suspend"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => deleteBroker(b.id, b.companyName)}
                      className="p-1.5 bg-surface-tint border border-border text-text-muted hover:text-red-500 rounded-full text-xs transition"
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
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="lg"
        title={
          <span className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue" />
            <span>Add Broker to Directory</span>
          </span>
        }
      >
        <form onSubmit={handleCreateBroker} className="space-y-3 text-xs">
          <div>
            <label className="block text-text-heading font-semibold mb-1">Company / Broker Name *</label>
            <input
              type="text"
              required
              value={newBroker.companyName}
              onChange={(e) => setNewBroker({ ...newBroker, companyName: e.target.value })}
              placeholder="e.g. Apex Global Markets"
              className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-text-heading font-semibold mb-1">Official Website</label>
              <input
                type="url"
                value={newBroker.website}
                onChange={(e) => setNewBroker({ ...newBroker, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-text-heading font-semibold mb-1">Headquarters</label>
              <input
                type="text"
                value={newBroker.headquarters}
                onChange={(e) => setNewBroker({ ...newBroker, headquarters: e.target.value })}
                placeholder="London, UK"
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-text-heading font-semibold mb-1">Min Deposit ($)</label>
              <input
                type="number"
                value={newBroker.minDeposit}
                onChange={(e) => setNewBroker({ ...newBroker, minDeposit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-text-heading font-semibold mb-1">Max Leverage</label>
              <input
                type="text"
                value={newBroker.maxLeverage}
                onChange={(e) => setNewBroker({ ...newBroker, maxLeverage: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
            <div>
              <label className="block text-text-heading font-semibold mb-1">Execution Type</label>
              <input
                type="text"
                value={newBroker.executionType}
                onChange={(e) => setNewBroker({ ...newBroker, executionType: e.target.value })}
                placeholder="ECN / STP"
                className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-heading font-semibold mb-1">Regulations (Comma Separated)</label>
            <input
              type="text"
              value={newBroker.regulation}
              onChange={(e) => setNewBroker({ ...newBroker, regulation: e.target.value })}
              placeholder="FCA, ASIC, CySEC"
              className="w-full px-3 py-2 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-full border border-border text-text-body hover:bg-surface-tint font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue hover:bg-blue-hover text-white rounded-full font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Broker'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
