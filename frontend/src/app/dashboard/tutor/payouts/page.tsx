'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Send,
  CreditCard,
  Check,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function TutorPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [earningsRes, payoutsRes] = await Promise.allSettled([
        api.get('/lms/earnings'),
        api.get('/lms/payouts'),
      ]);

      if (earningsRes.status === 'fulfilled') {
        setEarnings(earningsRes.value.data?.data || null);
      }
      if (payoutsRes.status === 'fulfilled') {
        setPayouts(payoutsRes.value.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load payouts data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    const available = earnings?.availableBalance || 0;

    if (numAmount < 500) {
      setErrorMsg('Minimum payout threshold is $500.');
      return;
    }

    if (numAmount > available) {
      setErrorMsg(`Requested amount exceeds available balance ($${available.toLocaleString()}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: numAmount,
        method,
        accountDetails: {
          bankName,
          accountNumber,
          routingNumber,
          beneficiaryName,
        },
      };

      const res = await api.post('/lms/payouts', payload);
      if (res.data?.success) {
        setSuccessMsg('Disbursement request submitted. Administrative processing takes 24-48 business hours.');
        setAmount('');
        loadData();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to submit payout request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-amber" />
          Disbursement Desk & Payout Requests
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Withdraw accumulated course revenue to your institutional bank account or designated remittance method.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Balance Banner & Request Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Available Balance</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              ${(earnings?.availableBalance || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Minimum disbursement: <strong className="text-slate-300">$500</strong>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Bank IMPS / SWIFT</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero disbursement fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit-logged compliance</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="md:col-span-2 bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-blue" />
            Submit Withdrawal Request
          </h2>

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Disbursement Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    required
                    min="500"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min 500"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payout Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-blue transition"
                >
                  <option value="BANK_TRANSFER">Direct Bank Wire / ACH</option>
                  <option value="UPI">UPI Remittance (India)</option>
                  <option value="CRYPTO_USDT">USDT (TRC20 / ERC20)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Official name on account"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Bank / Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase or HDFC"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account or IBAN string"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Routing / Swift / IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="SWIFT / Routing / IFSC"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Request Disbursement'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Disbursement Request History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-800/40" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
            <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-white">No Payout Requests on Record</div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Submitted disbursement requests and admin settlement receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-brand-navy-light/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] font-bold ${getStatusBadge(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Method: <strong className="text-white">{p.method || 'Wire'}</strong>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Submitted on {new Date(p.createdAt).toLocaleDateString()} • Ref: #{p.id.substring(0, 8)}
                  </div>
                  {p.notes && (
                    <div className="text-[11px] text-slate-300 mt-1 italic">
                      Admin Note: {p.notes}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-white font-mono">
                    ${p.amount.toLocaleString()} USD
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
