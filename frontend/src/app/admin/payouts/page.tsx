'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
  CreditCard,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    payout: any;
    status: 'APPROVED' | 'REJECTED' | 'PAID';
  } | null>(null);
  const [notes, setNotes] = useState('');

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/admin/payouts?${params.toString()}`);
      if (res.data?.success) {
        setPayouts(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch payouts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, statusFilter]);

  const handleProcessPayout = async () => {
    if (!actionModal) return;
    setProcessingId(actionModal.payout.id);

    try {
      const res = await api.patch(`/admin/payouts/${actionModal.payout.id}`, {
        status: actionModal.status,
        notes: notes.trim() || undefined,
      });

      if (res.data?.success) {
        setPayouts((prev) =>
          prev.map((p) => (p.id === actionModal.payout.id ? res.data.data : p))
        );
        setActionModal(null);
        setNotes('');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to process payout.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-blue/10 text-blue border-blue/20';
      case 'PAID':
        return 'bg-green/10 text-green border-green/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING':
      default:
        return 'bg-orange/10 text-orange border-orange/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue" />
            Tutor Payout Approvals Desk
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Review tutor withdrawal requests, verify course revenue balances, and approve or reject disbursements.
          </p>
        </div>
        <button
          onClick={fetchPayouts}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-surface-tint text-navy rounded-full text-xs font-semibold border border-border shadow-sm transition w-full sm:w-auto min-h-[40px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        {['', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
              statusFilter === st
                ? 'bg-blue text-white shadow-sm'
                : 'text-text-muted hover:text-navy hover:bg-surface-tint'
            }`}
          >
            {st === '' ? 'All Requests' : st}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-soft">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-border/40" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CheckCircle2 className="w-12 h-12 text-border mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy">No Payout Requests</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              No tutor disbursement requests matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs text-text-body">
              <thead className="bg-surface-tint border-b border-border text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tutor Details</th>
                  <th className="py-3.5 px-4">Requested Amount</th>
                  <th className="py-3.5 px-4">Disbursement Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-surface-tint/60 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-navy">
                        {payout.tutor?.user?.name || payout.tutor?.headline || 'Tutor'}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {payout.tutor?.user?.email || `Tutor ID: ${payout.tutorId}`}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-black text-green font-mono">
                        ${payout.amount.toLocaleString()} {payout.currency || 'USD'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-text-heading">
                        {payout.method || 'Bank Transfer'}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {payout.accountDetails ? JSON.stringify(payout.accountDetails) : 'On File'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text-muted font-mono text-[11px]">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold ${getStatusBadge(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {payout.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setActionModal({ payout, status: 'APPROVED' })
                            }
                            className="px-3 py-1 rounded-full bg-green/10 hover:bg-green/20 text-green border border-green/20 text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ payout, status: 'REJECTED' })
                            }
                            className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                      {payout.status === 'APPROVED' && (
                        <button
                          onClick={() => setActionModal({ payout, status: 'PAID' })}
                          className="px-3 py-1 rounded-full bg-blue/10 hover:bg-blue/20 text-blue border border-blue/20 text-[11px] font-semibold transition"
                        >
                          Mark as Disbursed / Paid
                        </button>
                      )}
                      {(payout.status === 'PAID' || payout.status === 'REJECTED') && (
                        <span className="text-text-muted text-[11px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={Boolean(actionModal)}
        onClose={() => {
          setActionModal(null);
          setNotes('');
        }}
        maxWidth="md"
        title={
          actionModal ? (
            <span className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue" />
              {actionModal.status === 'APPROVED' && 'Approve Payout Request'}
              {actionModal.status === 'REJECTED' && 'Reject Payout Request'}
              {actionModal.status === 'PAID' && 'Confirm Disbursement Complete'}
            </span>
          ) : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setActionModal(null);
                setNotes('');
              }}
              className="px-4 py-2 bg-surface-tint hover:bg-border/60 text-text-body border border-border rounded-full text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessPayout}
              disabled={processingId !== null}
              className="px-4 py-2 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-semibold disabled:opacity-50 transition shadow-sm"
            >
              {processingId ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        }
      >
        {actionModal && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Disbursement of <strong className="text-navy">${actionModal.payout.amount}</strong> to{' '}
              <strong className="text-navy">
                {actionModal.payout.tutor?.user?.name || 'Tutor'}
              </strong>
              .
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-text-heading mb-1">
                Administrative Notes / Transaction Reference
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bank IMPS reference TXN-948291..."
                rows={3}
                className="w-full bg-white border border-border rounded-xl p-3 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
