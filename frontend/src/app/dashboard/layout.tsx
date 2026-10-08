'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBodyScrollLock } from '../../lib/hooks/useBodyScrollLock';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  useBodyScrollLock(sidebarOpen);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen min-h-dvh bg-slate-50 flex flex-col">
      {/* Top Mobile/Tablet Bar (< lg) */}
      <div className="lg:hidden bg-white border-b border-border px-4 py-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logos/logo-color.svg" alt="EdutradeFX" className="h-7 w-auto" />
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-2 text-text-muted hover:text-text-heading hover:bg-slate-100 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (lg+) */}
        <div className="hidden lg:block shrink-0">
          <DashboardSidebar />
        </div>

        {/* Mobile/Tablet Sidebar Overlay (< lg) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <Link href="/" onClick={() => setSidebarOpen(false)}>
                  <img src="/logos/logo-color.svg" alt="EdutradeFX" className="h-6 w-auto" />
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="p-2 text-text-muted hover:text-text-heading rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 text-text-body">
          {children}
        </main>
      </div>
    </div>
  );
}
