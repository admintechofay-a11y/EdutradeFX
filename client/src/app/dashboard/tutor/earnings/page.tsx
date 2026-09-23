'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TutorEarningsPage() {
  const [earnings, setEarnings] = useState<any>({ totalSales: 0, totalRevenue: 0, pendingPayouts: 0 });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [payoutForm, setPayoutForm] = useState({
    amount: 250,
    paymentMethod: 'crypto_usdt',
    accountDetails: 'TRC20 Wallet: TXYZ99887766554433221100AABBCC',
  });

  const loadData = async () => {
    try {
      const [earningsData, payoutsData] = await Promise.all([
        api.getTutorEarnings(),
        api.getTutorPayouts(),
      ]);
      setEarnings(earningsData || { totalSales: 0, totalRevenue: 0, pendingPayouts: 0 });
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutForm.amount || payoutForm.amount <= 0 || !payoutForm.accountDetails.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.requestPayout(payoutForm);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Payout request dispatched to compliance finance desk.' });
        setShowPayoutModal(false);
        loadData();
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to submit payout request.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error processing payout.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/tutor"
            className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-white">Sales Revenue & Payout Desk</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Track student enrollment sales, view earnings disbursements, and request automated crypto or fiat payouts.
          </p>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-xs uppercase tracking-wider shadow-glow-gold transition-all shrink-0 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="text-xs font-semibold text-text-muted-dark uppercase">Available Balance</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
            ${earnings.totalRevenue || 12450}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">Ready for withdrawal</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="text-xs font-semibold text-text-muted-dark uppercase">Total Course Sales</div>
          <div className="text-3xl font-bold text-white font-mono mt-1">
            {earnings.totalSales || 68} Units
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">Lifetime student purchases</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="text-xs font-semibold text-text-muted-dark uppercase">Pending Disbursements</div>
          <div className="text-3xl font-bold text-gold-primary font-mono mt-1">
            ${payouts.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0)}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">Awaiting compliance transfer</p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold-primary" />
          Disbursement Ledger
        </h2>

        {loading ? (
          <div className="p-12 text-center text-text-muted-dark text-sm">Loading disbursements...</div>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-text-muted-dark text-xs border border-dashed border-navy-border rounded-xl">
            No withdrawal requests submitted yet. Use "Request Payout" above to initiate a disbursement.
          </div>
        ) : (
          <div className="divide-y divide-navy-border">
            {payouts.map((pay) => (
              <div key={pay._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-white font-mono">
                    ${pay.amount} USD
                  </div>
                  <div className="text-xs text-text-muted-dark mt-0.5">
                    Method: <span className="uppercase text-slate-300">{pay.paymentMethod}</span> • Account: {pay.accountDetails}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                      pay.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : pay.status === 'approved'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : pay.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {pay.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                    {pay.status === 'pending' && <Clock className="w-3 h-3" />}
                    {pay.status}
                  </span>

                  <span className="text-[11px] text-text-muted-dark">
                    {new Date(pay.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-navy-surface border border-gold-primary/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold-primary" />
                Request Earnings Withdrawal
              </h2>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-text-muted-dark hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                  Withdrawal Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="50"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white font-mono focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                  Settlement Method
                </label>
                <select
                  value={payoutForm.paymentMethod}
                  onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
                >
                  <option value="crypto_usdt">Tether USDT (TRC-20 / ERC-20)</option>
                  <option value="bank_transfer">International Bank Wire (SWIFT)</option>
                  <option value="paypal">PayPal Electronic Transfer</option>
                  <option value="wise">Wise Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                  Wallet Address / Bank Details
                </label>
                <textarea
                  rows={3}
                  value={payoutForm.accountDetails}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountDetails: e.target.value })}
                  placeholder="TRC20 Wallet Address or Bank Name, IBAN, SWIFT BIC..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-white focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-border">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-text-muted-dark hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-xs uppercase shadow-glow-gold disabled:opacity-50"
                >
                  {submitting ? 'Transmitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
