'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function BrokerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Firm Overview', href: '/dashboard/broker', icon: LayoutDashboard },
    { label: 'Firm Profile', href: '/dashboard/broker/profile', icon: Building2 },
    { label: 'Inbound Leads', href: '/dashboard/broker/leads', icon: Users },
    { label: 'Reviews & Reputation', href: '/dashboard/broker/reviews', icon: MessageSquare },
    { label: 'Firm Settings', href: '/dashboard/broker/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-navy-dark flex">
      {/* Dedicated Broker Sidebar */}
      <aside className="w-64 bg-brand-navy-card border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] p-4">
        <div className="space-y-6">
          {/* Firm Badge */}
          <div className="p-3.5 rounded-2xl bg-brand-navy-light/60 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user?.name || 'Broker Partner'}</div>
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Broker Portal
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-brand-navy-light/40'
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
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-brand-navy-dark text-slate-100">
        {children}
      </main>
    </div>
  );
}
