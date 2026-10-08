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
          <h1 className="text-2xl font-black text-navy flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue" />
            Instructor Studio & Revenue Hub
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Author forex video curricula, track enrolled students, and inspect net sales payouts.
          </p>
        </div>

        <Link
          href="/dashboard/tutor/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Course Studio</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Total Enrolled Students</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="text-2xl font-black text-navy font-mono">
            {loading ? <Skeleton className="h-8 w-16" /> : totalEnrollments}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Across all published courses</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Net Tutor Earnings (80%)</span>
            <DollarSign className="w-4 h-4 text-green" />
          </div>
          <div className="text-2xl font-black text-green font-mono">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `$${(earnings?.totalEarnings || 0).toLocaleString()}`
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-1">After 20% platform commission</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Withdrawable Balance</span>
            <TrendingUp className="w-4 h-4 text-orange" />
          </div>
          <div className="text-2xl font-black text-orange font-mono">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              `$${(earnings?.availableBalance || 0).toLocaleString()}`
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Available for payout request</p>
        </div>

        <div className="bg-white border border-border p-5 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between text-text-muted text-xs mb-2">
            <span>Active Courses</span>
            <BookOpen className="w-4 h-4 text-navy" />
          </div>
          <div className="text-2xl font-black text-navy font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : `${publishedCourses.length} / ${courses.length}`}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Live in marketplace</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/tutor/courses"
          className="p-6 rounded-3xl bg-white border border-border hover:border-blue/50 transition group shadow-soft hover:shadow-card"
        >
          <BookOpen className="w-8 h-8 text-blue mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Manage Courses & Modules</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-blue transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Create video lessons, write curriculum summaries, configure pricing, and submit for QA approval.
          </p>
        </Link>

        <Link
          href="/dashboard/tutor/earnings"
          className="p-6 rounded-3xl bg-white border border-border hover:border-green/50 transition group shadow-soft hover:shadow-card"
        >
          <DollarSign className="w-8 h-8 text-green mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Sales & Revenue Analytics</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-green transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Inspect individual student orders, platform commission breakdowns, and historical earnings.
          </p>
        </Link>

        <Link
          href="/dashboard/tutor/payouts"
          className="p-6 rounded-3xl bg-white border border-border hover:border-orange/50 transition group shadow-soft hover:shadow-card"
        >
          <TrendingUp className="w-8 h-8 text-orange mb-3 group-hover:scale-110 transition" />
          <h3 className="text-sm font-bold text-text-heading mb-1 flex items-center justify-between">
            <span>Disbursement & Payouts</span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-orange transition" />
          </h3>
          <p className="text-xs text-text-muted">
            Request revenue withdrawals to your bank or UPI, and track administrative disbursement progress.
          </p>
        </Link>
      </div>

      {/* Live Courses Section */}
      <div className="p-6 rounded-3xl bg-white border border-border space-y-4 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue" />
              Masterclass Curriculum Portfolio
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Live status and enrollment engagement across your published trading curricula.
            </p>
          </div>

          <Link
            href="/dashboard/tutor/courses"
            className="px-5 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage All Courses</span>
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => (
              <div
                key={course.id}
                className="p-4 rounded-2xl bg-surface-tint/60 border border-border flex flex-col justify-between hover:border-blue/30 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-navy border border-border">
                      {course.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        course.status === 'PUBLISHED' || course.status === 'APPROVED'
                          ? 'bg-green/10 text-green border border-green/20'
                          : course.status === 'REVIEW'
                          ? 'bg-orange/10 text-orange border border-orange/20'
                          : 'bg-surface-tint text-text-muted border border-border'
                      }`}
                    >
                      {course.status === 'PUBLISHED' ? 'Live' : course.status === 'APPROVED' ? 'Approved' : course.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-heading mb-1.5 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-text-muted line-clamp-2 mb-3">
                    {course.shortDescription || course.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-extrabold text-navy font-mono">
                    {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {course.status === 'PUBLISHED' || course.status === 'APPROVED' ? (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-blue hover:underline font-semibold text-xs"
                      >
                        Public Page →
                      </Link>
                    ) : null}
                    <Link
                      href="/dashboard/tutor/courses"
                      className="px-3 py-1 bg-white hover:bg-surface-tint text-navy rounded-full text-[11px] font-medium border border-border transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-text-muted">
            No courses authored yet. Click "Manage All Courses" to create your first trading masterclass.
          </div>
        )}
      </div>
    </div>
  );
}
