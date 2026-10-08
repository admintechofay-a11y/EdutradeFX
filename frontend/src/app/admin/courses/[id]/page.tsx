'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeft,
  Check,
  X,
  User,
  DollarSign,
  Tag,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/courses`);
        const found = (res.data?.data || []).find((c: any) => c.id === id);
        if (found) {
          setCourse(found);
        } else {
          // If not in the list, fallback to single course query or redirect
          const singleRes = await api.get(`/courses/${id}`).catch(() => null);
          if (singleRes?.data?.data) {
            setCourse(singleRes.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const updateStatus = async (status: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/courses/${id}/status`, { status });
      setCourse((prev: any) => ({ ...prev, status }));
      alert(`Course status updated to ${status}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl bg-border/40" />
        <Skeleton className="h-64 rounded-3xl bg-border/40" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4 bg-white border border-border rounded-3xl p-8 shadow-soft">
        <BookOpen className="w-12 h-12 text-border mx-auto" />
        <h2 className="text-xl font-bold text-navy">Course Not Found</h2>
        <p className="text-xs text-text-muted">
          The requested course could not be located or may have been deleted.
        </p>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border border-border space-y-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue/10 text-blue border border-blue/20 uppercase tracking-wider">
                {course.category}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-tint border border-border text-text-body">
                {course.level}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  course.status === 'PUBLISHED'
                    ? 'bg-green/10 text-green border border-green/20'
                    : 'bg-orange/10 text-orange border border-orange/20'
                }`}
              >
                {course.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-navy">{course.title}</h1>
            <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
              {course.shortDescription || course.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {course.status !== 'PUBLISHED' && (
              <button
                onClick={() => updateStatus('PUBLISHED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green hover:bg-green-hover text-white rounded-full text-xs font-bold transition shadow-sm w-full sm:w-auto min-h-[40px] flex items-center justify-center"
              >
                Publish Masterclass
              </button>
            )}
            {course.status === 'PUBLISHED' && (
              <button
                onClick={() => updateStatus('ARCHIVED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-surface-tint hover:bg-border/60 text-text-body border border-border rounded-full text-xs font-bold transition w-full sm:w-auto min-h-[40px] flex items-center justify-center"
              >
                Unpublish
              </button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase">Instructor</div>
            <div className="text-sm font-bold text-navy flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue" />
              <span>{course.tutor?.user?.name || 'Instructor'}</span>
            </div>
            <div className="text-xs text-text-muted">{course.tutor?.user?.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase">Price & Currency</div>
            <div className="text-sm font-black text-orange flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>{course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}</span>
            </div>
            <div className="text-xs text-text-muted">{course.currency || 'INR'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-1">
            <div className="text-[11px] font-bold text-text-muted uppercase">Submitted At</div>
            <div className="text-sm font-bold text-text-heading flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-text-muted" />
              <span>
                {new Date(course.createdAt).toLocaleDateString(undefined, {
                  dateStyle: 'medium',
                })}
              </span>
            </div>
            <div className="text-xs text-text-muted">ID: {course.id.slice(0, 8)}...</div>
          </div>
        </div>

        {/* Full description */}
        {course.description && (
          <div className="pt-6 border-t border-border space-y-2">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
              Course Overview & Syllabus
            </h3>
            <p className="text-xs text-text-body whitespace-pre-line leading-relaxed">
              {course.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
