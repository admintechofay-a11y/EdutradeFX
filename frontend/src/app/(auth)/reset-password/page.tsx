'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or expired reset link.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-brand-navy-card border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">
            Edutrade<span className="text-brand-blue">FX</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-white">Choose New Password</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Ensure your account uses a secure combination of characters
        </p>
      </div>

      {success ? (
        <div className="text-center py-6 space-y-3">
          <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Password Updated!</h3>
          <p className="text-xs text-slate-300">
            Your password has been changed. Redirecting to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-brand-navy">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-12 bg-brand-navy-card border border-slate-800 rounded-3xl flex justify-center">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
          </div>
        }
      >
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
