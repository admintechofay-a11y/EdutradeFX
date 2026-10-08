'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen min-h-dvh bg-slate-50 flex flex-col">
      {/* Top Mobile Bar */}
      <div className="md:hidden bg-white border-b border-border p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logos/logo-color.svg" alt="EdutradeFX" className="h-7 w-auto" />
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-text-muted hover:text-text-heading"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-50 w-64 bg-white">
              <DashboardSidebar />
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
