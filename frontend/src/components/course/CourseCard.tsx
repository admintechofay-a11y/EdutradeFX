'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, ArrowRight, PlayCircle } from 'lucide-react';
import { Course } from '../../types';
import { StarRating } from '../common/StarRating';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const priceNum = typeof course.price === 'number' ? course.price : parseFloat(course.price as any) || 0;
  const discountNum = course.discountPrice != null ? (typeof course.discountPrice === 'number' ? course.discountPrice : parseFloat(course.discountPrice as any)) : undefined;
  const isDiscounted = discountNum != null && discountNum < priceNum;
  const displayPrice = isDiscounted ? discountNum : priceNum;

  return (
    <div className="group rounded-2xl bg-white border border-border hover:border-blue/30 transition-all duration-300 hover:-translate-y-1 shadow-soft hover:shadow-lift flex flex-col justify-between overflow-hidden">
      <div>
        {/* Course Thumbnail */}
        <div className="relative h-48 w-full bg-surface-tint overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-gradient-to-br from-surface-tint to-blue-50">
              <BookOpen className="w-12 h-12 mb-2 text-blue" />
              <span className="text-xs font-semibold text-text-body">EdutradeFX Masterclass</span>
            </div>
          )}

          {/* Level Tag */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-orange text-xs font-bold border border-border shadow-sm backdrop-blur-sm">
            {course.level}
          </span>

          {/* Category Tag */}
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 text-blue text-xs font-bold border border-border shadow-sm backdrop-blur-sm">
            {course.category}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <StarRating rating={course.avgRating || 0} />
              <span className="font-bold text-text-heading ml-1">{(course.avgRating || 0).toFixed(1)}</span>
              <span>({course.totalReviews || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-text-muted">
              <Users className="w-3.5 h-3.5" />
              <span>{course.totalEnrollments || 0} enrolled</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-text-heading group-hover:text-blue transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-text-body line-clamp-2 leading-relaxed">
            {course.shortDescription || course.description}
          </p>

          {/* Tutor Info */}
          {course.tutor && (
            <div className="flex items-center gap-2 pt-2.5 border-t border-border">
              <div className="w-6 h-6 rounded-full bg-surface-tint text-blue border border-border flex items-center justify-center font-bold text-[10px]">
                {course.tutor.user?.name ? course.tutor.user.name[0].toUpperCase() : 'M'}
              </div>
              <span className="text-xs text-text-heading font-semibold truncate">
                {course.tutor.user?.name || 'Verified Mentor'}
              </span>
            </div>
          )}

          {/* Duration & Lessons Meta */}
          <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>{Math.round(course.totalDuration / 60)} hrs total</span>
            </div>
            <div className="flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5 text-text-muted" />
              <span>{course.totalLessons} lessons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="p-5 pt-3.5 border-t border-border flex items-center justify-between bg-surface-tint">
        <div>
          <div className="text-[11px] text-text-muted font-medium">Enrollment</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold font-mono text-orange">
              {displayPrice === 0 ? 'Free' : `₹${displayPrice.toLocaleString()}`}
            </span>
            {isDiscounted && (
              <span className="text-xs text-text-muted line-through font-mono">
                ₹{priceNum.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-orange hover:text-white text-xs font-bold text-text-heading border border-border hover:border-orange transition-all shadow-sm group/btn"
        >
          <span>View Course</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
