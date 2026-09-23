'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Building2,
  BookOpen,
  Radio,
  MessageSquare,
  DollarSign,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Admin Command Center', href: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Broker Audits & Approvals', href: '/admin/brokers', icon: Building2 },
    { label: 'Course Quality Control', href: '/admin/courses', icon: BookOpen },
    { label: 'Tutor Payout Desk', href: '/admin/payouts', icon: DollarSign },
    { label: 'Trader Complaints Desk', href: '/admin/complaints', icon: MessageSquare },
    { label: 'Signal Providers', href: '/admin/signal-providers', icon: Radio },
    { label: 'Audit & Governance Logs', href: '/admin/audit-logs', icon: TrendingUp },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] p-4">
      <div className="space-y-6">
        {/* Brand Admin Tag */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-750 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-purple-500 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">
              Admin Console
            </div>
            <div className="text-[10px] text-slate-400">Master Governance</div>
          </div>
        </div>

        {/* Navigation items */}
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
                    ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
};
