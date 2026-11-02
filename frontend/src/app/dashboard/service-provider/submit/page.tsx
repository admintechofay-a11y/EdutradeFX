'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';

export default function ProviderSubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [provider, setProvider] = useState<any>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [hasScrolledAgreement, setHasScrolledAgreement] = useState(false);

  const [declaredAccuracy, setDeclaredAccuracy] = useState(false);
  const [agreedCodeOfConduct, setAgreedCodeOfConduct] = useState(false);
  const [agreedNoDeceptiveTech, setAgreedNoDeceptiveTech] = useState(false);

  const agreementBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/service-providers/me'),
      api.get('/service-providers/agreements'),
    ])
      .then(([pRes, aRes]) => {
        if (pRes.data?.success) setProvider(pRes.data.data);
        if (aRes.data?.success) setAgreements(aRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleScroll = () => {
    if (agreementBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = agreementBoxRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        setHasScrolledAgreement(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasScrolledAgreement) {
      setError('Please scroll through and review the full Partner Agreement text.');
      return;
    }
    if (!declaredAccuracy || !agreedCodeOfConduct || !agreedNoDeceptiveTech) {
      setError('You must accept all required declarations before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/service-providers/me/submit', {
        declarations: {
          declaredAccuracy,
          agreedCodeOfConduct,
          agreedNoDeceptiveTech,
        },
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/service-provider'), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Submission failed. Please ensure all required sections are completed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  const isAlreadySubmitted = provider?.status === 'SUBMITTED' || provider?.status === 'UNDER_REVIEW';
  const isApproved = provider?.status === 'APPROVED';

  if (isApproved) {
    return (
      <PageContainer>
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Application Approved & Published</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your Solutions Provider profile is live. Any subsequent edits to products or categories will trigger an isolated re-review while your live profile remains online.
          </p>
          <div className="pt-2">
            <Button type="button" variant="primary" size="sm" onClick={() => router.push('/dashboard/service-provider')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isAlreadySubmitted || success) {
    return (
      <PageContainer>
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Application Successfully Submitted</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your application dossier (Ref: {provider?.applicationRef || 'APP-IN-REVIEW'}) has been locked
            and dispatched to compliance. You will receive an email update once verification is concluded.
          </p>
          <div className="pt-2">
            <Button type="button" variant="primary" size="sm" onClick={() => router.push('/dashboard/service-provider')}>
              View Dashboard Overview
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const primaryAgreement = agreements[0];

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Declaration & Submission
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Form 8: Code of conduct, technical disclosure warranties, and compliance submission.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scroll-Gate Agreement Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900">
              {primaryAgreement?.title || 'Solutions Provider Partner Agreement'}
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              Version {primaryAgreement?.version || 1}.0
            </span>
          </div>

          <div
            ref={agreementBoxRef}
            onScroll={handleScroll}
            className="h-64 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap"
          >
            {primaryAgreement?.body || `[DRAFT — replace with legal-approved text before launch]

1. DEFINITIONS AND SCOPE
1.1 The Solutions Provider agrees to provide truthful, accurate, and scientifically validated information regarding all listed products, bridge execution models, latency benchmarks, and algorithmic behaviors.

2. PROHIBITION OF DECEPTIVE AND REPAINTING ALGORITHMS
2.1 No trading tool, indicator, or automated execution system listed on EdutradeFX may engage in repainting, selective backtest omission, or deceptive marketing practices.
2.2 Disclosed performance metrics and backtest figures must cite exact sample periods, leverage assumptions, and testing environments.

3. INDEPENDENT PUBLICATION ARCHITECTURE
3.1 Approved category data is publicly listed. Submissions under review or undergoing modification will not affect currently published listings.
3.2 EdutradeFX reserves the right to suspend or remove any solution provider found in breach of regulatory standards or investor safety guidelines.`}
          </div>

          {!hasScrolledAgreement && (
            <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Please scroll to the bottom of the agreement above to unlock the checkboxes.
            </p>
          )}
        </div>

        {/* Mandatory Declarations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Mandatory Warranties & Declarations
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!hasScrolledAgreement}
                checked={declaredAccuracy}
                onChange={(e) => setDeclaredAccuracy(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 disabled:opacity-50"
              />
              <span>
                I certify under penalty of account termination that all corporate registrations, operational capabilities, platform integrations, and team backgrounds provided in this application are true and complete.
              </span>
            </label>

            <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!hasScrolledAgreement}
                checked={agreedNoDeceptiveTech}
                onChange={(e) => setAgreedNoDeceptiveTech(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 disabled:opacity-50"
              />
              <span>
                I warrant that none of our trading tools, algorithms, or signals utilize repainting methodologies, deceptive backtesting, or unregistered regulatory activities.
              </span>
            </label>

            <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!hasScrolledAgreement}
                checked={agreedCodeOfConduct}
                onChange={(e) => setAgreedCodeOfConduct(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 disabled:opacity-50"
              />
              <span>
                I formally accept the EdutradeFX Partner Agreement and authorize compliance to inspect and verify all submitted documentation.
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={
              submitting ||
              !hasScrolledAgreement ||
              !declaredAccuracy ||
              !agreedNoDeceptiveTech ||
              !agreedCodeOfConduct
            }
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] justify-center"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            <span>Submit Application Dossier</span>
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

