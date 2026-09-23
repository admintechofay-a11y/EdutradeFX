'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Users,
  Clock,
  ArrowLeft,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TutorCoursesListPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', text: err.message || 'Failed to load courses' });
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
      if (res && res.success !== false) {
        setCourses((prev) => prev.filter((c) => c._id !== id));
        setFeedback({ type: 'success', text: 'Course deleted successfully.' });
      } else {
        setFeedback({ type: 'error', text: res?.message || 'Failed to delete course' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error deleting course' });
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.togglePublishCourse(id);
      if (res && res.success !== false) {
        setFeedback({ type: 'success', text: 'Course status updated.' });
        loadCourses();
      } else {
        setFeedback({ type: 'error', text: res?.message || 'Cannot publish unapproved course' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error updating status' });
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      const res = await api.submitCourseForApproval(id);
      if (res && res.success !== false) {
        setFeedback({ type: 'success', text: 'Course submitted to admin compliance desk.' });
        loadCourses();
      } else {
        setFeedback({ type: 'error', text: res?.message || 'Submission failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error submitting course' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tutor Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Course Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, edit, or publish courses authored by your instructor account.
          </p>
        </div>

        <Link
          href="/tutor/courses/new"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-glow-gold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/40 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.text}
          <button onClick={() => setFeedback(null)} className="ml-auto text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Courses Content */}
      {loading ? (
        <div className="rounded-3xl glass-card border border-slate-800 p-12 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          Loading your courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl glass-card border border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Courses Authored Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Start sharing your institutional forex trading knowledge by creating your first academy curriculum.
            </p>
          </div>
          <Link
            href="/tutor/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider transition-all shadow-glow-gold"
          >
            <Plus className="w-4 h-4" />
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-brand-surface/60 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Course</th>
                  <th className="p-4">Category & Level</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'}
                          alt={course.title}
                          className="w-12 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white line-clamp-1">{course.title}</h4>
                          <span className="text-[11px] text-slate-400">/{course.slug || course._id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="badge-regulation text-[10px] block w-fit mb-1">
                        {course.category}
                      </span>
                      <span className="badge-green text-[10px] capitalize">{course.level || 'Beginner'}</span>
                    </td>

                    <td className="p-4 font-semibold text-amber-400">
                      {course.price ? `$${course.price}` : 'Free'}
                    </td>

                    <td className="p-4 font-semibold text-white">
                      {(course.enrolledCount ?? course.studentsEnrolled ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                            course.approvalStatus === 'approved'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : course.approvalStatus === 'submitted'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : course.approvalStatus === 'rejected'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {(course.approvalStatus || 'draft').toUpperCase()}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          Visibility: {course.status === 'published' ? '🟢 Published' : '⚪ Draft'}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {course.approvalStatus === 'draft' && (
                          <button
                            onClick={() => handleSubmitForReview(course._id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                            title="Submit to Admin for Listing Approval"
                          >
                            <Send className="w-3 h-3" />
                            Submit
                          </button>
                        )}

                        {course.approvalStatus === 'approved' && (
                          <button
                            onClick={() => handleTogglePublish(course._id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              course.status === 'published'
                                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {course.status === 'published' ? 'Unpublish' : 'Publish Live'}
                          </button>
                        )}

                        <Link
                          href={`/education/${course.slug || course._id}`}
                          className="p-1.5 rounded-lg bg-brand-surface border border-slate-700 text-slate-400 hover:text-white transition-all"
                          title="Preview Public Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(course._id)}
                          className="p-1.5 rounded-lg bg-brand-surface border border-slate-700 text-rose-400 hover:border-rose-500/50 transition-all"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
