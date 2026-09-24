'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Check, X, ShieldCheck, DollarSign, BookOpen } from 'lucide-react';
import { api } from '../../../lib/api';
import type { Tutor, ApprovalStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tutors');
      setTutors(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load instructors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const updateStatus = async (id: string, status: ApprovalStatus) => {
    try {
      await api.patch(`/admin/tutors/${id}/status`, { status });
      setTutors(tutors.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const filtered = tutors.filter((t) => {
    const matchesSearch =
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.bio?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Academy Instructor Governance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review tutor verification credentials, approve course instructor applications, and audit instructor performance.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Total Instructors: <span className="text-white font-mono">{tutors.length}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instructor by name, email, or credentials..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Suspended / Rejected</option>
          </select>
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
                <th className="p-4">Instructor Profile</th>
                <th className="p-4">Expertise & Bio</th>
                <th className="p-4">Enrollment Sales</th>
                <th className="p-4">Lifetime Earnings</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-bold text-white">{t.user?.name || 'Instructor'}</div>
                      <div className="text-slate-500 text-xs">{t.user?.email}</div>
                      <div className="text-[11px] text-brand-blue font-mono mt-0.5">
                        {t.status === 'APPROVED' ? 'Verified Badge Active' : 'Unverified'}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-slate-200 font-medium truncate">{(t.expertise && t.expertise.join(', ')) || 'Forex Trading'}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{t.bio || 'No bio provided'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-brand-amber" />
                        <span>{t.totalSales || 0} Sales</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Rating: {t.avgRating ? `${t.avgRating.toFixed(1)} / 5.0` : 'New'}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      ₹{(t.totalEarned || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          t.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status !== 'APPROVED' && (
                          <button
                            onClick={() => updateStatus(t.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
                            title="Approve Instructor"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {t.status !== 'REJECTED' && (
                          <button
                            onClick={() => updateStatus(t.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition"
                            title="Suspend Instructor"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No tutors found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
