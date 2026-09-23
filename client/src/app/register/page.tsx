'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Briefcase,
  Radio,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { useAuth, UserRole, getRoleDefaultPath } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password criteria checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@$!%*?&#^_\-]/.test(password);
  const isMobileValid = /^[0-9]{10}$/.test(mobile.trim());
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

  const roles = [
    {
      id: 'user' as UserRole,
      title: 'Retail Trader',
      desc: 'Compare brokers & learn strategies',
      icon: User,
    },
    {
      id: 'broker' as UserRole,
      title: 'Forex Broker',
      desc: 'List company, regulation & get leads',
      icon: Briefcase,
    },
    {
      id: 'signal_provider' as UserRole,
      title: 'Signal Provider',
      desc: 'Publish trades, win-rate & signals',
      icon: Radio,
    },
    {
      id: 'tutor' as UserRole,
      title: 'Academy Tutor',
      desc: 'Publish courses & earn payouts',
      icon: GraduationCap,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Enter your full legal name');
      return;
    }

    if ((selectedRole === 'broker' || selectedRole === 'signal_provider') && !companyName.trim()) {
      setError(`Enter your ${selectedRole === 'broker' ? 'Brokerage / Entity' : 'Signal Service'} Name`);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }

    if (!isMobileValid) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters and meet complexity rules');
      return;
    }

    if (!consent) {
      setError('Accept the terms of service and risk disclaimer to proceed');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register(
      name,
      email,
      password,
      mobile.trim(),
      consent,
      selectedRole,
      companyName.trim()
    );
    setLoading(false);

    if (res.success) {
      const dest = getRoleDefaultPath(res.role || selectedRole);
      router.push(dest);
    } else {
      setError(res.message || 'Registration failed. This email or mobile may already be in use.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-gold to-accent-green p-0.5 mx-auto">
            <div className="w-full h-full bg-primary rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-gold" />
            </div>
          </div>
          <h1 className="text-2xl font-black font-heading text-text-primary">
            Join EduTradeFX Marketplace
          </h1>
          <p className="text-xs text-text-muted">
            Select your professional role to access your dedicated institutional workspace.
          </p>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col items-start transition-all ${
                    isSelected
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold ring-1 ring-accent-gold'
                      : 'border-border bg-primary/40 text-text-muted hover:border-text-muted/50 hover:bg-primary/70'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2 shrink-0" />
                  <span className="font-bold text-xs text-text-primary block leading-tight">
                    {r.title}
                  </span>
                  <span className="text-[10px] text-text-muted line-clamp-2 mt-1">
                    {r.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marcus Vance"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {(selectedRole === 'broker' || selectedRole === 'signal_provider') && (
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                {selectedRole === 'broker' ? 'Brokerage / Corporation Name' : 'Trading Brand / Provider Name'}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={selectedRole === 'broker' ? 'e.g. IC Markets Global' : 'e.g. Apex Alpha Signals'}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Mobile (10 digits)
                </label>
                {mobile && (
                  <span
                    className={`text-[11px] font-semibold ${
                      isMobileValid ? 'text-accent-green' : 'text-rose-400'
                    }`}
                  >
                    {isMobileValid ? '✓' : `${mobile.length}/10`}
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Checklist */}
          {password.length > 0 && (
            <div className="p-2.5 rounded-lg bg-primary/60 border border-border grid grid-cols-2 gap-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-text-muted" />
                )}
                <span className={hasMinLength ? 'text-text-primary' : 'text-text-muted'}>
                  8+ characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-text-muted" />
                )}
                <span className={hasUppercase ? 'text-text-primary' : 'text-text-muted'}>
                  1+ uppercase
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-text-muted" />
                )}
                <span className={hasNumber ? 'text-text-primary' : 'text-text-muted'}>
                  1+ number
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasSpecialChar ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-text-muted" />
                )}
                <span className={hasSpecialChar ? 'text-text-primary' : 'text-text-muted'}>
                  1+ special char
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 rounded border-border text-accent-gold focus:ring-accent-gold"
            />
            <label htmlFor="consent" className="text-xs text-text-muted leading-relaxed">
              I agree to the{' '}
              <Link href="/about" className="text-accent-gold hover:underline font-semibold">
                Terms of Service
              </Link>{' '}
              and acknowledge the high-risk nature of Forex & CFD marketplace participation.
            </label>
          </div>

          <Button
            type="submit"
            variant="gold"
            disabled={loading || !isPasswordValid || !isMobileValid || !consent}
            className="w-full text-xs uppercase tracking-wider font-bold gap-2 py-3 shadow-glow-gold"
          >
            {loading ? 'Creating Role Workspace...' : `Register as ${roles.find(r => r.id === selectedRole)?.title}`}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted pt-2 border-t border-border">
          Already registered?{' '}
          <Link href="/login" className="text-accent-gold font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
