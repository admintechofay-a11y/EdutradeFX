'use client';

import React, { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { Enrollment } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      try {
        const res = await api.get('/courses/enrollments/my');
        const completed = (res.data?.data || []).filter((e: Enrollment) => e.certificateIssued);
        setCertificates(completed);
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Earned Certificates</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Official EdutradeFX verification of your trading education milestones and strategy mastery.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center text-brand-amber">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{cert.course?.title}</h3>
                    <div className="text-xs text-slate-400">EdutradeFX Certified Trader</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div className="text-xs text-slate-400">
                Issued on: {new Date(cert.enrolledAt).toLocaleDateString()}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => alert(`Certificate ID: FX-${cert.id.substring(0, 8).toUpperCase()}`)}
                  className="px-4 py-2 rounded-xl bg-brand-navy-light text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify Authenticity</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Certificates Earned Yet"
          description="Complete 100% of the lessons in an academy course to unlock your verified certificate of completion."
          actionLabel="Go to Enrolled Courses"
          onAction={() => (window.location.href = '/dashboard/enrollments')}
        />
      )}
    </div>
  );
}
