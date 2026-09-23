'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Users,
  Radio,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Role } from '../../../types';
import { useAuthStore } from '../../../store/authStore';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { setAuth } = useAuthStore();

  const roleCards: { role: Role; label: string; desc: string; icon: any }[] = [
    {
      role: 'STUDENT',
      label: 'Student / Trader',
      desc: 'Learn strategies, compare brokers & review',
      icon: GraduationCap,
    },
    {
      role: 'BROKER',
      label: 'Brokerage Firm',
      desc: 'List company, verify licenses & acquire leads',
      icon: Building2,
    },
    {
      role: 'ACCOUNT_MANAGER',
      label: 'Account Manager',
      desc: 'Offer PAMM / MAM portfolio services',
      icon: Users,
    },
    {
      role: 'SIGNAL_PROVIDER',
      label: 'Signal Provider',
      desc: 'Publish audited trading calls & alerts',
      icon: Radio,
    },
    {
      role: 'TUTOR',
      label: 'Course Instructor',
      desc: 'Create masterclasses & monetize lessons',
      icon: User,
    },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isPartner = role !== 'STUDENT';
      const endpoint = isPartner ? '/auth/register-partner' : '/auth/register';
      const payload: any = {
        name,
        email,
        password,
        phone: phone || undefined,
      };

      if (isPartner) {
        payload.role = role;
      }

      const res = await api.post(endpoint, payload);
      const data = res.data?.data;

      if (data?.accessToken && data?.user) {
        setAuth(data.user, data.accessToken, data.refreshToken);
      }
      setSuccess(true);

      setTimeout(() => {
        if (isPartner) {
          router.push('/login?registered=partner');
        } else {
          router.push('/login?registered=student');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-brand-navy">
      <div className="w-full max-w-2xl space-y-8 bg-brand-navy-card border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        {/* Brand Logo & Heading */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Edutrade<span className="text-brand-blue">FX</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Join the Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose your role and get started with verified financial intelligence
          </p>
        </div>

        {/* Success Modal / Banner */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div className="text-xs sm:text-sm">
              Account created successfully! Redirecting to your dashboard...
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            I am joining as a:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleCards.map((c) => {
              const Icon = c.icon;
              const isSelected = role === c.role;
              return (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => setRole(c.role)}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-brand-blue/15 border-brand-blue text-white shadow-md'
                      : 'bg-brand-navy-light/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-brand-blue text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {c.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {c.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name / Legal Entity
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
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
                  className="w-full pl-10 pr-10 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-blue"
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
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 019 283"
                className="w-full px-4 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            By creating an account, you agree to EdutradeFX{' '}
            <Link href="/terms" className="text-brand-blue hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-blue hover:underline">
              Privacy Policy
            </Link>
            .
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-brand-blue hover:text-blue-400 transition">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
