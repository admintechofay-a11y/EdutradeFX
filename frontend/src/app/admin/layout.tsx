'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (mounted && !isLoading) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/admin/login?redirect=' + encodeURIComponent(pathname));
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl max-w-md">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Administrative Access Required</h2>
          <p className="text-xs text-slate-400 mb-4">
            You do not have permission to access the platform governance portal.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold"
          >
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950 text-slate-100">
        {children}
      </main>
    </div>
  );
}
