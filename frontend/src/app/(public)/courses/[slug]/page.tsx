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
import { Modal } from '@/components/ui/Modal';
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
            color: '#1F5BFF',
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
        <h2 className="text-2xl font-bold text-text-heading mb-2">Course Not Found</h2>
        <p className="text-text-muted mb-6">The requested masterclass does not exist or has been unpublished.</p>
        <Link
          href="/courses"
          className="px-6 py-2.5 bg-blue text-white rounded-full text-sm font-semibold hover:bg-blue-hover transition"
        >
          Back to Academy
        </Link>
      </div>
    );
  }

  const isEnrolled = course.isEnrolled;

  return (
    <div className="min-h-screen pb-24 text-text-body bg-white">
      {/* ─── Hero / Header ───────────────────────────────────────── */}
      <div className="bg-surface-tint border-b border-border pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col (2 spans) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue text-xs font-bold border border-blue-200">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange text-xs font-bold border border-orange-200">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-heading leading-tight">
                {course.title}
              </h1>

              <p className="text-text-body text-sm sm:text-base leading-relaxed">
                {course.shortDescription || course.description}
              </p>

              {/* Meta stats */}
              <div className="flex items-center gap-5 text-xs sm:text-sm text-text-muted flex-wrap pt-2">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={course.avgRating} />
                  <span className="font-bold text-text-heading ml-1">{course.avgRating.toFixed(1)}</span>
                  <span>({course.totalReviews} ratings)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span>{course.totalEnrollments} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span>{Math.round(course.totalDuration / 60)} hrs on-demand video</span>
                </div>
              </div>

              {/* Instructor */}
              {course.tutor && (
                <div className="flex items-center gap-3 pt-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue border border-blue-200 flex items-center justify-center font-bold text-sm">
                    {course.tutor.user?.name ? course.tutor.user.name[0].toUpperCase() : 'T'}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="text-text-muted">Created by</div>
                    <div className="font-bold text-text-heading">{course.tutor.user?.name || 'Veteran Trader'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Preview & Sticky Card (Desktop) */}
            <div>
              <div className="p-6 rounded-3xl bg-white border border-border shadow-lift space-y-6">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-navy-deep">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-navy-deep/40 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white drop-shadow hover:scale-110 transition cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-orange">
                    {course.price === 0 ? 'Free' : `₹${(course.discountPrice || course.price).toLocaleString()}`}
                  </span>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className="text-sm text-text-muted line-through">
                      ₹{course.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    href={`/learn/${course.slug}/${course.sections?.[0]?.lessons?.[0]?.id || ''}`}
                    className="block w-full py-3.5 bg-green hover:opacity-90 text-white font-bold text-sm rounded-full text-center shadow-soft transition"
                  >
                    Go to Classroom
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full py-3.5 bg-orange hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-sm rounded-full shadow-soft transition"
                  >
                    {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                  </button>
                )}

                <div className="space-y-2.5 pt-4 border-t border-border text-xs text-text-body">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green" />
                    <span>Full lifetime access to all lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange" />
                    <span>EdutradeFX Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue" />
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
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft">
                <h3 className="text-lg font-bold text-text-heading mb-4">What You'll Master</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-body">
                      <CheckCircle className="w-4 h-4 text-green shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-heading">Course Curriculum</h3>
                <div className="text-xs text-text-muted">
                  {course.sections?.length || 0} sections • {course.totalLessons} lessons
                </div>
              </div>

              <div className="space-y-3">
                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition"
                      >
                        <span className="text-sm font-bold text-text-heading">{section.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-muted">
                            {section.lessons?.length || 0} lessons
                          </span>
                          {openSectionId === section.id ? (
                            <ChevronUp className="w-4 h-4 text-text-muted" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-text-muted" />
                          )}
                        </div>
                      </button>

                      {openSectionId === section.id && (
                        <div className="border-t border-border divide-y divide-border bg-surface-tint">
                          {section.lessons?.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 px-5 flex items-center justify-between text-xs hover:bg-blue-50/50 transition"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'VIDEO' ? (
                                  <PlayCircle className="w-4 h-4 text-blue" />
                                ) : (
                                  <FileText className="w-4 h-4 text-orange" />
                                )}
                                <span className="font-medium text-text-heading">{lesson.title}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                {lesson.duration && (
                                  <span className="text-text-muted">{lesson.duration} mins</span>
                                )}
                                {lesson.isFree ? (
                                  <button
                                    onClick={() => setPreviewLesson(lesson)}
                                    className="px-2.5 py-1 rounded-md bg-blue-50 text-blue font-bold text-[11px] border border-blue-200"
                                  >
                                    Preview
                                  </button>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-text-muted" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-text-muted text-xs bg-white rounded-2xl border border-border shadow-soft">
                    Curriculum outline is being finalized by the instructor.
                  </div>
                )}
              </div>
            </div>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-border shadow-soft">
                <h3 className="text-base font-bold text-text-heading mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-text-body">
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
      <Modal
        isOpen={Boolean(previewLesson)}
        onClose={() => setPreviewLesson(null)}
        maxWidth="2xl"
        title={previewLesson ? `${previewLesson.title} (Free Preview)` : undefined}
      >
        {previewLesson && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
            {previewLesson.contentUrl ? (
              <iframe
                src={previewLesson.contentUrl}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6">
                <PlayCircle className="w-12 h-12 text-blue mx-auto mb-2" />
                <p className="text-text-muted text-xs">Preview video stream loading...</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Mobile Sticky Enroll Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3.5 pb-safe bg-white/95 backdrop-blur-md border-t border-border shadow-lift flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Tuition Fee</div>
          <div className="text-lg font-black text-orange leading-tight">
            {course.price === 0 ? 'Free' : `₹${(course.discountPrice || course.price).toLocaleString()}`}
          </div>
        </div>

        {isEnrolled ? (
          <Link
            href={`/learn/${course.slug}/${course.sections?.[0]?.lessons?.[0]?.id || ''}`}
            className="px-6 py-2.5 bg-green hover:opacity-90 text-white font-bold text-xs rounded-full shadow-soft transition text-center min-h-[44px] flex items-center justify-center"
          >
            Go to Classroom
          </Link>
        ) : (
          <button
            onClick={handleEnrollment}
            disabled={enrolling}
            className="px-6 py-2.5 bg-orange hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-soft transition min-h-[44px] flex items-center justify-center"
          >
            {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
          </button>
        )}
      </div>
    </div>
  );
}
