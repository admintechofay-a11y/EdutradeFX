'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';
import LegalNoticeBlock from '@/components/shared/LegalNoticeBlock';
import { api } from '@/lib/api';

export default function CourseOverviewPage({ params }: { params: { courseSlug: string } }) {
  const initialCourse = MOCK_COURSES.find((c) => c.slug === params.courseSlug || c._id === params.courseSlug) || MOCK_COURSES[0];
  const [course, setCourse] = React.useState<any>(initialCourse);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await api.getCourseBySlug(params.courseSlug);
        if (isMounted && data) {
          setCourse(data);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [params.courseSlug]);

  const modules = course.modules && course.modules.length > 0
    ? course.modules
    : course.lessons && course.lessons.length > 0
    ? [{
        title: 'Core Curriculum Lessons',
        description: 'Comprehensive video and text lessons for this course.',
        lessons: course.lessons.map((l: any) => ({
          title: l.title,
          slug: l.slug || l._id,
          _id: l._id,
          durationMinutes: l.duration || l.durationMinutes || 15,
        })),
      }]
    : [{
        title: 'Introduction & Foundations',
        description: 'Core concepts, market mechanics, and introductory framework.',
        lessons: [
          { title: 'Market Structure & Setup Framework', durationMinutes: 20, slug: 'market-structure' },
          { title: 'Risk-to-Reward Execution Matrix', durationMinutes: 25, slug: 'risk-reward-execution' },
        ],
      }];

  const firstLesson = modules[0]?.lessons?.[0];
  const firstLessonId = firstLesson?._id || firstLesson?.slug || 'market-structure';
  const firstLessonLink = `/education/${course.slug || params.courseSlug}/lessons/${firstLessonId}`;

  const instructorName = course.instructor?.name || course.tutor?.name || 'EduTradeFX Faculty';
  const instructorRole = course.instructor?.role || 'Senior Market Analyst';
  const instructorAvatar = course.instructor?.avatar || course.tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
  const courseThumbnail = course.thumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link
        href="/education"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course Catalog
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="badge-green text-xs">{course.level}</span>
            <span className="badge-regulation text-xs">{course.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold">{course.durationHours || 4} Hours</span> on-demand
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-semibold">{course.totalLessons || course.lessons?.length || 12} Lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-white font-semibold">{(course.studentsEnrolled || course.enrolledCount || 1240).toLocaleString()}</span> Students
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{course.rating || 4.9} / 5.0</span>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="rounded-2xl glass-card border border-slate-800 p-5 flex items-center gap-4">
            <img
              src={instructorAvatar}
              alt={instructorName}
              className="w-14 h-14 rounded-2xl object-cover border border-amber-400/40 shrink-0"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Course Instructor
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{instructorName}</h3>
              <p className="text-xs text-slate-400">{instructorRole}</p>
            </div>
          </div>
        </div>

        {/* Right Sticky Enrollment Card */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-5 sticky top-24">
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 relative">
              <img
                src={courseThumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand-darkest/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/90 text-brand-darkest flex items-center justify-center shadow-glow-gold hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 fill-current" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white">100% Free</span>
                <span className="badge-green text-xs font-bold">Full Access</span>
              </div>

              <Link
                href={firstLessonLink}
                className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-darkest transition-all flex items-center justify-center gap-2 shadow-glow-gold"
              >
                Enroll in Course
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span className="font-bold text-slate-300 block mb-2">This course includes:</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Video breakdowns & comprehensive guides</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Interactive module knowledge check quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified EduTradeFX completion certificate</span>
              </div>
            </div>

            <LegalNoticeBlock title="LMS Enrollment Notice" className="mt-4">
              Enrollment grants educational access to course modules and curriculum notes. Trading Forex involves substantial financial risk and is not suitable for all investors.
            </LegalNoticeBlock>
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white">Course Curriculum</h2>

        <div className="space-y-4">
          {modules.map((mod: any, mIdx: number) => (
            <div key={mIdx} className="rounded-2xl border border-slate-800 bg-brand-surface/40 p-5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-extrabold flex items-center justify-center">
                    {mIdx + 1}
                  </span>
                  {mod.title}
                </h3>
                {mod.description && (
                  <p className="text-xs text-slate-400 mt-1 ml-8">{mod.description}</p>
                )}
              </div>

              <div className="divide-y divide-slate-800/80 ml-8">
                {mod.lessons?.map((lesson: any, lIdx: number) => (
                  <div key={lIdx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                      <span>{lesson.title}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{lesson.durationMinutes} min</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
