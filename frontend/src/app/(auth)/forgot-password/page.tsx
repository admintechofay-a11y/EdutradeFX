'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-tint">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white border border-border p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lift">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-text-heading">Reset Password</h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-14 h-14 text-green mx-auto" />
            <h3 className="text-lg font-bold text-text-heading">Check Your Email</h3>
            <p className="text-xs text-text-body">
              We've dispatched password reset instructions to <strong className="text-text-heading">{email}</strong> if an account exists.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue hover:text-blue-hover transition min-h-[40px] px-4 py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-orange hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-sm rounded-full transition shadow-soft flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-blue transition min-h-[36px] py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
