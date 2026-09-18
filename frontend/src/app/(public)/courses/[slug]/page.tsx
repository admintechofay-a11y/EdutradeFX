'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Share2,
  Star,
  FileText,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Course, CourseSection, Lesson } from '../../../../types';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';
import { useAuthStore } from '../../../../store/authStore';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    async function loadCourse() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/courses/${slug}`);
        const data = res.data?.data;
        setCourse(data);
        if (data?.sections && data.sections.length > 0) {
          setOpenSectionId(data.sections[0].id);
        }
      } catch (err) {
        console.error('Failed to load course', err);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [slug]);

  const toggleSection = (id: string) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };

  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (!course) return;

    // If free course, direct enrollment
    if (course.price === 0) {
      setEnrolling(true);
      try {
        await api.post(`/courses/${course.id}/enroll`);
        router.push(`/learn/${course.slug}/${course.sections?.[0]?.lessons?.[0]?.id || ''}`);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to enroll');
      } finally {
        setEnrolling(false);
      }
      return;
    }

    // Paid course: Initiate Razorpay Order
    setEnrolling(true);
    try {
      const orderRes = await api.post(`/courses/${course.id}/order`);
      const { orderId, amount, currency, keyId } = orderRes.data.data;

      // Load Razorpay SDK
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: amount,
          currency: currency || 'INR',
          name: 'EdutradeFX Academy',
          description: course.title,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              await api.post(`/courses/${course.id}/verify-payment`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              alert('Enrollment successful! Welcome to the class.');
              router.push(`/learn/${course.slug}/${course.sections?.[0]?.lessons?.[0]?.id || ''}`);
            } catch (vErr) {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#3B82F6',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate checkout.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
        <p className="text-slate-400 mb-6">The requested masterclass does not exist or has been unpublished.</p>
        <Link
          href="/courses"
          className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold"
        >
          Back to Academy
        </Link>
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;

  return (
    <div className="min-h-screen pb-24 text-slate-100">
      {/* ─── Hero / Header ───────────────────────────────────────── */}
      <div className="bg-brand-navy-card/80 border-b border-slate-800 backdrop-blur-md pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col (2 spans) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-brand-blue/15 text-brand-blue text-xs font-bold border border-brand-blue/30">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-amber/15 text-brand-amber text-xs font-bold border border-brand-amber/30">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.shortDescription || course.description}
              </p>

              {/* Meta stats */}
              <div className="flex items-center gap-5 text-xs sm:text-sm text-slate-400 flex-wrap pt-2">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={course.avgRating} />
                  <span className="font-bold text-white ml-1">{course.avgRating.toFixed(1)}</span>
                  <span>({course.totalReviews} ratings)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{course.totalEnrollments} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{Math.round(course.totalDuration / 60)} hrs on-demand video</span>
                </div>
              </div>

              {/* Instructor */}
              {course.tutor && (
                <div className="flex items-center gap-3 pt-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-sm">
                    {course.tutor.user?.name ? course.tutor.user.name[0].toUpperCase() : 'T'}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="text-slate-400">Created by</div>
                    <div className="font-bold text-white">{course.tutor.user?.name || 'Veteran Trader'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Preview & Sticky Card (Desktop) */}
            <div>
              <div className="p-6 rounded-3xl bg-brand-navy-light/90 border border-slate-700 shadow-2xl space-y-6">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/90 drop-shadow hover:scale-110 transition cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-brand-amber">
                    {course.price === 0 ? 'Free' : `₹${(course.discountPrice || course.price).toLocaleString()}`}
                  </span>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{course.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    href={`/learn/${course.slug}/${course.sections?.[0]?.lessons?.[0]?.id || ''}`}
                    className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl text-center shadow-lg shadow-emerald-600/25 transition"
                  >
                    Go to Classroom
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full py-3.5 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition"
                  >
                    {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                  </button>
                )}

                <div className="space-y-2.5 pt-4 border-t border-slate-700 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Full lifetime access to all lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-amber" />
                    <span>EdutradeFX Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-blue" />
                    <span>Downloadable cheat sheets & indicator setups</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content / Curriculum ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-brand-navy-card border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">What You'll Master</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Course Curriculum</h3>
                <div className="text-xs text-slate-400">
                  {course.sections?.length || 0} sections • {course.totalLessons} lessons
                </div>
              </div>

              <div className="space-y-3">
                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-slate-800 bg-brand-navy-card overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-brand-navy-light/40 transition"
                      >
                        <span className="text-sm font-bold text-white">{section.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {section.lessons?.length || 0} lessons
                          </span>
                          {openSectionId === section.id ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {openSectionId === section.id && (
                        <div className="border-t border-slate-800 divide-y divide-slate-850 bg-brand-navy-light/20">
                          {section.lessons?.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 px-5 flex items-center justify-between text-xs hover:bg-slate-800/30 transition"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'VIDEO' ? (
                                  <PlayCircle className="w-4 h-4 text-brand-blue" />
                                ) : (
                                  <FileText className="w-4 h-4 text-brand-amber" />
                                )}
                                <span className="font-medium text-slate-200">{lesson.title}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                {lesson.duration && (
                                  <span className="text-slate-500">{lesson.duration} mins</span>
                                )}
                                {lesson.isFree ? (
                                  <button
                                    onClick={() => setPreviewLesson(lesson)}
                                    className="px-2.5 py-1 rounded-md bg-brand-blue/15 text-brand-blue font-bold text-[11px] border border-brand-blue/30"
                                  >
                                    Preview
                                  </button>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-brand-navy-card rounded-2xl border border-slate-800">
                    Curriculum outline is being finalized by the instructor.
                  </div>
                )}
              </div>
            </div>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800">
                <h3 className="text-base font-bold text-white mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {course.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Lesson Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-brand-navy-card border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">{previewLesson.title} (Free Preview)</h3>
              <button
                onClick={() => setPreviewLesson(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              {previewLesson.contentUrl ? (
                <iframe
                  src={previewLesson.contentUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6">
                  <PlayCircle className="w-12 h-12 text-brand-blue mx-auto mb-2" />
                  <p className="text-slate-300 text-xs">Preview video stream loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
