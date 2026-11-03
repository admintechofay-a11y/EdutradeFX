'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

interface DemoAccountItem {
  key: string;
  role: string;
  label: string;
  email: string;
  hint?: string;
  badgeColor?: string;
  caption?: string;
}

const DEFAULT_DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    key: 'admin',
    role: 'ADMIN',
    label: 'Admin',
    email: 'admin@edutradefx.com',
    badgeColor: 'bg-red-50 text-red-700 border-red-200 hover:border-red-400',
    caption: 'Compliance & review queues',
  },
  {
    key: 'broker',
    role: 'BROKER',
    label: 'Broker',
    email: 'broker@edutradefx.com',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400',
    caption: 'Pepperstone profile & leads',
  },
  {
    key: 'accountmanager',
    role: 'ACCOUNT_MANAGER',
    label: 'Account Mgr',
    email: 'accountmanager@edutradefx.com',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400',
    caption: 'AUM & PAMM performance',
  },
  {
    key: 'signals',
    role: 'SIGNAL_PROVIDER',
    label: 'Signal Provider',
    email: 'signals@edutradefx.com',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400',
    caption: 'Alpha Trades signals & win rates',
  },
  {
    key: 'solutions',
    role: 'SERVICE_PROVIDER',
    label: 'Solutions Provider',
    email: 'solutions@edutradefx.com',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400',
    caption: 'Demo Solutions Ltd: 3 cats & 2 prods',
  },
  {
    key: 'tutor',
    role: 'TUTOR',
    label: 'Tutor',
    email: 'tutor@edutradefx.com',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400',
    caption: 'Courses, students & payouts',
  },
  {
    key: 'trader',
    role: 'STUDENT',
    label: 'Trader',
    email: 'trader@edutradefx.com',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400',
    caption: 'Academy learning & bookmarks',
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [demoAccounts, setDemoAccounts] = useState<DemoAccountItem[]>(DEFAULT_DEMO_ACCOUNTS);
  const [demoPassword, setDemoPassword] = useState('Demo@1234!');
  const [activeDemoKey, setActiveDemoKey] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    api
      .get('/auth/demo-accounts')
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data;
        if (data && data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setDemoAccounts(data.accounts);
          if (data.password) setDemoPassword(data.password);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_DEMO_ACCOUNTS silently so demo cards ALWAYS remain visible
      });

    return () => {
      mounted = false;
    };
  }, []);

  const routeByRole = (role?: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'SERVICE_PROVIDER') {
      router.push('/dashboard/service-provider');
    } else if (role === 'BROKER') {
      router.push('/dashboard/broker');
    } else if (role === 'ACCOUNT_MANAGER') {
      router.push('/dashboard/account-manager');
    } else if (role === 'SIGNAL_PROVIDER') {
      router.push('/dashboard/signal-provider');
    } else if (role === 'TUTOR') {
      router.push('/dashboard/tutor');
    } else {
      router.push('/dashboard');
    }
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        identifier: loginEmail.trim(),
        password: loginPass,
      });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      routeByRole(user.role);
    } catch (err: any) {
      setError(
        err.message ||
          err.response?.data?.message ||
          'Invalid credentials. Please verify your email/phone and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(identifier, password);
  };

  const handleSelectDemo = (demo: DemoAccountItem, autoSignIn: boolean = false) => {
    setIdentifier(demo.email);
    setPassword(demoPassword);
    setActiveDemoKey(demo.key);
    setError(null);

    if (autoSignIn) {
      executeLogin(demo.email, demoPassword);
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 sm:space-y-6 bg-white border border-border p-5 sm:p-8 md:p-9 rounded-2xl sm:rounded-3xl shadow-lift">
      {/* Brand Logo & Heading */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto" />
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-text-heading">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Access your verified trading dashboard & academy courses
        </p>
      </div>

      {searchParams.get('registered') === 'true' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>Registration successful! Your account is active. Please log in with your credentials.</span>
        </div>
      )}

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
              onChange={(e) => {
                setIdentifier(e.target.value);
                setActiveDemoKey(null);
              }}
              placeholder="e.g. solutions@edutradefx.com"
              className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-border rounded-xl text-sm focus:outline-none focus:border-blue transition bg-surface-tint"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-blue hover:text-blue-hover transition inline-block py-1"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              className="w-full pl-10 pr-12 py-3 sm:py-3.5 border border-border rounded-xl text-sm focus:outline-none focus:border-blue transition bg-surface-tint"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Test Accounts Quick-Fill Section - ALWAYS VISIBLE */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Demo Test Accounts (1-Click Fill)
          </span>
          <span className="text-[10px] text-text-muted font-mono bg-surface-tint px-2 py-0.5 rounded border border-border">
            Pass: {demoPassword}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {demoAccounts.map((demo, idx) => {
            const isLastOdd = idx === demoAccounts.length - 1 && demoAccounts.length % 2 === 1;
            const isSelected = activeDemoKey === demo.key;
            return (
              <button
                key={demo.key || demo.email}
                type="button"
                onClick={() => handleSelectDemo(demo, false)}
                className={`p-2 min-h-[52px] rounded-xl border text-[11px] font-bold text-left transition relative flex flex-col justify-center ${
                  demo.badgeColor || 'bg-slate-50 text-slate-700 border-slate-200'
                } ${isSelected ? 'ring-2 ring-blue-500 shadow-xs' : 'hover:scale-[1.02]'} ${
                  isLastOdd ? 'col-span-2 sm:col-span-1' : ''
                }`}
                title={`Click to fill ${demo.email}`}
              >
                <div className="truncate font-extrabold flex items-center justify-between gap-1">
                  <span>{demo.label}</span>
                  {isSelected && <Zap className="w-3 h-3 text-blue-600 shrink-0" />}
                </div>
                <div className="text-[9px] opacity-75 truncate">{demo.email.split('@')[0]}</div>
              </button>
            );
          })}
        </div>

        {/* Quick Launch Direct Button when a demo account is selected */}
        {activeDemoKey && (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const selected = demoAccounts.find((a) => a.key === activeDemoKey);
              if (selected) executeLogin(selected.email, demoPassword);
            }}
            className="w-full py-2.5 px-4 bg-navy hover:bg-navy-deep text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Instant 1-Click Launch as{' '}
              {demoAccounts.find((a) => a.key === activeDemoKey)?.label}
            </span>
          </button>
        )}

        <div className="pt-1 text-center">
          <Link
            href="/demo"
            className="text-[11px] font-semibold text-blue hover:text-blue-hover transition inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Explore full interactive Demo Showcase & Hub →</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 border-t border-border text-xs text-text-muted">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold text-blue hover:text-blue-hover transition inline-block py-1"
        >
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
