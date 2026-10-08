'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, Loader2, Menu, X, ShieldCheck } from 'lucide-react';
import { useBodyScrollLock } from '../../lib/hooks/useBodyScrollLock';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useBodyScrollLock(sidebarOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
    <div className="min-h-screen min-h-dvh bg-surface-tint flex flex-col">
      {/* Top Mobile/Tablet Bar (< lg) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-blue to-purple-500 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Admin Console
          </span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (lg+) */}
        <div className="hidden lg:block shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile/Tablet Sidebar Drawer Overlay (< lg) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 w-72 max-w-[85vw] bg-slate-900 h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-brand-blue to-purple-500 flex items-center justify-center text-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Admin Portal
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close admin menu"
                  className="p-2 text-slate-400 hover:text-white rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-tint text-text-body">
          {children}
        </main>
      </div>
    </div>
  );
}
