'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Loader2, RefreshCw, Mail } from 'lucide-react';
import { api } from '../../../../lib/api';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setErrorMessage('Invalid verification token.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setSuccess(true);
        if (res.data?.message?.toLowerCase().includes('already')) {
          setIsAlreadyVerified(true);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Verification link is invalid or expired.';
        if (msg.toLowerCase().includes('already')) {
          setSuccess(true);
          setIsAlreadyVerified(true);
        } else {
          setErrorMessage(msg);
        }
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login?verified=true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendMessage(null);

    try {
      await api.post('/auth/resend-verification', { email: resendEmail.trim().toLowerCase() });
      setResendMessage('A fresh verification link has been sent to your email.');
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Failed to resend. Please check your email and try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 bg-surface-tint">
      <div className="w-full max-w-md bg-white border border-border p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-lift text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto mx-auto" />
        </Link>

        {loading ? (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-blue animate-spin mx-auto" />
            <h2 className="text-lg sm:text-xl font-bold text-text-heading">Activating Account...</h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Please wait while we verify your email token and finalize registration.
            </p>
          </div>
        ) : success ? (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green" />
            </div>

            <h2 className="text-2xl font-extrabold text-text-heading">
              {isAlreadyVerified ? 'Account Already Verified' : 'Email Verified Successfully!'}
            </h2>

            <p className="text-xs sm:text-sm text-text-body">
              {isAlreadyVerified
                ? 'Your email address is already verified. You can log in directly with your password.'
                : 'Your EdutradeFX account has been created and verified. You now have full access to our directory and courses.'}
            </p>

            <div className="p-3 bg-surface-tint rounded-xl text-xs text-text-muted">
              Redirecting to login in <strong className="text-navy">{countdown}s</strong>...
            </div>

            <Link
              href="/login?verified=true"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-orange hover:bg-orange-hover text-white rounded-full text-xs sm:text-sm font-bold transition shadow-soft min-h-[44px]"
            >
              <span>Continue to Login Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-2xl font-extrabold text-text-heading">Link Expired or Invalid</h2>
            <p className="text-xs sm:text-sm text-text-muted">{errorMessage}</p>

            {/* Resend Form */}
            <form onSubmit={handleResend} className="p-4 rounded-2xl bg-surface-tint border border-border text-left space-y-3">
              <label className="block text-xs font-semibold text-text-heading">
                Request a New Verification Link:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                />
              </div>

              {resendMessage && (
                <p className="text-[11px] text-blue font-medium">{resendMessage}</p>
              )}

              <button
                type="submit"
                disabled={resendLoading || !resendEmail}
                className="w-full py-2.5 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                <span>{resendLoading ? 'Sending...' : 'Send New Link'}</span>
              </button>
            </form>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-slate-50 text-text-heading rounded-full text-xs sm:text-sm font-semibold transition border border-border min-h-[44px]"
            >
              <span>Return to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
