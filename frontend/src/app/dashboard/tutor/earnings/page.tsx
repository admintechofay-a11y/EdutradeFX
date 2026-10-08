'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  BookOpen,
  ArrowRight,
  Download,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function TutorEarningsPage() {
  const [earnings, setEarnings] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/lms/earnings');
        if (res.data?.success && res.data?.data) {
          setEarnings(res.data.data);
          setTransactions(res.data.data?.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load earnings', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalGross = earnings?.totalGross || earnings?.totalEarnings ? (earnings.totalEarnings / 0.8) : 0;
  const platformFee = totalGross * 0.2;
  const netEarnings = earnings?.totalEarnings || 0;
  const availableBalance = earnings?.availableBalance || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green" />
            Instructor Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time accounting of student enrollments, institutional commissions, and net earnings.
          </p>
        </div>

        <Link
          href="/dashboard/tutor/payouts"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <span>Request Payout</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Financial Split Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Gross Sales</span>
            <DollarSign className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-black text-navy font-mono">
            {loading ? <Skeleton className="h-8 w-20" /> : `$${Math.round(totalGross).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Total student course volume</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Net Tutor Share (80%)</span>
            <TrendingUp className="w-4 h-4 text-green" />
          </div>
          <div className="text-2xl font-black text-green font-mono">
            {loading ? <Skeleton className="h-8 w-20" /> : `$${Math.round(netEarnings).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Your 80% instructor revenue</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Platform Commission (20%)</span>
            <Percent className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-black text-text-body font-mono">
            {loading ? <Skeleton className="h-8 w-20" /> : `$${Math.round(platformFee).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Hosting, video CDN & payment fees</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Withdrawable Balance</span>
            <DollarSign className="w-4 h-4 text-orange" />
          </div>
          <div className="text-2xl font-black text-orange font-mono">
            {loading ? <Skeleton className="h-8 w-20" /> : `$${Math.round(availableBalance).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Min threshold: $500</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-soft space-y-4">
        <h2 className="text-sm font-bold text-navy flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue" />
          Enrollment Sales Ledger
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-2" />
            <div className="text-xs font-bold text-navy">No Sales Recorded Yet</div>
            <p className="text-[11px] text-text-muted mt-1 max-w-sm mx-auto">
              Enrollments will register in your sales ledger as students purchase your courses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-body">
              <thead className="border-b border-border bg-surface-tint/60 text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Gross Price</th>
                  <th className="py-3 px-4">Your Share (80%)</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {transactions.map((tx: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-tint/40 transition">
                    <td className="py-3.5 px-4 font-sans font-semibold text-text-heading">
                      {tx.studentName || 'Trader'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-text-body">{tx.courseTitle}</td>
                    <td className="py-3.5 px-4 text-text-muted">${tx.amount}</td>
                    <td className="py-3.5 px-4 text-green font-bold">
                      +${(tx.amount * 0.8).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-muted">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
