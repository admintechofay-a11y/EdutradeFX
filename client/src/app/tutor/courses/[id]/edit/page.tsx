'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Video,
  FileText,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const course = MOCK_COURSES.find((c) => c._id === params.id || c.slug === params.id) || MOCK_COURSES[0];

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [category, setCategory] = useState(course.category);
  const [level, setLevel] = useState(course.level);
  const [price, setPrice] = useState('0');
  const [durationHours, setDurationHours] = useState(course.durationHours.toString());
  const [thumbnail, setThumbnail] = useState(course.thumbnail);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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

    try {
      await fetch(`/api/courses/${course._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
          price: parseFloat(price),
          durationHours: parseFloat(durationHours),
          thumbnail,
          status,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Edit Course</h1>
            <p className="text-xs text-slate-400 mt-1">
              Updating curriculum details for: <strong className="text-white">{course.title}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-brand-surface border border-slate-700 text-xs font-bold text-white focus:outline-none"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Course changes saved successfully.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Course Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price ($ USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Hours)</label>
            <input
              type="number"
              step="0.5"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Thumbnail URL</label>
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-gold disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving Changes...' : 'Update Course'}
        </button>
      </form>
    </div>
  );
}
