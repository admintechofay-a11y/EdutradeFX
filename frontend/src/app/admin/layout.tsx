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
      <div className="min-h-screen bg-surface-tint flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-surface-tint flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white border border-border shadow-soft rounded-3xl max-w-md">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-text-heading mb-1">Administrative Access Required</h2>
          <p className="text-xs text-text-muted mb-4">
            You do not have permission to access the platform governance portal.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 bg-blue text-white rounded-full text-xs font-bold shadow-soft hover:bg-blue-hover transition"
          >
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-surface-tint flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-surface-tint text-text-body">
        {children}
      </main>
    </div>
  );
}
