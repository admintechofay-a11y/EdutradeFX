'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp,
  Menu,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ShieldCheck,
  Scale,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { NAV_LINKS } from '../../lib/constants';
import { api } from '../../lib/api';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const { selectedBrokerIds } = useCompareStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loadNotifications = () => {
    if (!isAuthenticated) return;
    api
      .get('/notifications')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setNotifications(res.data.data.slice(0, 5));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('/notifications/unread-count')
        .then((res) => setUnreadCount(res.data?.data?.unreadCount || 0))
        .catch(() => {});
      loadNotifications();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  const getDashboardHref = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TUTOR') return '/dashboard/tutor';
    if (user.role === 'SIGNAL_PROVIDER') return '/dashboard/signal-provider';
    if (user.role === 'BROKER') return '/dashboard/broker';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Left */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-12 w-44 sm:w-48 flex items-center">
            {/* Real Brand Logo from EdutradeFx2 */}
            <Image
              src="/logos/logo-color.svg"
              alt="EduTradeFX Logo"
              fill
              sizes="192px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Centered Desktop Nav Links with 2px blue underline on active */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-6 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'text-blue'
                    : 'text-text-body hover:text-blue'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue rounded-full animate-in fade-in duration-200" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search Icon */}
          <Link
            href="/brokers"
            aria-label="Search brokers and courses"
            className="p-2.5 rounded-full text-text-muted hover:text-blue hover:bg-surface-tint transition-all"
            title="Search ecosystem"
          >
            <Search size={19} />
          </Link>

          {/* Comparison Bar Indicator */}
          {selectedBrokerIds.length > 0 && (
            <Link
              href="/brokers/compare"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue hover:bg-blue-100 transition-all shadow-sm"
            >
              <Scale size={14} />
              Compare ({selectedBrokerIds.length}/4)
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 relative">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setDropdownOpen(false);
                    if (!notifDropdownOpen) loadNotifications();
                  }}
                  className="relative p-2.5 rounded-full text-text-body hover:text-blue hover:bg-surface-tint transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lift border border-border p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                      <span className="text-xs font-bold text-text-heading">Notifications</span>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-semibold text-blue hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    {notifications.length > 0 ? (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || '/dashboard/notifications'}
                            onClick={() => {
                              setNotifDropdownOpen(false);
                              api.patch(`/notifications/${n.id}/read`).catch(() => {});
                            }}
                            className={`block p-2.5 rounded-xl transition ${
                              n.isRead
                                ? 'hover:bg-slate-50 text-text-muted'
                                : 'bg-surface-tint hover:bg-blue-100/60 text-text-heading font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-xs font-bold truncate">{n.title}</span>
                              <span className="text-[10px] text-text-muted shrink-0">
                                {new Date(n.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-body line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-text-muted">
                        No notifications found.
                      </div>
                    )}

                    <div className="pt-2 mt-2 border-t border-border text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block w-full py-2 rounded-lg bg-surface-tint hover:bg-blue-100 text-[11px] font-bold text-blue transition"
                      >
                        Open Notification Center
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-surface-tint border border-border hover:border-blue/30 transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-text-heading max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-text-muted mr-1" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lift border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-bold text-text-heading truncate">{user.name}</p>
                      <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue border border-blue-200">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-body hover:text-blue hover:bg-surface-tint transition-colors"
                    >
                      <LayoutDashboard size={15} className="text-blue" />
                      Dashboard
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-orange hover:bg-orange-50 transition-colors"
                      >
                        <ShieldCheck size={15} />
                        Admin Control Panel
                      </Link>
                    )}

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-body hover:text-blue hover:bg-surface-tint transition-colors"
                    >
                      <UserIcon size={15} />
                      My Profile
                    </Link>

                    <div className="border-t border-border my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Outline Login */}
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-xs font-bold text-blue border-2 border-blue hover:bg-blue-50 transition-all shadow-sm"
              >
                Log In
              </Link>
              {/* Orange Register Pill */}
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-orange hover:bg-orange-hover shadow-soft hover:shadow-lift transition-all"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {selectedBrokerIds.length > 0 && (
            <Link
              href="/brokers/compare"
              className="p-2 rounded-full bg-blue-50 text-blue text-xs font-bold border border-blue-200"
            >
              <Scale size={16} />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-text-heading hover:bg-surface-tint"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-lift">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'text-blue bg-surface-tint'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-blue font-bold bg-surface-tint"
                >
                  <LayoutDashboard size={18} />
                  Dashboard ({user.role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-3 rounded-full text-xs font-bold text-blue border-2 border-blue bg-white hover:bg-blue-50"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-3 rounded-full text-xs font-bold text-white bg-orange hover:bg-orange-hover shadow-soft"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
