'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import { api } from '../../../../lib/api';

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) return;
      try {
        await api.get(`/auth/verify-email/${token}`);
        setSuccess(true);
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-brand-navy">
      <div className="w-full max-w-md bg-brand-navy-card border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">
            Edutrade<span className="text-brand-blue">FX</span>
          </span>
        </Link>

        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Verifying your email...</h2>
            <p className="text-xs text-slate-400">Please wait while we confirm your credentials.</p>
          </div>
        ) : success ? (
          <div className="py-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-xs text-slate-300">
              Your trading account is now fully verified. You can now access all verified courses, reviews, and community features.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/25"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-xs text-slate-400">{errorMessage}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <span>Return to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
