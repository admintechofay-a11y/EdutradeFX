'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Check, X, Star, Users } from 'lucide-react';
import { api } from '../../../lib/api';
import { Course, CourseStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses');
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

  const updateStatus = async (id: string, status: CourseStatus) => {
    try {
      await api.patch(`/admin/courses/${id}/status`, { status });
      setCourses(courses.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course status');
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Course Quality Control</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review curriculum submissions, publish approved masterclasses, or request revisions.
        </p>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search masterclasses by title or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="REVIEW">Under Review</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 text-xs uppercase font-bold">
                <th className="p-4">Masterclass</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Price</th>
                <th className="p-4">Students</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="font-bold text-white line-clamp-1">{c.title}</div>
                    <div className="text-slate-400 text-xs">{c.category} • {c.level}</div>
                  </td>
                  <td className="p-4 text-slate-300">{c.tutor?.user?.name || 'Tutor'}</td>
                  <td className="p-4 font-bold text-brand-amber">
                    {c.price === 0 ? 'Free' : `₹${c.price}`}
                  </td>
                  <td className="p-4 text-slate-400">{c.totalEnrollments} enrolled</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'PUBLISHED'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : c.status === 'REVIEW'
                          ? 'bg-amber-500/15 text-brand-amber'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {c.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => updateStatus(c.id, 'PUBLISHED')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                      >
                        Publish
                      </button>
                    )}
                    {c.status === 'PUBLISHED' && (
                      <button
                        onClick={() => updateStatus(c.id, 'ARCHIVED')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                      >
                        Unpublish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
