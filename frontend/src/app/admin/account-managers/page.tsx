'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Check,
  X,
  Star,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../../lib/api';
import type { AccountManager, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminAMManagementPage() {
  const [managers, setManagers] = useState<AccountManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Quick reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAmId, setSelectedAmId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const updateStatus = async (id: string, status: ApprovalStatus, reason?: string) => {
    try {
      await api.patch(`/admin/account-managers/${id}/status`, { status, reason });
      setManagers(managers.map((m) => (m.id === id ? { ...m, status } : m)));
      toast.success(`Manager status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/account-managers/${id}/feature`, { isFeatured: !current });
      setManagers(managers.map((m) => (m.id === id ? { ...m, isFeatured: !current } : m)));
      toast.success(current ? 'Removed from featured' : 'Marked as featured');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Featured update failed');
    }
  };

  const deleteAM = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete account manager "${name}"?`)) return;
    try {
      await api.delete(`/admin/account-managers/${id}`);
      setManagers(managers.filter((m) => m.id !== id));
      toast.success('Account manager deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account manager');
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmId || !rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    await updateStatus(selectedAmId, 'REJECTED', rejectionReason);
    setRejectModalOpen(false);
    setSelectedAmId(null);
    setRejectionReason('');
  };

  const filtered = managers.filter((m) => {
    const matchesSearch =
      m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.strategy?.toLowerCase().includes(search.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter || m.onboardingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">Account Manager Governance</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Audit manager onboarding, verify licensing credentials, review signed documents, and approve directory profiles.
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
            placeholder="Search by manager name, email, slug..."
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
            <option value="PENDING">Pending Review</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Manager Profile</th>
                <th className="p-4">Onboarding</th>
                <th className="p-4">Regulated</th>
                <th className="p-4">Approval Status</th>
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-tint border border-border uppercase">
                          {m.entityType || 'INDIVIDUAL'}
                        </span>
                      </div>
                      <div className="text-text-muted text-xs">{m.user?.email || 'Registered User'}</div>
                      <div className="text-[11px] text-text-muted">
                        {[m.city, m.country].filter(Boolean).join(', ') || 'Global'}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-xs font-bold text-text-heading">
                        {m.onboardingStatus || 'DRAFT'}
                      </div>
                      <div className="text-[11px] text-blue font-semibold">
                        {m.completionPercent || 0}% Complete
                      </div>
                      {m.submittedAt && (
                        <div className="text-[10px] text-text-muted">
                          Sub: {new Date(m.submittedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {m.regulatoryVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          <ShieldCheck className="w-3 h-3 text-green-600" /> Verified
                        </span>
                      ) : m.isRegulated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Self-Declared
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-muted">No</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          m.status === 'APPROVED'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : m.status === 'PENDING'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
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
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <Link
                          href={`/admin/account-managers/${m.id}`}
                          className="px-3 py-1.5 rounded-xl bg-blue text-white text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>

                        {m.status !== 'APPROVED' && (
                          <button
                            onClick={() => updateStatus(m.id, 'APPROVED')}
                            className="p-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition"
                            title="Quick Approve"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        )}

                        {m.status !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              setSelectedAmId(m.id);
                              setRejectModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
                            title="Reject with Reason"
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        )}

                        <button
                          onClick={() => deleteAM(m.id, m.fullName)}
                          className="p-1.5 rounded-xl bg-surface-tint border border-border text-text-muted hover:text-red-500 transition"
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

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Account Manager">
        <form onSubmit={handleConfirmReject} className="space-y-4 p-2 text-xs">
          <p className="text-text-muted">
            Provide the required reason for rejecting this manager profile. This will be recorded and shown in the
            manager's portal.
          </p>
          <textarea
            required
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Failure to provide verified performance statements..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 border border-border rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
