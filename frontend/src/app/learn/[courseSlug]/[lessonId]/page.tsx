'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  ChevronRight,
  Menu,
  X,
  Award,
  BookOpen,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Course, CourseSection, Lesson } from '../../../../types';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function VideoLearningRoomPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseSlug as string;
  const lessonId = params?.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function loadLearningRoom() {
      if (!courseSlug) return;
      setLoading(true);
      try {
        const res = await api.get(`/courses/${courseSlug}`);
        const cData = res.data?.data;
        setCourse(cData);

        // Find active lesson
        let foundLesson: Lesson | null = null;
        if (cData?.sections) {
          for (const s of cData.sections) {
            const l = s.lessons?.find((item: Lesson) => item.id === lessonId);
            if (l) {
              foundLesson = l;
              break;
            }
          }
          // Default to first lesson if none matched
          if (!foundLesson && cData.sections[0]?.lessons?.[0]) {
            foundLesson = cData.sections[0].lessons[0];
          }
        }
        setCurrentLesson(foundLesson);

        // Fetch user enrollment progress
        const enrRes = await api.get('/courses/enrollments/my');
        const thisEnr = (enrRes.data?.data || []).find((e: any) => e.courseId === cData?.id);
        if (thisEnr && thisEnr.lessonCompletions) {
          setCompletedLessonIds(thisEnr.lessonCompletions.map((lc: any) => lc.lessonId));
        }
      } catch (err) {
        console.error('Failed to load learning room', err);
      } finally {
        setLoading(false);
      }
    }

    loadLearningRoom();
  }, [courseSlug, lessonId]);

  const handleMarkComplete = async () => {
    if (!course || !currentLesson) return;
    setMarking(true);
    try {
      await api.post(`/courses/${course.id}/lessons/${currentLesson.id}/complete`);
      if (!completedLessonIds.includes(currentLesson.id)) {
        setCompletedLessonIds([...completedLessonIds, currentLesson.id]);
      }

      // Automatically find next lesson
      let nextLesson: Lesson | null = null;
      let foundCurrent = false;

      if (course.sections) {
        for (const s of course.sections) {
          for (const l of s.lessons || []) {
            if (foundCurrent) {
              nextLesson = l;
              break;
            }
            if (l.id === currentLesson.id) {
              foundCurrent = true;
            }
          }
          if (nextLesson) break;
        }
      }

      if (nextLesson) {
        router.push(`/learn/${course.slug}/${nextLesson.id}`);
      } else {
        alert('Congratulations! You have completed all lessons in this masterclass.');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Classroom Session Unavailable</h2>
        <Link href="/dashboard/enrollments" className="text-brand-blue text-sm underline">
          Return to My Enrollments
        </Link>
      </div>
    );
  }

  const totalLessons = course.totalLessons || 1;
  const progressPercent = Math.min(
    100,
    Math.round((completedLessonIds.length / totalLessons) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-brand-blue">
      {/* Top Distraction-Free Header */}
      <header className="h-16 bg-brand-navy-card border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/enrollments"
            className="p-2 rounded-xl bg-brand-navy-light text-slate-400 hover:text-white transition"
            title="Exit Classroom"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="overflow-hidden max-w-sm sm:max-w-md">
            <h1 className="text-sm font-bold text-white truncate">{course.title}</h1>
            <div className="text-xs text-slate-400 truncate">
              {currentLesson?.title || 'Current Lesson'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Progress: {progressPercent}%</span>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 rounded-xl bg-brand-navy-light text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Curriculum</span>
          </button>
        </div>
      </header>

      {/* Main Classroom Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video Player & Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Player Container */}
            <div className="relative rounded-3xl overflow-hidden aspect-video bg-black shadow-2xl border border-slate-800 flex items-center justify-center">
              {currentLesson?.contentUrl ? (
                <iframe
                  src={currentLesson.contentUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <PlayCircle className="w-16 h-16 text-brand-blue mx-auto animate-pulse" />
                  <h3 className="text-lg font-bold text-white">
                    {currentLesson?.title || 'Lesson Stream'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Video lecture is loaded into your private player. Click play to begin instruction.
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Title & Notes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentLesson?.title}
                </h2>
                {completedLessonIds.includes(currentLesson?.id || '') && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {currentLesson?.description ||
                  'Follow this lesson carefully and mark it complete once you have mastered the underlying chart setups.'}
              </p>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="max-w-4xl mx-auto w-full pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {currentLesson?.duration ? `${currentLesson.duration} minutes runtime` : 'Lesson lecture'}
            </span>

            <button
              onClick={handleMarkComplete}
              disabled={marking}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{marking ? 'Updating...' : 'Mark Complete & Next'}</span>
            </button>
          </div>
        </div>

        {/* Right Collapsible Curriculum Drawer */}
        {drawerOpen && (
          <aside className="w-80 sm:w-96 bg-brand-navy-card border-l border-slate-800 flex flex-col justify-between shrink-0 overflow-y-auto z-20">
            <div>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Course Outline
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-850">
                {course.sections?.map((section) => (
                  <div key={section.id} className="p-4 space-y-2">
                    <div className="text-xs font-bold text-slate-300 mb-2">{section.title}</div>
                    <div className="space-y-1">
                      {section.lessons?.map((lesson) => {
                        const isCurrent = lesson.id === currentLesson?.id;
                        const isDone = completedLessonIds.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => router.push(`/learn/${course.slug}/${lesson.id}`)}
                            className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between gap-2 ${
                              isCurrent
                                ? 'bg-brand-blue text-white font-bold'
                                : 'text-slate-300 hover:bg-brand-navy-light/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {isDone ? (
                                <CheckCircle2
                                  className={`w-4 h-4 shrink-0 ${
                                    isCurrent ? 'text-white' : 'text-emerald-400'
                                  }`}
                                />
                              ) : (
                                <Circle
                                  className={`w-4 h-4 shrink-0 ${
                                    isCurrent ? 'text-white' : 'text-slate-600'
                                  }`}
                                />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            {lesson.duration && (
                              <span
                                className={`text-[10px] shrink-0 ${
                                  isCurrent ? 'text-blue-200' : 'text-slate-500'
                                }`}
                              >
                                {lesson.duration}m
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Status Box */}
            {progressPercent === 100 && (
              <div className="p-4 m-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
                <Award className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-white">Course Completed!</div>
                <Link
                  href="/dashboard/certificates"
                  className="block py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  View Certificate
                </Link>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
