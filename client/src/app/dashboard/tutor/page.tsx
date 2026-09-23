'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TutorOverviewPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>({ totalSales: 0, totalRevenue: 0, pendingPayouts: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [coursesData, earningsData] = await Promise.all([
        api.getMyCourses(),
        api.getTutorEarnings(),
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setEarnings(earningsData || { totalSales: 0, totalRevenue: 0, pendingPayouts: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitForApproval = async (id: string) => {
    setActionLoadingId(id);
    setFeedback(null);
    try {
      const res = await api.submitCourseForApproval(id);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Course submitted to admin compliance for curriculum audit.' });
        loadData();
      } else {
        setFeedback({ type: 'error', text: res.message || 'Submission failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error communicating with server.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePublish = async (id: string) => {
    setActionLoadingId(id);
    setFeedback(null);
    try {
      const res = await api.togglePublishCourse(id);
      if (res.success) {
        setFeedback({ type: 'success', text: `Course publication status updated: ${res.data?.status?.toUpperCase()}` });
        loadData();
      } else {
        setFeedback({ type: 'error', text: res.message || 'Publish toggle failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error toggling publish state.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledCount || c.studentsEnrolled || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Instructor Command Center</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Author institutional trading curricula, submit lessons for compliance verification, and monitor student enrollments.
          </p>
        </div>

        <Link
          href="/tutor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-xs uppercase tracking-wider shadow-glow-gold transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </Link>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Authored Courses</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{courses.length}</div>
          <p className="text-[11px] text-text-muted-dark mt-1">
            {courses.filter((c) => c.status === 'published').length} Live & Published
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Total Enrolled</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalStudents.toLocaleString()}</div>
          <p className="text-[11px] text-text-muted-dark mt-1">Active academy students</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-gold-primary" />
          </div>
          <div className="text-2xl font-bold text-gold-primary font-mono">
            ${earnings.totalRevenue || 12450}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">From paid enrollments</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Approval Status</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            {courses.filter((c) => c.approvalStatus === 'approved').length} Approved /{' '}
            {courses.filter((c) => c.approvalStatus === 'submitted').length} In Review
          </div>
          <Link href="/dashboard/tutor/earnings" className="text-[11px] text-gold-primary hover:underline block mt-1">
            View Payout Desk →
          </Link>
        </div>
      </div>

      {/* Course Curriculum & Approval Management Table */}
      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gold-primary" />
            Curriculum Review & Publication Pipeline
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-muted-dark text-sm">Loading course catalog...</div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center text-text-muted-dark text-xs border border-dashed border-navy-border rounded-xl space-y-3">
            <BookOpen className="w-10 h-10 text-text-muted-dark mx-auto" />
            <h3 className="font-bold text-sm text-white">No Courses Created Yet</h3>
            <p className="max-w-md mx-auto">
              Start building your first trading curriculum with lessons, video embeds, and quizzes.
            </p>
            <Link
              href="/tutor/courses/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-primary text-navy-deepest font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Course Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const approval = course.approvalStatus || 'draft';
              const isApproved = approval === 'approved';
              const isPublished = course.status === 'published';

              return (
                <div
                  key={course._id}
                  className="p-5 rounded-2xl bg-navy-deepest border border-navy-border space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-border/70 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">{course.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-navy-surface text-gold-primary border border-navy-border uppercase font-mono">
                          {course.level || 'Advanced'}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted-dark mt-1">
                        Category: <span className="text-slate-300">{course.category}</span> • Price: <span className="font-mono text-emerald-400 font-bold">${course.price || 0}</span> • Enrolled: <span className="font-mono text-white">{course.enrolledCount || 0}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                          approval === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : approval === 'submitted'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : approval === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {approval === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {approval === 'submitted' && <Clock className="w-3 h-3" />}
                        {approval === 'rejected' && <XCircle className="w-3 h-3" />}
                        Approval: {approval}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          isPublished
                            ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30'
                            : 'bg-slate-700/30 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isPublished ? '● LIVE / PUBLISHED' : '○ UNPUBLISHED'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted-dark line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {approval === 'rejected' && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                      <strong>Rejection Note:</strong> {course.rejectionReason || 'Please improve quiz material and lesson clarity before resubmitting.'}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tutor/courses/${course._id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-navy-surface border border-navy-border text-xs text-text-muted-dark hover:text-white transition-colors"
                      >
                        Curriculum Builder & Lessons
                      </Link>
                      {course.slug && (
                        <Link
                          href={`/education/${course.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-navy-surface border border-navy-border text-xs text-gold-primary hover:border-gold-primary/50 transition-colors"
                        >
                          Public Preview ↗
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Workflow button: Submit for review if draft or rejected */}
                      {approval !== 'approved' && approval !== 'submitted' && (
                        <button
                          onClick={() => handleSubmitForApproval(course._id)}
                          disabled={actionLoadingId === course._id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit for Admin Audit</span>
                        </button>
                      )}

                      {/* Workflow button: Toggle publish once approved */}
                      {isApproved && (
                        <button
                          onClick={() => handleTogglePublish(course._id)}
                          disabled={actionLoadingId === course._id}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isPublished
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          <span>{isPublished ? 'Unpublish Course' : 'Publish to Marketplace'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
