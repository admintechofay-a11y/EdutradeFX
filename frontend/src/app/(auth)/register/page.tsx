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
  Phone,
  Building2,
  Users,
  Radio,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Role } from '../../../types';
import { useAuthStore } from '../../../store/authStore';

export default function RegisterPage() {
  const router = useRouter();

  // Mode: 'TRADER' (Standard SOW Section 2 registration) or 'PARTNER' (Institutional application)
  const [mode, setMode] = useState<'TRADER' | 'PARTNER'>('TRADER');
  const [partnerRole, setPartnerRole] = useState<Role>('BROKER');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { setAuth } = useAuthStore();

  const partnerOptions = [
    { role: 'BROKER' as Role, label: 'Brokerage Firm', desc: 'List your regulated brokerage & acquire verified trader leads', icon: Building2 },
    { role: 'ACCOUNT_MANAGER' as Role, label: 'Account Manager', desc: 'Offer audited PAMM / MAM portfolio management', icon: Users },
    { role: 'SIGNAL_PROVIDER' as Role, label: 'Signal Provider', desc: 'Publish audited trading signals & execution analytics', icon: Radio },
    { role: 'TUTOR' as Role, label: 'Course Instructor', desc: 'Create Academy masterclasses & monetize lessons', icon: GraduationCap },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('You must accept the Terms of Service, Privacy Policy, and High-Risk Investment Warning.');
      return;
    }

    if (!phone || phone.trim().length < 7) {
      setError('A valid mobile phone number with country code is required for account security.');
      return;
    }

    setLoading(true);

    try {
      const isPartner = mode === 'PARTNER';
      const endpoint = isPartner ? '/auth/register-partner' : '/auth/register';
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        consent: true,
      };

      if (isPartner) {
        payload.role = partnerRole;
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
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-brand-navy">
      <div className="w-full max-w-xl space-y-6 bg-brand-navy-card border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        
        {/* Brand Logo & Heading */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              EduTrade<span className="text-brand-blue">FX</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Create Your Account</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access verified broker audits, institutional courses, and dispute protection
          </p>
        </div>

        {/* Account Mode Toggle (Trader vs Partner) */}
        <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('TRADER')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              mode === 'TRADER'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Trader Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('PARTNER')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              mode === 'PARTNER'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Institutional Partner</span>
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div className="text-xs sm:text-sm">
              Account created successfully! Redirecting...
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

        {/* Partner Role Picker (Only shown in Institutional Partner mode) */}
        {mode === 'PARTNER' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Institutional Entity Type:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {partnerOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = partnerRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setPartnerRole(opt.role)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-brand-blue/15 border-brand-blue text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
              Institutional partner applications require compliance verification before public listing activation.
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              {mode === 'PARTNER' ? 'Entity / Representative Full Name *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7911 123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password (Min 8 characters) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
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

          {/* Mandatory Consent Checkbox (SOW Section 2 Requirement) */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-brand-blue bg-slate-800 border-slate-700 focus:ring-brand-blue"
              />
              <span className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-brand-blue hover:underline font-semibold">
                  Terms of Service
                </Link>
                ,{' '}
                <Link href="/privacy" target="_blank" className="text-brand-blue hover:underline font-semibold">
                  Privacy Policy
                </Link>
                , and acknowledge the{' '}
                <Link href="/risk-disclaimer" target="_blank" className="text-red-400 hover:underline font-semibold">
                  High-Risk Investment Warning
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-brand-cyan hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : (mode === 'PARTNER' ? 'Submit Partner Application' : 'Create Free Trader Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-blue hover:text-brand-cyan transition">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
