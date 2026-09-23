'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Save,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Forex Basics');
  const [level, setLevel] = useState('Beginner');
  const [price, setPrice] = useState('0');
  const [durationHours, setDurationHours] = useState('3.5');
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
  );
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Forex Basics',
    'Technical Analysis',
    'Price Action',
    'Risk Management',
    'EA & Algorithms',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Masterclass'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.createCourse({
        title,
        description,
        category,
        level: level.toLowerCase(),
        price: parseFloat(price) || 0,
        durationHours: parseFloat(durationHours) || 2,
        thumbnail,
      });

      if (res && res.success === false) {
        setErrorMsg(res.message || 'Failed to create course');
        return;
      }

      setCreated(true);
      setTimeout(() => {
        router.push('/tutor/courses');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error creating course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/tutor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Create New Course</h1>
        <p className="text-xs text-slate-400 mt-1">
          Author a new institutional trading course for the EduTradeFX Academy.
        </p>
      </div>

      {created && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Course created successfully. Redirecting to course management.
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center gap-2">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Course Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Institutional Order Flow & Liquidity Mechanics"
            className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Experience Level <span className="text-rose-400">*</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Price ($ USD) — Enter 0 for Free
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estimated Duration (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              min={0.5}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Course Thumbnail Image URL
          </label>
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Course Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            placeholder="Provide a comprehensive curriculum overview, prerequisites, and learning objectives..."
            className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-gold disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Creating Course...' : 'Save & Publish Course'}
        </button>
      </form>
    </div>
  );
}
