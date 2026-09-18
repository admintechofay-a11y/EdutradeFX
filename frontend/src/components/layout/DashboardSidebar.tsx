'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Bookmark,
  Users,
  Radio,
  Building2,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = user?.role || 'STUDENT';

  const getNavItems = (userRole: Role): NavItem[] => {
    switch (userRole) {
      case 'BROKER':
        return [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Firm Profile', href: '/dashboard/profile', icon: Building2 },
          { label: 'Inbound Leads', href: '/dashboard/leads', icon: Users },
          { label: 'Reviews & Reputation', href: '/dashboard/reviews', icon: MessageSquare },
          { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
        ];
      case 'ACCOUNT_MANAGER':
        return [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Manager Profile', href: '/dashboard/profile', icon: Users },
          { label: 'Investor Enquiries', href: '/dashboard/enquiries', icon: MessageSquare },
          { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
        ];
      case 'SIGNAL_PROVIDER':
        return [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Signals Terminal', href: '/dashboard/signals', icon: Radio },
          { label: 'Subscribers / Enquiries', href: '/dashboard/enquiries', icon: Users },
          { label: 'Provider Profile', href: '/dashboard/profile', icon: ShieldCheck },
          { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
        ];
      case 'TUTOR':
        return [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
          { label: 'Sales & Earnings', href: '/dashboard/earnings', icon: DollarSign },
          { label: 'Payout Requests', href: '/dashboard/payouts', icon: TrendingUp },
          { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
        ];
      case 'ADMIN':
        return [
          { label: 'Platform Portal', href: '/admin', icon: ShieldCheck },
          { label: 'User Management', href: '/admin/users', icon: Users },
          { label: 'Broker Approvals', href: '/admin/brokers', icon: Building2 },
          { label: 'Course Quality', href: '/admin/courses', icon: BookOpen },
          { label: 'Complaints Desk', href: '/admin/complaints', icon: MessageSquare },
          { label: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'STUDENT':
      default:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Enrolled Courses', href: '/dashboard/enrollments', icon: BookOpen },
          { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
          { label: 'Saved Brokers', href: '/dashboard/saved', icon: Bookmark },
          { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className="w-64 bg-brand-navy-card border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] p-4">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-brand-navy-light/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate">{user?.name || 'Trader'}</div>
            <div className="text-[10px] uppercase font-bold text-brand-amber tracking-wider">
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Nav list */}
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

      {/* Logout Action */}
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
  );
};
