'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Award, ArrowRight, PlayCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { Enrollment } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const res = await api.get('/courses/enrollments/my');
        setEnrollments(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load enrollments', err);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Learning Academy</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track your progress through enrolled Forex masterclasses and institutional modules.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => (
            <div
              key={enr.id}
              className="p-5 rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="h-36 rounded-xl bg-slate-800 mb-3 overflow-hidden relative">
                  {enr.course?.thumbnail ? (
                    <img
                      src={enr.course.thumbnail}
                      alt={enr.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-brand-navy/90 text-brand-amber text-[10px] font-bold border border-slate-700">
                    {enr.progress}% Complete
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
                  {enr.course?.title}
                </h3>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-brand-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${enr.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {enr.certificateIssued ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Certified
                    </span>
                  ) : (
                    'In progress'
                  )}
                </span>

                <Link
                  href={`/learn/${enr.course?.slug}/${enr.course?.sections?.[0]?.lessons?.[0]?.id || ''}`}
                  className="px-3.5 py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Enrolled Courses"
          description="You haven't enrolled in any trading courses yet. Explore our beginner or institutional masterclasses."
          actionLabel="Browse Courses"
          onAction={() => (window.location.href = '/courses')}
        />
      )}
    </div>
  );
}
