'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radio,
  LayoutDashboard,
  Zap,
  Users,
  Settings,
  Star,
  ExternalLink,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RoleGuard from '@/components/shared/RoleGuard';

export default function SignalProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview & Stats', href: '/dashboard/signal-provider', icon: LayoutDashboard },
    { label: 'Trade Signals (BUY/SELL)', href: '/dashboard/signal-provider/signals', icon: Zap },
    { label: 'Subscribers & Leads', href: '/dashboard/signal-provider/subscribers', icon: Users },
    { label: 'Strategy & Disclosures', href: '/dashboard/signal-provider/profile', icon: Settings },
  ];

  return (
    <RoleGuard allowedRoles={['signal_provider', 'admin']}>
      <div className="min-h-screen bg-navy-deepest flex flex-col md:flex-row text-white">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-navy-surface border-r border-navy-border flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-navy-border">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-primary" />
                <span className="font-serif text-lg font-bold text-white tracking-tight">
                  EduTrade<span className="text-gold-primary">FX</span>
                </span>
              </Link>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SIGNALS
              </span>
            </div>

            {/* Provider Snippet */}
            <div className="p-4 border-b border-navy-border bg-navy-deepest/50">
              <div className="text-xs text-text-muted-dark uppercase tracking-wider font-semibold mb-1">
                Signal Desk
              </div>
              <div className="font-bold text-sm text-white truncate">
                {user?.companyName || user?.name || 'Verified Alpha Provider'}
              </div>
              <div className="text-xs text-text-muted-dark truncate">{user?.email}</div>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard/signal-provider'
                    ? pathname === '/dashboard/signal-provider'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 rounded-l-none'
                        : 'text-text-muted-dark hover:text-white hover:bg-navy-deepest'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-navy-border space-y-2">
            <Link
              href="/signal-providers"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-text-muted-dark hover:text-white hover:bg-navy-deepest transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-gold-primary" />
                Public Directory
              </span>
              <span>↗</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 bg-brand-darkest flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto flex-1">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
