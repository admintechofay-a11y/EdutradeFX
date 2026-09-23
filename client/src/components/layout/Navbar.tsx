'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Scale,
  Briefcase,
  Radio,
  Layers,
  ChevronDown,
  X,
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { compareList } = useCompare();

  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const servicesRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isTutor = user?.role === 'tutor' || user?.role === 'admin';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const servicesList = [
    {
      label: 'Forex Brokers',
      href: '/brokers',
      icon: Scale,
      description: 'Regulated broker directory & safety audits',
    },
    {
      label: 'Account Managers',
      href: '/account-managers',
      icon: Briefcase,
      description: 'Audited PAMM & copy portfolios',
    },
    {
      label: 'Signal Providers',
      href: '/signal-providers',
      icon: Radio,
      description: 'Real-time verified trade alerts',
    },
    {
      label: 'Compare',
      href: '/compare',
      icon: Layers,
      description: 'Side-by-side spread and fee comparison',
      badge: compareList.length > 0 ? compareList.length : undefined,
    },
  ];

  const isServicesActive =
    pathname.startsWith('/brokers') ||
    pathname.startsWith('/account-managers') ||
    pathname.startsWith('/signal-providers') ||
    pathname.startsWith('/compare');

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-navy-deep border-b border-navy-border md:h-[68px] h-[60px] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* =================== LOGO (Left) =================== */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Shield className="w-5 h-5 text-gold-primary transition-transform group-hover:scale-105" />
          <span className="font-serif text-[22px] tracking-tight leading-none text-white flex items-center">
            EduTrade<span className="text-gold-primary">FX</span>
          </span>
        </Link>

        {/* =================== NAV LINKS (Center - Desktop) =================== */}
        <nav className="hidden md:flex items-center h-full gap-7">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              'h-full flex items-center font-sans text-[14px] font-medium transition-colors border-b-2',
              pathname === '/'
                ? 'text-gold-primary border-gold-primary'
                : 'text-text-on-dark border-transparent hover:text-gold-light'
            )}
          >
            Home
          </Link>

          {/* About */}
          <Link
            href="/about"
            className={cn(
              'h-full flex items-center font-sans text-[14px] font-medium transition-colors border-b-2',
              pathname === '/about'
                ? 'text-gold-primary border-gold-primary'
                : 'text-text-on-dark border-transparent hover:text-gold-light'
            )}
          >
            About
          </Link>

          {/* Services Dropdown */}
          <div
            className="relative h-full flex items-center"
            ref={servicesRef}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setServicesOpen((prev) => !prev);
              }}
              onMouseEnter={() => setServicesOpen(true)}
              className={cn(
                'h-full flex items-center gap-1.5 font-sans text-[14px] font-medium transition-colors border-b-2 cursor-pointer',
                isServicesActive
                  ? 'text-gold-primary border-gold-primary'
                  : 'text-text-on-dark border-transparent hover:text-gold-light'
              )}
              aria-expanded={servicesOpen}
            >
              <span>Services</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  servicesOpen && 'rotate-180'
                )}
              />
            </button>

            {servicesOpen && (
              <div
                className="absolute top-full left-0 w-80 rounded-md bg-navy-surface border border-navy-border shadow-modal p-2 z-50 animate-dropdown-open"
                onMouseEnter={() => setServicesOpen(true)}
              >
                {servicesList.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setServicesOpen(false)}
                      className={cn(
                        'flex items-start gap-3 p-2.5 rounded-md transition-colors group',
                        isActive
                          ? 'bg-navy-deep text-gold-primary'
                          : 'hover:bg-navy-deep text-text-on-dark'
                      )}
                    >
                      <div className="w-8 h-8 rounded-md bg-navy-deep flex items-center justify-center shrink-0 border border-navy-border group-hover:border-gold-primary/40 transition-colors">
                        <Icon className="w-4 h-4 text-gold-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[14px] font-semibold text-white group-hover:text-gold-light transition-colors">
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-sm bg-gold-primary text-navy-deepest">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-[12px] text-text-muted-dark leading-tight mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Education */}
          <Link
            href="/education"
            className={cn(
              'h-full flex items-center font-sans text-[14px] font-medium transition-colors border-b-2',
              pathname.startsWith('/education')
                ? 'text-gold-primary border-gold-primary'
                : 'text-text-on-dark border-transparent hover:text-gold-light'
            )}
          >
            Education
          </Link>

          {/* Complaint Box */}
          <Link
            href="/complaint-box"
            className={cn(
              'h-full flex items-center font-sans text-[14px] font-medium transition-colors border-b-2',
              pathname.startsWith('/complaint-box') || pathname.startsWith('/complaints')
                ? 'text-gold-primary border-gold-primary'
                : 'text-text-on-dark border-transparent hover:text-gold-light'
            )}
          >
            Complaint Box
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className={cn(
              'h-full flex items-center font-sans text-[14px] font-medium transition-colors border-b-2',
              pathname === '/contact'
                ? 'text-gold-primary border-gold-primary'
                : 'text-text-on-dark border-transparent hover:text-gold-light'
            )}
          >
            Contact
          </Link>
        </nav>

        {/* =================== AUTH BUTTONS (Right - Desktop) =================== */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div
              className="relative"
              ref={userDropdownRef}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen((prev) => !prev);
                }}
                onMouseEnter={() => setUserDropdownOpen(true)}
                className="flex items-center gap-2 h-9 px-3 rounded-md border border-navy-border bg-navy-surface hover:border-gold-primary/40 transition-colors cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-navy-deep border border-gold-primary/50 flex items-center justify-center text-gold-primary font-bold text-[11px]">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-sans text-[14px] font-medium text-text-on-dark max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted-dark" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md bg-navy-deep border border-navy-border shadow-modal py-2 z-50 animate-dropdown-open"
                  onMouseEnter={() => setUserDropdownOpen(true)}
                >
                  <div className="px-4 py-2 border-b border-navy-border">
                    <p className="font-sans text-[14px] font-semibold text-text-on-dark truncate">
                      {user.name}
                    </p>
                    <p className="font-sans text-[12px] text-text-muted-dark truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-micro uppercase font-semibold rounded-sm bg-gold-primary/10 text-gold-primary border border-gold-primary/30">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full px-4 py-2 font-sans text-[14px] text-text-muted-dark hover:text-text-on-dark hover:bg-navy-surface flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gold-primary" />
                    My Dashboard
                  </Link>

                  {isTutor && (
                    <Link
                      href="/tutor/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full px-4 py-2 font-sans text-[14px] text-text-muted-dark hover:text-text-on-dark hover:bg-navy-surface flex items-center gap-2 transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-gold-light" />
                      Tutor Command Center
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full px-4 py-2 font-sans text-[14px] text-text-muted-dark hover:text-text-on-dark hover:bg-navy-surface flex items-center gap-2 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-success" />
                      Admin Control Plane
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 font-sans text-[14px] text-danger hover:bg-danger/10 flex items-center gap-2 border-t border-navy-border mt-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Login: ghost button (border 1px --color-gold-muted, text --color-gold-primary) */}
              <Link href="/login">
                <button
                  type="button"
                  className="h-9 px-5 rounded-md border border-gold-muted text-gold-primary font-sans text-[14px] font-semibold hover:bg-gold-primary/10 transition-colors flex items-center justify-center"
                >
                  Login
                </button>
              </Link>

              {/* Register: filled button (bg --color-gold-primary, text --color-navy-deepest) */}
              <Link href="/register">
                <button
                  type="button"
                  className="h-9 px-5 rounded-md bg-gold-primary text-navy-deepest font-sans text-[14px] font-semibold hover:bg-gold-light transition-colors flex items-center justify-center"
                >
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* =================== MOBILE HAMBURGER (< 768px) =================== */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-gold-primary focus:outline-none"
            aria-label="Open Navigation Drawer"
          >
            {/* 3 lines hamburger icon in --color-gold-primary */}
            <div className="w-6 flex flex-col items-end gap-1.5">
              <span className="w-6 h-0.5 bg-gold-primary rounded-full" />
              <span className="w-6 h-0.5 bg-gold-primary rounded-full" />
              <span className="w-6 h-0.5 bg-gold-primary rounded-full" />
            </div>
          </button>
        </div>
      </div>

      {/* =================== MOBILE FULL-SCREEN DRAWER (< 768px) =================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy-deep animate-drawer-open md:hidden">
          {/* Drawer Top Bar */}
          <div className="h-[60px] px-4 border-b border-navy-border flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-2"
            >
              <Shield className="w-5 h-5 text-gold-primary" />
              <span className="font-serif text-[20px] text-white">
                EduTrade<span className="text-gold-primary">FX</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-gold-primary"
              aria-label="Close Navigation Drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Links List (48px touch height each) */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileDrawerOpen(false)}
              className={cn(
                'h-12 flex items-center font-sans text-[16px] font-medium transition-colors border-b border-navy-border/50',
                pathname === '/' ? 'text-gold-primary' : 'text-text-on-dark'
              )}
            >
              Home
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileDrawerOpen(false)}
              className={cn(
                'h-12 flex items-center font-sans text-[16px] font-medium transition-colors border-b border-navy-border/50',
                pathname === '/about' ? 'text-gold-primary' : 'text-text-on-dark'
              )}
            >
              About
            </Link>

            {/* Services Accordion in Mobile */}
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full h-12 flex items-center justify-between font-sans text-[16px] font-medium text-text-on-dark border-b border-navy-border/50"
              >
                <span>Services</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gold-primary transition-transform',
                    mobileServicesOpen && 'rotate-180'
                  )}
                />
              </button>

              {mobileServicesOpen && (
                <div className="pl-4 py-2 space-y-1 bg-navy-surface/40 rounded-md my-1 border border-navy-border/50">
                  {servicesList.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className="h-11 flex items-center gap-3 font-sans text-[14px] text-text-on-dark hover:text-gold-primary"
                      >
                        <Icon className="w-4 h-4 text-gold-primary shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/education"
              onClick={() => setMobileDrawerOpen(false)}
              className={cn(
                'h-12 flex items-center font-sans text-[16px] font-medium transition-colors border-b border-navy-border/50',
                pathname.startsWith('/education') ? 'text-gold-primary' : 'text-text-on-dark'
              )}
            >
              Education
            </Link>

            <Link
              href="/complaint-box"
              onClick={() => setMobileDrawerOpen(false)}
              className={cn(
                'h-12 flex items-center font-sans text-[16px] font-medium transition-colors border-b border-navy-border/50',
                pathname.startsWith('/complaint-box') ? 'text-gold-primary' : 'text-text-on-dark'
              )}
            >
              Complaint Box
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileDrawerOpen(false)}
              className={cn(
                'h-12 flex items-center font-sans text-[16px] font-medium transition-colors border-b border-navy-border/50',
                pathname === '/contact' ? 'text-gold-primary' : 'text-text-on-dark'
              )}
            >
              Contact
            </Link>
          </div>

          {/* Drawer Bottom Auth Section */}
          <div className="p-6 border-t border-navy-border bg-navy-surface/60">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-deep border border-gold-primary/50 flex items-center justify-center text-gold-primary font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-text-on-dark truncate">
                      {user.name}
                    </p>
                    <p className="font-sans text-[12px] text-text-muted-dark truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="h-10 flex items-center justify-center rounded-md bg-navy-surface border border-navy-border text-[13px] font-medium text-text-on-dark"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      logout();
                    }}
                    className="h-10 flex items-center justify-center rounded-md bg-danger/10 text-danger border border-danger/30 text-[13px] font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileDrawerOpen(false)}>
                  <button
                    type="button"
                    className="w-full h-11 rounded-md border border-gold-muted text-gold-primary font-sans text-[14px] font-semibold flex items-center justify-center"
                  >
                    Login
                  </button>
                </Link>

                <Link href="/register" onClick={() => setMobileDrawerOpen(false)}>
                  <button
                    type="button"
                    className="w-full h-11 rounded-md bg-gold-primary text-navy-deepest font-sans text-[14px] font-semibold flex items-center justify-center"
                  >
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
