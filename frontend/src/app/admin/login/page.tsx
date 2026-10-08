'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/admin';

  const { setAuth, logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;

      if (user.role !== 'ADMIN') {
        logout();
        setError('Access denied: Account is not authorized for administrative governance.');
        setLoading(false);
        return;
      }

      setAuth(user, accessToken, refreshToken);
      router.push(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Terminal Header Card */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-3xl bg-white border border-border text-blue shadow-soft mb-4">
          <ShieldCheck className="w-10 h-10 text-blue" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-navy uppercase">
          EduTrade<span className="text-orange">FX</span> Portal
        </h1>
        <p className="text-xs text-text-muted mt-1 font-mono tracking-wide">
          Platform Operations & Compliance Console
        </p>
      </div>

      {/* Auth Box */}
      <div className="bg-white border border-border rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border text-text-muted font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
          <span>SECURE ADMINISTRATIVE GATEWAY</span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-2">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edutradefx.com"
                className="w-full bg-surface-tint border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading mb-2">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface-tint border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-blue hover:bg-blue-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Authenticate & Access Command Center</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-[11px] text-text-muted">
            Restricted terminal. Unauthorized login attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-surface-tint flex flex-col justify-center items-center p-4 selection:bg-blue selection:text-white relative">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange/10 rounded-full blur-3xl"></div>
      </div>

      <Suspense fallback={<div className="text-text-muted text-xs">Loading terminal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
