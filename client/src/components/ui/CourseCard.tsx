'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseCardProps {
  course: {
    _id?: string;
    title: string;
    slug: string;
    level: string;
    category: string;
    description?: string;
    shortSummary?: string;
    thumbnail: string;
    durationHours?: number;
    totalLessons?: number;
    studentsEnrolled?: number;
    rating: number;
    price?: number;
    instructor?: {
      name: string;
      role?: string;
      avatar: string;
    };
    tutor?: {
      name: string;
      avatar?: string;
    };
    [key: string]: any;
  };
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  // Level badge: pill — Beginner (green) / Intermediate (blue) / Advanced (purple)
  const getLevelBadgeClass = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('beginner')) {
      return 'bg-[#ECFDF5] text-[#065F46] border border-[#6EE7B7]';
    }
    if (l.includes('intermediate')) {
      return 'bg-[#EFF6FF] text-[#1E40AF] border border-[#93C5FD]';
    }
    // Advanced or others
    return 'bg-[#FAF5FF] text-[#6B21A8] border border-[#D8B4FE]';
  };

  const instructorName = course.instructor?.name || course.tutor?.name || 'EduTradeFX Faculty';
  const instructorAvatar =
    course.instructor?.avatar ||
    course.tutor?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  const studentsCount = course.studentsEnrolled || (course as any).enrolledCount || 1240;
  const isFree = !course.price || course.price === 0;
  const courseSlug = course.slug || course._id || '';
  const courseThumbnail = course.thumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
  const courseLevel = course.level || 'Beginner';
  const courseCategory = course.category || 'Forex Basics';
  const courseRating = typeof course.rating === 'number' && !isNaN(course.rating) ? course.rating : 4.8;

  return (
    <div
      className={cn(
        'w-full bg-white border border-[#E2E8F0] rounded-md shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-200 overflow-hidden flex flex-col justify-between text-left',
        className
      )}
    >
      <div>
        {/* ================= 1. THUMBNAIL (100% × 180px, 16:9 ratio) ================= */}
        <div className="relative w-full h-[180px] overflow-hidden bg-navy-deepest">
          <img
            src={courseThumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />

          {/* Level badge top-right corner */}
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                getLevelBadgeClass(courseLevel)
              )}
            >
              {courseLevel}
            </span>
          </div>
        </div>

        {/* ================= 2. CONTENT AREA ================= */}
        <div className="p-5 space-y-3">
          {/* Category Tag: Inter 11px weight 600 --color-gold-primary, uppercase */}
          <span className="font-sans text-[11px] font-semibold text-gold-primary uppercase tracking-wider block">
            {courseCategory}
          </span>

          {/* Title: Inter 16px weight 700 --color-text-primary, 2-line clamp */}
          <Link href={`/education/${courseSlug}`}>
            <h3 className="font-sans text-[16px] font-bold text-text-primary hover:text-gold-primary transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>

          {/* Tutor: avatar 24×24 --radius-full + "by Tutor Name" Inter 13px --color-text-secondary */}
          <div className="flex items-center gap-2 pt-0.5">
            <img
              src={instructorAvatar}
              alt={instructorName}
              className="w-6 h-6 rounded-full object-cover border border-[#E2E8F0]"
            />
            <span className="font-sans text-[13px] text-text-secondary truncate">
              by {instructorName}
            </span>
          </div>

          {/* Rating: ★★★★☆ 4.1 • 1.2k students */}
          <div className="flex items-center gap-1.5 pt-1 text-[13px] text-text-secondary">
            <div className="flex items-center gap-0.5 text-[#F59E0B]">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 text-[#E2E8F0] fill-[#E2E8F0]" />
            </div>
            <span className="font-semibold text-text-primary">{courseRating.toFixed(1)}</span>
            <span>•</span>
            <span>
              {studentsCount >= 1000
                ? `${(studentsCount / 1000).toFixed(1)}k students`
                : `${studentsCount} students`}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. DIVIDER & BOTTOM ROW: Price + Enroll Button ================= */}
      <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between">
        {/* Price: DM Serif Display 20px --color-text-primary (or "Free" in green) */}
        <div>
          {isFree ? (
            <span className="font-sans text-[16px] font-bold text-success">
              Free
            </span>
          ) : (
            <span className="font-serif text-[20px] text-text-primary">
              ${course.price}
            </span>
          )}
        </div>

        {/* Enroll Button: Primary button style with 44px min tap target */}
        <Link href={`/education/${courseSlug}`}>
          <button
            type="button"
            className="min-h-[44px] px-5 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-sans text-[13px] font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            Enroll in Course
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
