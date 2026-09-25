'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, Star, ArrowRight, PlayCircle } from 'lucide-react';
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
    <div className="group rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col justify-between overflow-hidden">
      <div>
        {/* Course Thumbnail */}
        <div className="relative h-48 w-full bg-slate-800/80 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-800">
              <BookOpen className="w-12 h-12 mb-2 text-slate-600" />
              <span className="text-xs font-medium text-slate-400">EdutradeFX Masterclass</span>
            </div>
          )}

          {/* Level Tag */}
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-brand-navy/90 text-brand-amber text-xs font-bold border border-slate-700 backdrop-blur-sm">
            {course.level}
          </span>

          {/* Category Tag */}
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-xs font-medium border border-slate-700 backdrop-blur-sm">
            {course.category}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <StarRating rating={course.avgRating || 0} />
              <span className="font-bold text-white ml-1">{(course.avgRating || 0).toFixed(1)}</span>
              <span>({course.totalReviews || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span>{course.totalEnrollments || 0} enrolled</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.shortDescription || course.description}
          </p>

          {/* Tutor Info */}
          {course.tutor && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-[10px]">
                {course.tutor.user?.name ? course.tutor.user.name[0].toUpperCase() : 'M'}
              </div>
              <span className="text-xs text-slate-300 font-medium truncate">
                {course.tutor.user?.name || 'Verified Mentor'}
              </span>
            </div>
          )}

          {/* Duration & Lessons Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{Math.round(course.totalDuration / 60)} hrs total</span>
            </div>
            <div className="flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>{course.totalLessons} lessons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="p-5 pt-3 border-t border-slate-800/80 flex items-center justify-between bg-brand-navy-light/30">
        <div>
          <div className="text-xs text-slate-400">Enrollment</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-brand-amber">
              {displayPrice === 0 ? 'Free' : `₹${displayPrice.toLocaleString()}`}
            </span>
            {isDiscounted && (
              <span className="text-xs text-slate-500 line-through">
                ₹{priceNum.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy-light hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 hover:border-slate-500 transition"
        >
          <span>View Course</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
