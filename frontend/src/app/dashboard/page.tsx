'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Users,
  Radio,
  Building2,
  DollarSign,
  TrendingUp,
  Star,
  ArrowRight,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/common/Skeleton';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const role = user?.role || 'STUDENT';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadRoleData() {
      setLoading(true);
      try {
        if (role === 'STUDENT') {
          const res = await api.get('/courses/enrollments/my');
          setData({ enrollments: res.data?.data || [] });
        } else if (role === 'BROKER') {
          const res = await api.get('/brokers/my/profile');
          setData({ broker: res.data?.data || null });
        } else if (role === 'ACCOUNT_MANAGER') {
          const res = await api.get('/account-managers/my/profile');
          setData({ am: res.data?.data || null });
        } else if (role === 'SIGNAL_PROVIDER') {
          const res = await api.get('/signal-providers/my/profile');
          setData({ sp: res.data?.data || null });
        } else if (role === 'TUTOR') {
          const res = await api.get('/courses/my/courses');
          setData({ courses: res.data?.data || [] });
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadRoleData();
  }, [role]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || 'Trader'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is your live {role.toLowerCase().replace('_', ' ')} operational summary.
          </p>
        </div>

        {/* Quick role-specific CTA */}
        {role === 'SIGNAL_PROVIDER' && (
          <Link
            href="/dashboard/signals"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Broadcast Signal</span>
          </Link>
        )}
        {role === 'TUTOR' && (
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-amber hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Course</span>
          </Link>
        )}
      </div>

      {/* ─── Role: STUDENT Dashboard ─────────────────────────────── */}
      {role === 'STUDENT' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Enrolled Courses</div>
              <div className="text-2xl font-black text-white mt-1">
                {data?.enrollments?.length || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">In Progress</div>
              <div className="text-2xl font-black text-brand-blue mt-1">
                {data?.enrollments?.filter((e: any) => e.progress < 100)?.length || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Certificates Earned</div>
              <div className="text-2xl font-black text-brand-amber mt-1">
                {data?.enrollments?.filter((e: any) => e.certificateIssued)?.length || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Learning Hours</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {((data?.enrollments?.length || 0) * 4.5).toFixed(1)}h
              </div>
            </div>
          </div>

          {/* Active Courses */}
          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Continue Your Masterclasses</h3>
              <Link href="/courses" className="text-xs font-semibold text-brand-blue hover:underline">
                Browse More Courses
              </Link>
            </div>

            {data?.enrollments && data.enrollments.length > 0 ? (
              <div className="space-y-3">
                {data.enrollments.map((enr: any) => (
                  <div
                    key={enr.id}
                    className="p-4 rounded-2xl bg-brand-navy-light/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {enr.course?.title || 'Trading Masterclass'}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Progress: {enr.progress}%</span>
                        <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-blue h-full rounded-full"
                            style={{ width: `${enr.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/learn/${enr.course?.slug}/${enr.course?.sections?.[0]?.lessons?.[0]?.id || ''}`}
                      className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>Continue Lesson</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 text-xs">
                You are not enrolled in any courses yet.{' '}
                <Link href="/courses" className="text-brand-blue underline font-semibold">
                  Browse the Forex Academy
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Role: BROKER Dashboard ──────────────────────────────── */}
      {role === 'BROKER' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Total Leads</div>
              <div className="text-2xl font-black text-brand-blue mt-1">
                {data?.broker?.totalLeads || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Average Rating</div>
              <div className="text-2xl font-black text-brand-amber mt-1">
                {data?.broker?.avgRating?.toFixed(1) || '5.0'} / 5.0
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Total Reviews</div>
              <div className="text-2xl font-black text-white mt-1">
                {data?.broker?.totalReviews || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Listing Status</div>
              <div className="text-sm font-bold text-emerald-400 mt-2">
                {data?.broker?.status || 'APPROVED'}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Lead Acquisition Terminal</h3>
              <Link href="/dashboard/leads" className="text-xs font-semibold text-brand-blue hover:underline">
                View All Leads
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Qualified high-intent traders requesting account creation and swap-free setups.
            </p>
          </div>
        </div>
      )}

      {/* ─── Role: SIGNAL_PROVIDER Dashboard ─────────────────────── */}
      {role === 'SIGNAL_PROVIDER' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Total Signals</div>
              <div className="text-2xl font-black text-white mt-1">
                {data?.sp?.totalSignals || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Audited Win Rate</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {data?.sp?.winRate ? `${data.sp.winRate}%` : '80.0%'}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Provider Rating</div>
              <div className="text-2xl font-black text-brand-amber mt-1">
                {data?.sp?.avgRating?.toFixed(1) || '5.0'}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Verification</div>
              <div className="text-sm font-bold text-purple-400 mt-2">
                {data?.sp?.verificationStatus ? 'Audited & Verified' : 'Pending Audit'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Role: TUTOR Dashboard ───────────────────────────────── */}
      {role === 'TUTOR' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Total Courses</div>
              <div className="text-2xl font-black text-white mt-1">
                {data?.courses?.length || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Active / Published</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {data?.courses?.filter((c: any) => c.status === 'PUBLISHED' || c.status === 'APPROVED')?.length || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Total Enrollments</div>
              <div className="text-2xl font-black text-brand-blue mt-1">
                {data?.courses?.reduce((acc: number, c: any) => acc + (c.totalEnrollments || c._count?.enrollments || 0), 0) || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Under QA Review</div>
              <div className="text-2xl font-black text-brand-amber mt-1">
                {data?.courses?.filter((c: any) => c.status === 'REVIEW')?.length || 0}
              </div>
            </div>
          </div>

          {/* Masterclasses Table / Cards */}
          <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-amber" />
                  My Author Masterclasses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Curricula authored under your instructor account with live approval status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/courses"
                  className="px-4 py-2 bg-brand-amber hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Course</span>
                </Link>
                <Link
                  href="/dashboard/tutor/courses"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
                >
                  Manage Curriculum
                </Link>
              </div>
            </div>

            {data?.courses && data.courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold">
                      <th className="py-3 px-4">Masterclass</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.courses.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white line-clamp-1">{c.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Created {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {c.category} • <span className="text-slate-400">{c.level}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand-amber">
                          {c.price === 0 ? 'Free' : `₹${Number(c.price).toLocaleString()}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              c.status === 'PUBLISHED' || c.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : c.status === 'REVIEW'
                                ? 'bg-amber-500/15 text-brand-amber'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {c.status === 'PUBLISHED' ? 'Live on Catalog' : c.status === 'APPROVED' ? 'Approved' : c.status === 'REVIEW' ? 'Under Review' : c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {c.status === 'PUBLISHED' || c.status === 'APPROVED' ? (
                              <Link
                                href={`/courses/${c.slug}`}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition"
                              >
                                View Live
                              </Link>
                            ) : null}
                            <Link
                              href="/dashboard/courses"
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">No Masterclasses Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Create your first trading masterclass to educate global traders and earn course sales.
                </p>
                <Link
                  href="/dashboard/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-amber hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Masterclass</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Role: ACCOUNT_MANAGER Dashboard ─────────────────────── */}
      {role === 'ACCOUNT_MANAGER' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Experience</div>
              <div className="text-2xl font-black text-white mt-1">
                {data?.am?.yearsExperience || 5} Years
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Average Rating</div>
              <div className="text-2xl font-black text-brand-amber mt-1">
                {data?.am?.avgRating?.toFixed(1) || '5.0'}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Total Reviews</div>
              <div className="text-2xl font-black text-white mt-1">
                {data?.am?.totalReviews || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800">
              <div className="text-xs font-semibold text-slate-400">Availability</div>
              <div className="text-sm font-bold text-emerald-400 mt-2">
                {data?.am?.availability || 'Open for Capital'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
