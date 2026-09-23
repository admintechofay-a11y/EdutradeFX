'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  BookOpen,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';
import CourseCard from '@/components/ui/CourseCard';
import ListingDisclaimer from '@/components/shared/ListingDisclaimer';
import { api } from '@/lib/api';

export default function EducationCatalogPage() {
  const [courses, setCourses] = useState<any[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getCourses({ approvalStatus: 'all', status: 'all' });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Pull-to-refresh mobile interactions
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0 && typeof window !== 'undefined' && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.4, 70));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 45) {
      setIsRefreshing(true);
      setPullDistance(0);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 700);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const categories = [
    'All Categories',
    'Forex Basics',
    'Technical Analysis',
    'Price Action',
    'Risk Management',
    'EA & Algorithms',
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = (course.title || '').toLowerCase().includes(q);
        const matchesDesc = (course.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (selectedLevel !== 'All' && (course.level || '').toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }

      if (
        selectedCategory !== 'All Categories' &&
        selectedCategory !== 'All' &&
        (course.category || '').toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.studentsEnrolled || b.enrolledCount || 0) - (a.studentsEnrolled || a.enrolledCount || 0);
      if (sortBy === 'popular') return (b.studentsEnrolled || b.enrolledCount || 0) - (a.studentsEnrolled || a.enrolledCount || 0);
      return (b.rating || 5) - (a.rating || 5);
    });
  }, [courses, search, selectedLevel, selectedCategory, sortBy]);

  return (
    <div
      className="flex flex-col min-h-screen bg-off-white relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh mobile feedback indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-[60px] left-0 right-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-200"
          style={{ height: `${isRefreshing ? 50 : pullDistance}px` }}
        >
          <div className="bg-navy-deepest text-gold-primary border border-gold-primary/30 px-4 py-1.5 rounded-full text-[12px] font-sans font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
            <span className={`inline-block ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
            <span>{isRefreshing ? 'Refreshing Academy Courses...' : pullDistance > 45 ? 'Release to refresh' : 'Pull down to refresh'}</span>
          </div>
        </div>
      )}

      {/* Page Header: dark strip same pattern as directory pages */}
      <header className="bg-navy-deep border-b border-navy-border text-text-on-dark py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] text-text-muted-dark mb-3">
            <Link href="/" className="hover:text-gold-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Education</span>
          </nav>

          <h1 className="font-serif text-[32px] sm:text-[36px] leading-tight text-white font-normal">
            Forex Trading Academy
          </h1>
          <p className="font-sans text-[14px] text-text-muted-dark mt-1 max-w-[68ch]">
            Free, structured, professional-grade curriculum. Master institutional market structure, price action, risk management, and algorithmic execution.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 w-full space-y-8">
        {/* Filter Bar Below Header: Level chips | Category dropdown | Sort dropdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 sm:p-5 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Level Tab Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {levels.map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`min-h-[44px] px-4 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center ${
                    active
                      ? 'bg-gold-primary text-navy-deepest shadow-sm'
                      : 'bg-[#F1F5F9] border border-[#E2E8F0] text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-[44px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-gold-primary"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-[44px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[13px] text-text-primary focus:outline-none focus:border-gold-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[44px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[13px] text-text-primary focus:outline-none focus:border-gold-primary"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low-High</option>
            </select>
          </div>
        </div>

        {/* Course Grid: 3-col desktop / 2-col tablet / 1-col mobile */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <CourseCard key={course.slug || course._id || `course-${idx}`} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-md p-12 text-center space-y-3 shadow-card">
            <BookOpen className="w-12 h-12 text-text-secondary mx-auto" />
            <h3 className="font-serif text-[24px] text-text-primary">No Courses Found</h3>
            <p className="font-sans text-[14px] text-text-secondary max-w-sm mx-auto">
              Try switching your level or category filter to discover courses in our academy.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedLevel('All');
                setSelectedCategory('All Categories');
                setSearch('');
              }}
              className="h-[40px] px-6 rounded-md bg-gold-primary text-navy-deepest text-[14px] font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}

        <ListingDisclaimer />
      </main>
    </div>
  );
}

