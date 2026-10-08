'use client';

import React, { useState, useEffect } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { api } from '../../../lib/api';
import { Course } from '../../../types';
import { CourseCard } from '../../../components/course/CourseCard';
import { Pagination } from '../../../components/common/Pagination';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function CoursesDirectoryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    sortBy: 'createdAt',
  });

  const categories = [
    'Price Action',
    'Smart Money Concepts (SMC)',
    'Technical Analysis',
    'Fundamental & Macroeconomics',
    'Risk Management',
    'Risk Management & Psychology',
    'Algorithmic & EA Trading',
    'Forex Basics',
  ];

  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: filters.sortBy,
        sortOrder: 'desc',
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.level && { level: filters.level }),
      });

      const res = await api.get(`/courses?${params.toString()}`);
      setCourses(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, filters.category, filters.level, filters.sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  return (
    <div className="min-h-screen py-10 text-text-body bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Structured Forex Education</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-heading mb-3">
            EdutradeFX Trading Academy
          </h1>
          <p className="text-sm sm:text-base text-text-body">
            From foundational candlestick patterns to institutional order flow strategies. Learn at your own pace with accredited tutor mentorship.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-soft mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by topic, instructor, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
              />
            </form>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Level */}
            <select
              value={filters.level}
              onChange={(e) => {
                setFilters({ ...filters, level: e.target.value });
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
            >
              <option value="">All Skill Levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0) + l.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-6 text-xs sm:text-sm text-text-muted">
          <div>
            Showing <span className="font-bold text-text-heading">{courses.length}</span> of{' '}
            <span className="font-bold text-text-heading">{total}</span> courses
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                setFilters({ ...filters, sortBy: e.target.value });
                setPage(1);
              }}
              className="bg-white border border-border rounded-lg px-2.5 py-1 text-xs text-text-heading focus:outline-none focus:border-blue"
            >
              <option value="createdAt">Newest Releases</option>
              <option value="totalEnrollments">Most Popular</option>
              <option value="avgRating">Highest Rated</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="No Courses Found"
            description="Try loosening your filters or search keywords to find relevant trading courses."
            actionLabel="Reset Filters"
            onAction={() => {
              setFilters({ search: '', category: '', level: '', sortBy: 'totalEnrollments' });
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
