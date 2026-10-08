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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">My Learning Academy</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
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
              className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-lift transition flex flex-col justify-between"
            >
              <div>
                <div className="h-36 rounded-xl bg-surface-tint mb-3 overflow-hidden relative border border-border">
                  {enr.course?.thumbnail ? (
                    <img
                      src={enr.course.thumbnail}
                      alt={enr.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-white/95 text-orange text-[10px] font-bold border border-border shadow-sm">
                    {enr.progress}% Complete
                  </span>
                </div>

                <h3 className="text-sm font-bold text-text-heading mb-2 line-clamp-2">
                  {enr.course?.title}
                </h3>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${enr.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {enr.certificateIssued ? (
                    <span className="text-green font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Certified
                    </span>
                  ) : (
                    'In progress'
                  )}
                </span>

                <Link
                  href={`/learn/${enr.course?.slug}/${enr.course?.sections?.[0]?.lessons?.[0]?.id || ''}`}
                  className="px-3.5 py-1.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-semibold transition flex items-center gap-1.5 shadow-soft"
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
          title="No Enrolled Masterclasses"
          description="Explore our accredited curriculum to master candlestick analysis and institutional order flow."
          actionLabel="Browse Courses"
          actionHref="/courses"
        />
      )}
    </div>
  );
}
