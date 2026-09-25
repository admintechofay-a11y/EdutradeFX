'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Users, Clock, Edit, CheckCircle, X } from 'lucide-react';
import { api } from '../../../lib/api';
import { Course } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // New Course Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Price Action',
    level: 'BEGINNER',
    price: 0,
    description: '',
    shortDescription: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/my/courses');
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/courses', {
        ...form,
        price: Number(form.price),
        learningOutcomes: [
          'Master practical strategies and chart execution',
          'Understand risk management and capital preservation',
          'Apply disciplined analysis in live market sessions',
        ],
      });
      setIsModalOpen(false);
      setForm({
        title: '',
        category: 'Price Action',
        level: 'BEGINNER',
        price: 0,
        description: '',
        shortDescription: '',
      });
      fetchCourses();
    } catch (err: any) {
      alert(err.message || err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Course Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author and publish structured trading courses to our global community of Forex students.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-amber hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Masterclass</span>
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-navy-light text-brand-amber border border-slate-700">
                    {course.level}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      course.status === 'PUBLISHED'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-brand-amber'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {course.shortDescription || course.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.totalEnrollments} students
                  </span>
                  <span className="font-extrabold text-white">
                    {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  View Public Page
                </Link>
                <button
                  onClick={() => alert('Curriculum editor: Add lessons & videos')}
                  className="px-3 py-1.5 rounded-lg bg-brand-navy-light hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                >
                  Edit Curriculum
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Courses Published Yet"
          description="Create your first curriculum to start educating students and earning commissions."
          actionLabel="Create Masterclass"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-brand-navy-card border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Create New Course</h3>
                <p className="text-xs text-slate-400 mt-0.5">Initial setup for your masterclass curriculum.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Masterclass: Smart Money Liquidity Concepts"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white transition"
                  >
                    <option value="Price Action">Price Action</option>
                    <option value="Smart Money Concepts (SMC)">Smart Money Concepts</option>
                    <option value="Technical Analysis">Technical Analysis</option>
                    <option value="Risk Management">Risk Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white transition"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Price in INR (0 for Free)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="One sentence summary of what students will achieve..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Curriculum Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed outline of modules, requirements, and outcomes..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 resize-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-amber hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                {submitting ? 'Creating Draft...' : 'Create Masterclass'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
