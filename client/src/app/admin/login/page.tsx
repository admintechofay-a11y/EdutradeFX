'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@edutradefx.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.role !== 'admin') {
        setError('Access denied: You do not have platform administrator privileges.');
        return;
      }
      router.push('/admin');
    } else {
      setError(res.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-deepest flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-surface border border-gold-primary/30 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Institutional Admin Seal */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gold-primary/10 border-2 border-gold-primary flex items-center justify-center mx-auto shadow-glow-gold">
            <ShieldCheck className="w-8 h-8 text-gold-primary" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-primary font-bold">
              Institutional Clearance Level 5
            </span>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight mt-1">
              EduTrade<span className="text-gold-primary">FX</span> Admin Portal
            </h1>
            <p className="text-xs text-text-muted-dark mt-1">
              Strictly restricted to authorized compliance officers and platform operators.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted-dark uppercase tracking-wider mb-1.5">
              Admin Identity / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-dark" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edutradefx.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white placeholder:text-text-muted-dark focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark uppercase tracking-wider mb-1.5">
              Cryptographic Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-dark" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white placeholder:text-text-muted-dark focus:outline-none focus:border-gold-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-gold disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Authorize Administrator Session'}
            <KeyRound className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-navy-border text-center">
          <Link
            href="/"
            className="text-xs text-text-muted-dark hover:text-white transition-colors"
          >
            ← Return to Public Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
