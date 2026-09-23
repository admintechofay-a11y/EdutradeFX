'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';

export default function TutorDashboardPage() {
  const tutorCourses = MOCK_COURSES;
  const totalStudents = tutorCourses.reduce((acc, c) => acc + c.studentsEnrolled, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            Tutor Academy Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Instructor Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Forex curriculum, monitor student engagement, and publish new courses.
          </p>
        </div>

        <Link
          href="/tutor/courses/new"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-glow-gold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Active Courses
          </span>
          <span className="text-2xl font-black text-white block">{tutorCourses.length}</span>
          <span className="text-[11px] text-emerald-400 font-medium">All published & live</span>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            Enrolled Students
          </span>
          <span className="text-2xl font-black text-white block">{totalStudents.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400 font-medium">+142 this week</span>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" />
            Average Rating
          </span>
          <span className="text-2xl font-black text-amber-400 block">4.9 / 5.0</span>
          <span className="text-[11px] text-slate-400 font-medium">Across 850+ reviews</span>
        </div>

        <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Completion Rate
          </span>
          <span className="text-2xl font-black text-cyan-400 block">74.2%</span>
          <span className="text-[11px] text-slate-400 font-medium">Top decile benchmark</span>
        </div>
      </div>

      {/* Courses List Section */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Your Authored Courses</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage lessons, curriculum, and publication state</p>
          </div>
          <Link
            href="/tutor/courses"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            View Full Course List →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorCourses.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border border-slate-800 bg-brand-surface/50 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge-green text-[10px]">{c.level}</span>
                  <span className="badge-regulation text-[10px]">{c.category}</span>
                </div>

                <h3 className="text-base font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{c.studentsEnrolled.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{c.durationHours} hrs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                <Link
                  href={`/education/${c.slug}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                >
                  Preview
                </Link>
                <Link
                  href={`/tutor/courses/${c._id}/edit`}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                >
                  Edit Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
