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
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-blue" />
            Tutor Payout Approvals Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review tutor withdrawal requests, verify course revenue balances, and approve or reject disbursements.
          </p>
        </div>
        <button
          onClick={fetchPayouts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-750 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === st
                ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {st === '' ? 'All Requests' : st}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-800/40" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Payout Requests</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No tutor disbursement requests matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tutor Details</th>
                  <th className="py-3.5 px-4">Requested Amount</th>
                  <th className="py-3.5 px-4">Disbursement Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">
                        {payout.tutor?.user?.name || payout.tutor?.headline || 'Tutor'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {payout.tutor?.user?.email || `Tutor ID: ${payout.tutorId}`}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        ${payout.amount.toLocaleString()} {payout.currency || 'USD'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-200">
                        {payout.method || 'Bank Transfer'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {payout.accountDetails ? JSON.stringify(payout.accountDetails) : 'On File'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold ${getStatusBadge(
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
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ payout, status: 'REJECTED' })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                      {payout.status === 'APPROVED' && (
                        <button
                          onClick={() => setActionModal({ payout, status: 'PAID' })}
                          className="px-2.5 py-1 rounded-lg bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 text-[11px] font-semibold"
                        >
                          Mark as Disbursed / Paid
                        </button>
                      )}
                      {(payout.status === 'PAID' || payout.status === 'REJECTED') && (
                        <span className="text-slate-500 text-[11px]">Settled</span>
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
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-blue" />
              {actionModal.status === 'APPROVED' && 'Approve Payout Request'}
              {actionModal.status === 'REJECTED' && 'Reject Payout Request'}
              {actionModal.status === 'PAID' && 'Confirm Disbursement Complete'}
            </h3>
            <p className="text-xs text-slate-400">
              Disbursement of <strong className="text-white">${actionModal.payout.amount}</strong> to{' '}
              <strong className="text-white">
                {actionModal.payout.tutor?.user?.name || 'Tutor'}
              </strong>
              .
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Administrative Notes / Transaction Reference
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bank IMPS reference TXN-948291..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setNotes('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayout}
                disabled={processingId !== null}
                className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {processingId ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
