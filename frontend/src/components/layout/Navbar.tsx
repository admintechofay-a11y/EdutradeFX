'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0A0F1E]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-all">
            <TrendingUp size={20} className="stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Edutrade<span className="text-blue-500">FX</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-400 bg-slate-800/80 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Comparison Bar Indicator */}
          {selectedBrokerIds.length > 0 && (
            <Link
              href="/brokers/compare"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-950 border border-blue-600/60 text-blue-400 hover:bg-blue-900/60 transition-all"
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
                  className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl glass-modal shadow-2xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[10px] font-semibold text-brand-blue hover:underline"
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
                                ? 'hover:bg-slate-800/50 text-slate-400'
                                : 'bg-slate-800/60 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-xs font-bold truncate">{n.title}</span>
                              <span className="text-[9px] text-slate-500 shrink-0">
                                {new Date(n.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications found.
                      </div>
                    )}

                    <div className="pt-2 mt-2 border-t border-slate-800 text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition"
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
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-slate-800/70 border border-slate-700/60 hover:bg-slate-700/70 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-200 max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl glass-modal shadow-xl border border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-gray-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-900/50 text-blue-300 border border-blue-800/50">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-blue-400" />
                      Dashboard
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-amber-400 hover:bg-slate-800/80 transition-colors"
                      >
                        <ShieldCheck size={14} />
                        Admin Control Panel
                      </Link>
                    )}

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <UserIcon size={14} />
                      My Profile
                    </Link>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-slate-800/80 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-xs font-semibold text-gray-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-glow transition-all"
              >
                Join Platform
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          {selectedBrokerIds.length > 0 && (
            <Link
              href="/brokers/compare"
              className="p-1.5 rounded-md bg-blue-950 text-blue-400 text-xs font-bold"
            >
              <Scale size={16} />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0A0F1E] px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-blue-400 font-semibold bg-slate-900"
                >
                  <LayoutDashboard size={16} />
                  Dashboard ({user.role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-rose-400 hover:bg-slate-900"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-md text-xs font-semibold text-gray-200 border border-slate-700 bg-slate-800"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-600"
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
