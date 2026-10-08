'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 bg-surface-tint">
      <div className="w-full max-w-md bg-white border border-border p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lift text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto" />
        </Link>

        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="w-12 h-12 text-blue animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-text-heading">Verifying your email...</h2>
            <p className="text-xs text-text-muted">Please wait while we confirm your credentials.</p>
          </div>
        ) : success ? (
          <div className="py-6 space-y-4">
            <CheckCircle2 className="w-14 sm:w-16 h-14 sm:h-16 text-green mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold text-text-heading">Email Verified!</h2>
            <p className="text-xs sm:text-sm text-text-body">
              Your trading account is now fully verified. You can now access all verified courses, reviews, and community features.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange hover:bg-orange-hover text-white rounded-full text-xs sm:text-sm font-bold transition shadow-soft min-h-[44px]"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <XCircle className="w-14 sm:w-16 h-14 sm:h-16 text-red-500 mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold text-text-heading">Verification Failed</h2>
            <p className="text-xs text-text-muted">{errorMessage}</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-text-heading rounded-full text-xs sm:text-sm font-bold transition border border-border min-h-[44px]"
            >
              <span>Return to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
