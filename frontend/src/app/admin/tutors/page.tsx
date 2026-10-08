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
          <h1 className="text-2xl sm:text-3xl font-black text-navy">Academy Instructor Governance</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review tutor verification credentials, approve course instructor applications, and audit instructor performance.
          </p>
        </div>
        <div className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white border border-border text-text-body shadow-sm">
          Total Instructors: <span className="text-navy font-bold font-mono">{tutors.length}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-3xl bg-white border border-border shadow-soft">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instructor by name, email, or credentials..."
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
            <option value="REJECTED">Suspended / Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full min-w-[650px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Instructor Profile</th>
                <th className="p-4">Expertise & Bio</th>
                <th className="p-4">Enrollment Sales</th>
                <th className="p-4">Lifetime Earnings</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-tint/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-navy">{t.user?.name || 'Instructor'}</div>
                      <div className="text-text-muted text-xs">{t.user?.email}</div>
                      <div className={`text-[11px] font-mono mt-0.5 ${t.status === 'APPROVED' ? 'text-blue font-semibold' : 'text-text-muted'}`}>
                        {t.status === 'APPROVED' ? 'Verified Badge Active' : 'Unverified'}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-text-heading font-medium truncate">{(t.expertise && t.expertise.join(', ')) || 'Forex Trading'}</div>
                      <div className="text-xs text-text-muted line-clamp-1">{t.bio || 'No bio provided'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-text-body">
                        <BookOpen className="w-3.5 h-3.5 text-orange" />
                        <span>{t.totalSales || 0} Sales</span>
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        Rating: {t.avgRating ? `${t.avgRating.toFixed(1)} / 5.0` : 'New'}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-green">
                      ₹{(t.totalEarned || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          t.status === 'APPROVED'
                            ? 'bg-green/10 text-green border border-green/20'
                            : t.status === 'PENDING'
                            ? 'bg-orange/10 text-orange border border-orange/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
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
                            className="p-1.5 rounded-full bg-green/10 border border-green/20 text-green hover:bg-green/20 transition"
                            title="Approve Instructor"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {t.status !== 'REJECTED' && (
                          <button
                            onClick={() => updateStatus(t.id, 'REJECTED')}
                            className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition"
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
                  <td colSpan={6} className="p-8 text-center text-text-muted text-xs">
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
