'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { identifier: identifier.trim(), password });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Invalid credentials. Please verify your email/phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white border border-border p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lift">
      {/* Brand Logo & Heading */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto" />
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-text-heading">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Access your verified trading dashboard & academy courses
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
            Email Address or Mobile Number
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="trader@example.com or +447911123456"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-heading">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue hover:text-blue-hover transition font-medium min-h-[36px] flex items-center"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 sm:py-4 bg-orange hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-sm rounded-full transition shadow-soft flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer */}
      <div className="text-center pt-2 border-t border-border text-xs text-text-muted">
        Don't have an account?{' '}
        <Link href="/register" className="font-bold text-blue hover:text-blue-hover transition inline-block py-1">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-tint">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 sm:p-12 bg-white border border-border rounded-2xl sm:rounded-3xl flex justify-center shadow-soft">
            <Loader2 className="w-8 h-8 text-blue animate-spin" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
