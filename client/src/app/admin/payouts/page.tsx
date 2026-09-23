'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  Send,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionStatus, setActionStatus] = useState<'paid' | 'rejected'>('paid');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPayouts = async () => {
    try {
      const data = await api.getAdminPayouts();
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleUpdateStatus = async (id: string) => {
    try {
      const res = await api.updatePayoutStatus(id, actionStatus, adminNote);
      if (res.success) {
        setFeedback({ type: 'success', text: `Payout request marked as ${actionStatus.toUpperCase()}` });
        setProcessingId(null);
        setAdminNote('');
        loadPayouts();
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to update payout.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error processing request.' });
    }
  };

  const totalPending = payouts
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPaid = payouts
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-text-primary">
          Tutor Payout & Disbursement Desk
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review, approve, and authorize withdrawal requests for verified academy instructors and course authors.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-text-secondary uppercase">Pending Disbursements</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">${totalPending} USD</div>
          <span className="text-[11px] text-text-secondary">
            {payouts.filter((p) => p.status === 'pending').length} requests awaiting payment
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-text-secondary uppercase">Total Settled</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">${totalPaid} USD</div>
          <span className="text-[11px] text-text-secondary">Disbursed to instructors</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-text-secondary uppercase">All Requests</span>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">{payouts.length}</div>
          <span className="text-[11px] text-text-secondary">Total lifetime withdrawal records</span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Payout Request Queue
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-secondary text-sm">
            Loading payout requests...
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-text-secondary text-xs">
            No withdrawal requests pending in the queue.
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {payouts.map((pay) => (
              <div key={pay._id} className="p-4 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-text-primary font-mono">
                        ${pay.amount} USD
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-text-secondary border border-slate-200 font-mono uppercase">
                        {pay.paymentMethod}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Instructor: <strong className="text-text-primary">{pay.tutor?.name || pay.tutor?.email || 'Academy Tutor'}</strong> • Account/Wallet: <span className="font-mono text-slate-700">{pay.accountDetails}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                        pay.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pay.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {pay.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {pay.status === 'pending' && <Clock className="w-3 h-3" />}
                      {pay.status.toUpperCase()}
                    </span>

                    <span className="text-[11px] text-text-secondary">
                      {new Date(pay.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {pay.adminNote && (
                  <div className="text-xs text-text-secondary bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <strong>Admin Note:</strong> {pay.adminNote}
                  </div>
                )}

                {/* Settlement Controls */}
                {processingId === pay._id ? (
                  <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 space-y-2">
                    <div className="text-xs font-bold text-text-primary">
                      Authorize Settlement / Rejection
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-text-secondary mb-1">
                          Settlement Action
                        </label>
                        <select
                          value={actionStatus}
                          onChange={(e: any) => setActionStatus(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs"
                        >
                          <option value="paid">Mark Settled & Paid</option>
                          <option value="rejected">Reject Request</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-text-secondary mb-1">
                          Transfer Reference / Hash / Reason
                        </label>
                        <input
                          type="text"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="e.g. TXID: 99a1b2c3d4e5f6... or Bank Wire Ref #88392"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setProcessingId(null)}
                        className="px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(pay._id)}
                        className="px-4 py-1 rounded-md bg-navy-deepest text-white text-xs font-bold"
                      >
                        Submit Decision
                      </button>
                    </div>
                  </div>
                ) : (
                  pay.status === 'pending' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setProcessingId(pay._id);
                          setActionStatus('paid');
                          setAdminNote('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-navy-deepest text-gold-primary hover:bg-navy-surface text-xs font-bold transition-colors cursor-pointer"
                      >
                        Process Settlement
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
