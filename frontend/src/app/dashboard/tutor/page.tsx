'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

export default function TutorOverviewPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, earningsRes] = await Promise.allSettled([
          api.get('/courses/my/courses'),
          api.get('/lms/earnings'),
        ]);

        if (coursesRes.status === 'fulfilled') {
          setCourses(coursesRes.value.data?.data || []);
        }
        if (earningsRes.status === 'fulfilled') {
          setEarnings(earningsRes.value.data?.data || null);
        }
      } catch (err) {
        console.error('Failed to load tutor overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEnrollments = courses.reduce((acc, c) => acc + (c.totalEnrollments || 0), 0);
  const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-blue" />
            Instructor Studio & Revenue Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Author forex video curricula, track enrolled students, and inspect net sales payouts.
          </p>
        </div>

        <Link
          href="/dashboard/tutor/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Course Studio</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Enrolled Students</span>
            <Users className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {loading ? <Skeleton className="h-8 w-16" /> : totalEnrollments}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all published courses</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Net Tutor Earnings (80%)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `$${(earnings?.totalEarnings || 0).toLocaleString()}`
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">After 20% platform commission</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Withdrawable Balance</span>
            <TrendingUp className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="text-2xl font-black text-brand-amber font-mono">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `$${(earnings?.availableBalance || 0).toLocaleString()}`
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Available for payout request</p>
        </div>

        <div className="bg-brand-navy-card border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Courses</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : `${publishedCourses.length} / ${courses.length}`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live in marketplace</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/tutor/courses"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-brand-blue/50 transition group shadow-xl"
        >
          <BookOpen className="w-8 h-8 text-brand-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Manage Courses & Modules</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Create video lessons, write curriculum summaries, configure pricing, and submit for QA approval.
          </p>
        </Link>

        <Link
          href="/dashboard/tutor/earnings"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-emerald-500/50 transition group shadow-xl"
        >
          <DollarSign className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Sales & Revenue Analytics</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Inspect individual student orders, platform commission breakdowns, and historical earnings.
          </p>
        </Link>

        <Link
          href="/dashboard/tutor/payouts"
          className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-brand-amber/50 transition group shadow-xl"
        >
          <TrendingUp className="w-8 h-8 text-brand-amber mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
            <span>Disbursement & Payouts</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-amber transition" />
          </h3>
          <p className="text-xs text-slate-400">
            Request revenue withdrawals to your bank or UPI, and track administrative disbursement progress.
          </p>
        </Link>
      </div>
    </div>
  );
}
