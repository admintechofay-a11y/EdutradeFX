'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  BookOpen,
  MessageSquare,
  DollarSign,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/common/Skeleton';

export default function AdminCommandCenterPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingBrokers, setPendingBrokers] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, brokersRes, coursesRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/brokers/pending'),
        api.get('/admin/courses/pending'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || null);
      }
      if (brokersRes.status === 'fulfilled') {
        setPendingBrokers(brokersRes.value.data?.data || []);
      }
      if (coursesRes.status === 'fulfilled') {
        setPendingCourses(coursesRes.value.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveBroker = async (id: string) => {
    try {
      await api.patch(`/admin/brokers/${id}/status`, { status: 'APPROVED' });
      setPendingBrokers(pendingBrokers.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectBroker = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/admin/brokers/${id}/status`, { status: 'REJECTED', reason });
      setPendingBrokers(pendingBrokers.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleApproveCourse = async (id: string) => {
    try {
      await api.patch(`/admin/courses/${id}/status`, { status: 'PUBLISHED' });
      setPendingCourses(pendingCourses.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Command Center</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time platform metrics, regulatory compliance queue, and content verification.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Traders</span>
            <Users className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalUsers ?? 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Verified Brokers</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalBrokers ?? 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Academy Courses</span>
            <BookOpen className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalCourses ?? 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Platform Disputes</span>
            <MessageSquare className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats?.openComplaints ?? 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Pending Broker Verifications */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-blue" />
            <span>Brokers Awaiting Regulatory Audit ({pendingBrokers.length})</span>
          </h3>
          <Link href="/admin/brokers" className="text-xs font-semibold text-brand-blue hover:underline">
            Manage All
          </Link>
        </div>

        {pendingBrokers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="p-3">Company Name</th>
                  <th className="p-3">Regulations</th>
                  <th className="p-3">HQ / Founded</th>
                  <th className="p-3">Submitted By</th>
                  <th className="p-3 text-right">Audit Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {pendingBrokers.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-white">{b.companyName}</td>
                    <td className="p-3 text-emerald-400">
                      {b.regulation && b.regulation.length > 0 ? b.regulation.join(', ') : 'None'}
                    </td>
                    <td className="p-3 text-slate-400">
                      {b.headquarters || 'N/A'} (Est. {b.yearFounded || 'N/A'})
                    </td>
                    <td className="p-3 text-slate-300">{b.user?.email || 'Admin Direct'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleApproveBroker(b.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectBroker(b.id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4">No broker audit requests in queue.</p>
        )}
      </div>

      {/* Pending Course Reviews */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-amber" />
            <span>Academy Courses Submitted for Review ({pendingCourses.length})</span>
          </h3>
          <Link href="/admin/courses" className="text-xs font-semibold text-brand-amber hover:underline">
            Manage All
          </Link>
        </div>

        {pendingCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="p-3">Masterclass Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Instructor</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {pendingCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-white">{c.title}</td>
                    <td className="p-3 text-slate-400">{c.category}</td>
                    <td className="p-3 text-slate-300">{c.tutor?.user?.name || 'Tutor'}</td>
                    <td className="p-3 font-bold text-brand-amber">
                      {c.price === 0 ? 'Free' : `₹${c.price}`}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleApproveCourse(c.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                      >
                        Publish Course
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4">No course submissions pending review.</p>
        )}
      </div>
    </div>
  );
}
