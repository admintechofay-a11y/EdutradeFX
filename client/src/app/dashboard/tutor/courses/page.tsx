'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Plus,
  BookOpen,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Globe,
  Send,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TutorCoursesListPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCourses = async () => {
    try {
      const data = await api.getMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await api.deleteCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c._id !== id));
        setFeedback({ type: 'success', text: 'Course deleted.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      const res = await api.submitCourseForApproval(id);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Course submitted to admin compliance desk.' });
        loadCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.togglePublishCourse(id);
      if (res.success) {
        setFeedback({ type: 'success', text: `Course publication state updated: ${res.data?.status}` });
        loadCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/tutor"
            className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tutor Overview</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-white">Course Curriculum Directory</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Review, edit curriculum lessons, submit for audit, or publish live courses to the academy.
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

      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        {loading ? (
          <div className="p-12 text-center text-text-muted-dark text-sm">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center text-text-muted-dark text-xs border border-dashed border-navy-border rounded-xl">
            No courses found. Start authoring your curriculum using the button above.
          </div>
        ) : (
          <div className="divide-y divide-navy-border">
            {courses.map((course) => {
              const approval = course.approvalStatus || 'draft';
              const isApproved = approval === 'approved';
              const isPublished = course.status === 'published';

              return (
                <div key={course._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{course.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-navy-deepest text-gold-primary border border-navy-border uppercase font-mono">
                        {course.level || 'Intermediate'}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted-dark flex items-center gap-3">
                      <span>Category: {course.category}</span>
                      <span>Price: ${course.price || 0}</span>
                      <span>Enrolled: {course.enrolledCount || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                        approval === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : approval === 'submitted'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {approval === 'approved' ? '✓ Approved' : approval === 'submitted' ? '⏳ In Review' : 'Draft'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        isPublished
                          ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30'
                          : 'bg-slate-700/30 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isPublished ? 'Live' : 'Unpublished'}
                    </span>

                    <Link
                      href={`/tutor/courses/${course._id}/edit`}
                      className="p-1.5 rounded-lg bg-navy-deepest border border-navy-border text-text-muted-dark hover:text-white"
                      title="Edit Course"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>

                    {approval !== 'approved' && approval !== 'submitted' && (
                      <button
                        onClick={() => handleSubmitForReview(course._id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 text-xs font-semibold"
                      >
                        Submit
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isPublished
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(course._id)}
                      className="p-1.5 rounded-lg text-text-muted-dark hover:text-rose-400"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
