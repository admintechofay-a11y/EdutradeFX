'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Scale,
  Briefcase,
  Radio,
  GraduationCap,
  Award,
  AlertTriangle,
  Mail,
  Users,
  Settings,
  Bell,
  LogOut,
  ExternalLink,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RoleGuard from '@/components/shared/RoleGuard';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
      ],
    },
    {
      groupTitle: 'Listings',
      items: [
        { label: 'Forex Brokers', href: '/admin/brokers', icon: Scale },
        { label: 'Account Managers', href: '/admin/account-managers', icon: Briefcase },
        { label: 'Signal Providers', href: '/admin/signal-providers', icon: Radio },
      ],
    },
    {
      groupTitle: 'LMS Academy',
      items: [
        { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
        { label: 'Tutors', href: '/admin/tutors', icon: Award },
        { label: 'Tutor Payouts', href: '/admin/payouts', icon: CreditCard },
      ],
    },
    {
      groupTitle: 'Mediation & Support',
      items: [
        { label: 'Mediation Desk', href: '/admin/complaints', icon: AlertTriangle },
        { label: 'Contact Enquiries', href: '/admin/enquiries', icon: Mail },
      ],
    },
    {
      groupTitle: 'Users',
      items: [
        { label: 'User Directory', href: '/admin/users', icon: Users },
      ],
    },
    {
      groupTitle: 'Settings',
      items: [
        { label: 'Site Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Determine current page title based on path
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Overview Dashboard';
    if (pathname.startsWith('/admin/audit-logs')) return 'Administrative Compliance Audit Trail';
    if (pathname.startsWith('/admin/payouts')) return 'Tutor Disbursement & Payout Desk';
    if (pathname.startsWith('/admin/brokers')) return 'Forex Brokers Directory';
    if (pathname.startsWith('/admin/account-managers')) return 'Account Managers (PAMM/MAM)';
    if (pathname.startsWith('/admin/signal-providers')) return 'Signal Providers & Feeds';
    if (pathname.startsWith('/admin/courses')) return 'LMS Academy Courses';
    if (pathname.startsWith('/admin/tutors')) return 'Tutor Accounts & Verification';
    if (pathname.startsWith('/admin/complaints')) return 'Forex Mediation & Dispute Desk';
    if (pathname.startsWith('/admin/enquiries')) return 'Contact Enquiries & Leads';
    if (pathname.startsWith('/admin/users')) return 'User & Role Management';
    if (pathname.startsWith('/admin/settings')) return 'Global Platform Settings';
    return 'Admin Management Panel';
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Fixed Left Sidebar: 240px width, hidden on mobile (< 768px) */}
      <aside className="hidden md:flex w-[240px] fixed top-0 bottom-0 left-0 z-40 bg-navy-deepest border-r border-navy-border flex-col justify-between">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo at top: same as public nav */}
          <div className="h-[64px] px-6 flex items-center border-b border-navy-border shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <Shield className="w-5 h-5 text-gold-primary shrink-0" />
              <span className="font-serif text-[22px] text-white tracking-tight leading-none">
                EduTrade<span className="text-gold-primary">FX</span>
              </span>
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-5 flex-1">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <span className="px-3 text-[11px] font-semibold text-text-muted-dark uppercase tracking-wider block">
                  {group.groupTitle}
                </span>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-sans text-[14px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[#C9A84C]/[0.12] text-gold-primary border-l-[3px] border-gold-primary rounded-l-none'
                            : 'text-text-muted-dark hover:text-white hover:bg-navy-surface'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Public site link + Logout */}
        <div className="p-3 border-t border-navy-border space-y-1 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-md font-sans text-[13px] text-text-muted-dark hover:text-white hover:bg-navy-surface transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gold-primary" />
              Public Portal
            </span>
            <span className="text-[11px] text-text-muted-dark font-mono">↗</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md font-sans text-[13px] text-text-muted-dark hover:text-danger hover:bg-navy-surface transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area Right: offset by 240px on desktop/tablet, full-width on mobile with bottom pad */}
      <div className="flex-1 ml-0 md:ml-[240px] flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Bar: bg: --color-white, border-bottom 1px #E2E8F0, height 64px */}
        <header className="h-[64px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Page Title Left: Inter 18px weight 700 */}
          <h1 className="font-sans text-[16px] sm:text-[18px] font-bold text-text-primary truncate max-w-[200px] sm:max-w-none">
            {getPageTitle()}
          </h1>

          {/* Right: notification bell + admin avatar + name */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell */}
            <button
              type="button"
              className="w-9 h-9 rounded-md border border-[#E2E8F0] bg-white text-text-secondary hover:text-text-primary flex items-center justify-center relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-primary" />
            </button>

            {/* Admin Avatar + Name */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-full bg-navy-deepest text-gold-primary flex items-center justify-center font-bold text-[13px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <strong className="font-sans text-[13px] font-bold text-text-primary leading-tight">
                  {user?.name || 'Administrator'}
                </strong>
                <span className="font-sans text-[11px] text-text-secondary leading-tight">
                  Compliance Officer
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area: bg: #F3F4F6 */}
        <main className="flex-1 bg-[#F3F4F6] p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (5 key sections only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-deepest border-t border-navy-border z-40 flex items-center justify-around px-2 shadow-modal">
        {[
          { label: 'Overview', href: '/admin', icon: LayoutDashboard },
          { label: 'Brokers', href: '/admin/brokers', icon: Scale },
          { label: 'Complaints', href: '/admin/complaints', icon: AlertTriangle },
          { label: 'LMS', href: '/admin/courses', icon: GraduationCap },
          { label: 'Settings', href: '/admin/settings', icon: Settings },
        ].map((tab) => {
          const isActive = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 rounded-md transition-colors ${
                isActive ? 'text-gold-primary font-bold' : 'text-text-muted-dark hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="font-sans text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
    </RoleGuard>
  );
}

