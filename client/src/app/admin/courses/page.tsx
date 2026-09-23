'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Clock,
  Users,
  Star,
  ArrowLeft,
  X,
  Check,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';
import { api } from '@/lib/api';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadCourses = async () => {
    try {
      const data = await api.getAdminCourses();
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCourses();
  }, []);

  const handleApproval = async (id: string, approvalStatus: string) => {
    let reason = '';
    if (approvalStatus === 'rejected') {
      const input = prompt('Enter rejection reason for academy curriculum:');
      if (!input) return;
      reason = input;
    }
    try {
      const res = await api.updateCourseApproval(id, approvalStatus, reason);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) => (c._id === id ? { ...c, approvalStatus, rejectionReason: reason } : c))
        );
      }
    } catch (err) {
      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, approvalStatus, rejectionReason: reason } : c))
      );
    }
  };

  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('Forex Basics');
  const [durationHours, setDurationHours] = useState(4);
  const [description, setDescription] = useState('');
  const [instructorName, setInstructorName] = useState('David Sutherland');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse = {
      _id: 'c-' + Date.now(),
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      level,
      category,
      durationHours: Number(durationHours),
      totalLessons: 4,
      studentsEnrolled: 0,
      rating: 5.0,
      description,
      shortSummary: description.slice(0, 100) + '...',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      instructor: {
        name: instructorName,
        role: 'Senior Market Strategist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      },
      modules: [
        {
          title: 'Module 1: Foundations',
          description: 'Core concepts and terminology.',
          lessons: [],
        },
      ],
    };

    setCourses([newCourse as any, ...courses]);
    setModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Panel
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            LMS Academy Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Course & Curriculum Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build trading courses, structure modules and lessons, and configure interactive quiz questions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-sky-500 text-brand-darkest hover:bg-sky-400 transition-all shadow-glow-blue flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.slug}
            className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="badge-green text-[10px]">{course.level}</span>
                  <span className="badge-regulation text-[10px]">{course.category}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    (course.approvalStatus || 'approved') === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : course.approvalStatus === 'submitted'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : course.approvalStatus === 'rejected'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {course.approvalStatus || 'APPROVED'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white line-clamp-2">{course.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                {course.approvalStatus !== 'approved' ? (
                  <button
                    type="button"
                    onClick={() => handleApproval(course._id, 'approved')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApproval(course._id, 'draft')}
                    className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-[11px] transition-colors"
                  >
                    Unpublish
                  </button>
                )}

                {course.approvalStatus === 'submitted' && (
                  <button
                    type="button"
                    onClick={() => handleApproval(course._id, 'rejected')}
                    className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] transition-colors"
                  >
                    Reject
                  </button>
                )}
              </div>

              <Link
                href={`/education/${course.slug}`}
                target="_blank"
                className="text-amber-400 font-bold hover:underline"
              >
                Preview →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Course Builder Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-brand-card border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Trading Course</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Course Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Smart Money Concepts & Institutional Order Flow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Target Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Masterclass">Masterclass</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Forex Basics">Forex Basics</option>
                    <option value="Technical Analysis">Technical Analysis</option>
                    <option value="Price Action">Price Action</option>
                    <option value="Risk Management">Risk Management</option>
                    <option value="EA & Algorithms">EA & Algorithms</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Lead Instructor</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Course Curriculum Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline the learning objectives, key modules, and takeaways..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-brand-surface border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold uppercase tracking-wider bg-sky-500 text-brand-darkest shadow-glow-blue"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
