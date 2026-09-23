'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Lock, Mail, ArrowRight, ShieldCheck, Briefcase, Radio, GraduationCap, User, Loader2 } from 'lucide-react';
import { useAuth, getRoleDefaultPath } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickRoles = [
    { label: 'Admin', email: 'admin@edutradefx.com', pass: 'Admin@123456', icon: ShieldCheck, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { label: 'Broker', email: 'broker@icmarkets.com', pass: 'Broker@123456', icon: Briefcase, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { label: 'Signal Provider', email: 'provider@apexsignals.com', pass: 'Signal@123456', icon: Radio, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Tutor', email: 'tutor@edutradefx.com', pass: 'Tutor@123456', icon: GraduationCap, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { label: 'Trader', email: 'trader@edutradefx.com', pass: 'Trader@123456', icon: User, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  ];

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }

    if (!password) {
      setError('Enter your password');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        const dest = getRoleDefaultPath(res.role);
        router.push(dest);
      }
    } else {
      setError(res.message || 'Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full rounded-3xl glass-card border border-slate-800 p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 mx-auto">
            <div className="w-full h-full bg-brand-darkest rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Institutional Sign In</h1>
          <p className="text-xs text-slate-400">
            Access your verified multi-role portal and dashboards
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-gold disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Test Accounts Switcher */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Fill Demo Credentials
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {quickRoles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handleQuickFill(r.email, r.pass)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all hover:scale-105 ${r.color}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Don’t have an account?{' '}
          <Link href="/register" className="text-amber-400 font-bold hover:underline">
            Register New Role
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-text-muted-dark">
          <Loader2 className="w-8 h-8 text-gold-primary animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
