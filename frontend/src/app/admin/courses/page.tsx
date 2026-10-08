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
        <h1 className="text-2xl sm:text-3xl font-black text-navy">Course Quality Control</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Review curriculum submissions, publish approved masterclasses, or request revisions.
        </p>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search masterclasses by title or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
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
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full min-w-[650px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Masterclass</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Price</th>
                <th className="p-4">Students</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-tint/60 transition">
                  <td className="p-4">
                    <div className="font-bold text-navy line-clamp-1">{c.title}</div>
                    <div className="text-text-muted text-xs">{c.category} • {c.level}</div>
                  </td>
                  <td className="p-4 text-text-body">{c.tutor?.user?.name || 'Tutor'}</td>
                  <td className="p-4 font-bold text-orange">
                    {c.price === 0 ? 'Free' : `₹${c.price}`}
                  </td>
                  <td className="p-4 text-text-muted">{c.totalEnrollments} enrolled</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'PUBLISHED'
                          ? 'bg-green/10 text-green'
                          : c.status === 'REVIEW'
                          ? 'bg-orange/10 text-orange'
                          : 'bg-surface-tint text-text-muted border border-border'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {c.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => updateStatus(c.id, 'PUBLISHED')}
                        className="px-3.5 py-1 bg-green hover:bg-green-hover text-white rounded-full text-xs font-bold transition shadow-sm"
                      >
                        Publish
                      </button>
                    )}
                    {c.status === 'PUBLISHED' && (
                      <button
                        onClick={() => updateStatus(c.id, 'ARCHIVED')}
                        className="px-3.5 py-1 bg-surface-tint hover:bg-border/60 text-text-body border border-border rounded-full text-xs font-bold transition"
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
