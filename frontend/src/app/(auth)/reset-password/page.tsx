'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '../../../components/common/PasswordStrengthMeter';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    const { isSufficient } = evaluatePasswordStrength(password);
    if (!isSufficient) {
      setError('Password is too weak. Please meet all password requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2500);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 429) {
        setError('Too many attempts. Please wait 15 minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Password reset link has expired or is invalid. Please request a new one.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white border border-border p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lift">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-text-heading">Choose New Password</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Create a strong password to protect your trading account
        </p>
      </div>

      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-green flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green" />
          </div>
          <h2 className="text-xl font-bold text-text-heading">Password Updated!</h2>
          <p className="text-xs sm:text-sm text-text-body">
            Your password has been changed and all previous sessions revoked. Redirecting to login...
          </p>
          <Link
            href="/login?reset=success"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange hover:bg-orange-hover text-white rounded-full text-xs sm:text-sm font-bold transition shadow-soft min-h-[44px]"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
              New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-heading min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Strength Meter */}
            <PasswordStrengthMeter
              password={password}
              onStrengthChange={(isStrong) => setIsPasswordStrong(isStrong)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-12 py-2.5 sm:py-3 bg-white border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:ring-1 transition ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-border focus:border-blue focus:ring-blue'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-heading min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-[11px] text-red-500 font-medium">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordStrong || confirmPassword !== password}
            className="w-full py-3.5 sm:py-4 bg-orange hover:bg-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-full transition shadow-soft flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-text-muted hover:text-blue font-semibold transition"
            >
              Remember your password? Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-tint">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 sm:p-12 bg-white border border-border rounded-2xl sm:rounded-3xl flex justify-center shadow-soft">
            <Loader2 className="w-8 h-8 text-blue animate-spin" />
          </div>
        }
      >
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
