'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState([
    {
      _id: 'tut-1',
      name: 'David Sutherland',
      email: 'david@edutradefx.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      coursesCount: 2,
      totalStudents: 3420,
      rating: 4.9,
      isVerified: true,
      status: 'active',
      joinedAt: 'Jan 2025',
    },
    {
      _id: 'tut-2',
      name: 'Elena Rostova',
      email: 'elena@edutradefx.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      coursesCount: 1,
      totalStudents: 2180,
      rating: 4.9,
      isVerified: true,
      status: 'active',
      joinedAt: 'Feb 2025',
    },
    {
      _id: 'tut-3',
      name: 'Jonathan Miller',
      email: 'jonathan@edutradefx.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      coursesCount: 1,
      totalStudents: 850,
      rating: 4.7,
      isVerified: false,
      status: 'pending_review',
      joinedAt: 'May 2026',
    },
  ]);

  const toggleVerification = (id: string) => {
    setTutors(
      tutors.map((t) => (t._id === id ? { ...t, isVerified: !t.isVerified } : t))
    );
  };

  const toggleStatus = (id: string) => {
    setTutors(
      tutors.map((t) =>
        t._id === id
          ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
          : t
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke this tutor account?')) {
      setTutors(tutors.filter((t) => t._id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Panel
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Tutor Accounts Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review instructor credentials, verify academic profiles, and monitor curriculum performance.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-surface/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Instructor</th>
                <th className="p-4">Authored Courses</th>
                <th className="p-4">Enrolled Students</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Verified Status</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tutors.map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white">{t.name}</h4>
                        <span className="text-[11px] text-slate-400">{t.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-white">
                    {t.coursesCount} Courses
                  </td>

                  <td className="p-4 text-slate-300 font-semibold">
                    {t.totalStudents.toLocaleString()}
                  </td>

                  <td className="p-4 font-bold text-amber-400">
                    ★ {t.rating}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleVerification(t._id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                        t.isVerified
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      }`}
                    >
                      {t.isVerified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {t.isVerified ? 'VERIFIED' : 'PENDING'}
                    </button>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(t._id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                        t.status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`mailto:${t.email}`}
                        className="p-2 rounded-lg bg-brand-surface border border-slate-700 text-slate-300 hover:text-white transition-all"
                        title="Email Tutor"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-2 rounded-lg bg-brand-surface border border-slate-700 text-rose-400 hover:border-rose-500/50 transition-all"
                        title="Revoke Tutor Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
