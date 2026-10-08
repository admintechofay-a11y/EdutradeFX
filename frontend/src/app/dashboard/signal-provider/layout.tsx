'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function SignalProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Signals Overview', href: '/dashboard/signal-provider', icon: LayoutDashboard },
    { label: 'Signals Terminal', href: '/dashboard/signal-provider/signals', icon: Radio },
    { label: 'Subscribers / Inquiries', href: '/dashboard/signal-provider/enquiries', icon: Users },
    { label: 'Provider Profile', href: '/dashboard/signal-provider/profile', icon: ShieldCheck },
    { label: 'Account Settings', href: '/dashboard/signal-provider/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* SP Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] p-4">
        <div className="space-y-6">
          {/* Signal Provider Tag */}
          <div className="p-3.5 rounded-2xl bg-surface-tint border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green/10 text-green flex items-center justify-center font-bold text-sm">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-navy truncate">{user?.name || 'Signal Provider'}</div>
              <div className="text-[10px] uppercase font-bold text-green tracking-wider">
                Trading Desk
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue text-white shadow-sm'
                      : 'text-text-muted hover:text-navy hover:bg-surface-tint'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Exit */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold text-rose-500 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-surface text-text-body">
        {children}
      </main>
    </div>
  );
}
