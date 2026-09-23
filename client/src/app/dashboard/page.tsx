'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Scale,
  ShieldAlert,
  Clock,
  ArrowRight,
  Plus,
  PlayCircle,
  CheckCircle2,
  Star,
  MessageSquare,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_COURSES, MOCK_BROKERS, MOCK_COMPLAINTS } from '@/lib/mockData';
import LegalNoticeBlock from '@/components/shared/LegalNoticeBlock';
import RoleGuard from '@/components/shared/RoleGuard';

export default function UserDashboardPage() {
  const { user, isAuthenticated } = useAuth();

  const enrolledCourses: any[] = [];
  const myReviews: any[] = [];
  const myComplaints: any[] = [];

  return (
    <RoleGuard allowedRoles={['user', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
            alt={user?.name || 'Trader'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50 shrink-0"
          />

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || 'Michael Vance'}
              </h1>
              <span className="badge-gold text-xs uppercase">{user?.role || 'Trader'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email || 'trader@edutradefx.com'}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Community Member</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/complaint-box"
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> File New Dispute
          </Link>
          <Link
            href="/brokers"
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-brand-darkest hover:bg-amber-400 transition-all shadow-glow-gold flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" /> Compare Brokers
          </Link>
        </div>
      </div>

      {/* 1. Enrolled Courses Section */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              Enrolled Courses & Academic Progress
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Resume your structured lessons and continue earning certificates
            </p>
          </div>
          <Link
            href="/education"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Browse All Courses →
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((enr) => (
              <div
                key={enr.enrollmentId}
                className="rounded-2xl border border-slate-800 bg-brand-surface/50 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-green text-[10px]">{enr.course.level}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {enr.progress}% Completed
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{enr.course.title}</h3>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${enr.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{enr.completedLessons} of {enr.totalLessons} lessons completed</span>
                    <span className="text-amber-400/90 font-medium">Next: {enr.lastLessonTitle}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{enr.course.durationHours} hrs total</span>
                  </div>

                  <Link
                    href={`/dashboard/courses/${enr.enrollmentId}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-brand-darkest transition-all flex items-center gap-1.5 shadow-glow-gold"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-brand-surface/50 p-10 text-center space-y-4">
            <p className="font-sans text-[14px] text-slate-300">
              You haven&apos;t enrolled in any courses yet. Browse our Forex education library.
            </p>
            <Link href="/education">
              <button
                type="button"
                className="min-h-[44px] px-6 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[14px] font-bold transition-colors"
              >
                Browse Courses
              </button>
            </Link>
          </div>
        )}

        <LegalNoticeBlock title="Educational Content & Risk Notice" className="mt-4">
          Course materials, lessons, and quizzes are provided exclusively for educational and informational purposes. EduTradeFX does not provide investment advice or guarantee trading performance.
        </LegalNoticeBlock>
      </div>

      {/* Grid: 2. My Submitted Reviews & 3. My Complaints with Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. My Submitted Reviews */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                My Submitted Reviews
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Reviews submitted on brokers and providers</p>
            </div>
          </div>

          <div className="space-y-4">
            {myReviews.map((rev) => (
              <div
                key={rev._id}
                className="rounded-2xl border border-slate-800 bg-brand-surface/40 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={rev.targetLink}
                      className="text-xs font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      {rev.targetName}
                    </Link>
                    <span className="badge-regulation text-[10px]">{rev.targetType}</span>
                  </div>
                  <span className="badge-green text-[10px]">{rev.status}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-200 ml-1.5">{rev.title}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-500 block pt-1">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. My Complaints with Status */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                My Disputes & Complaints
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tracking status with mediation desk</p>
            </div>
            <Link
              href="/complaint-box"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              + File Dispute
            </Link>
          </div>

          <div className="space-y-4">
            {myComplaints.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-slate-800 bg-brand-surface/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{c.caseId}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      c.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : c.status === 'scam_warning'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {c.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{c.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Against: <strong className="text-slate-200">{c.brokerName}</strong> | Amount: ${c.disputeAmount.toLocaleString()}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Filed on {c.createdAt}</span>
                  <Link
                    href={`/complaints/${c.caseId}`}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    View Timeline →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </RoleGuard>
);
}
