'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole, getRoleDefaultPath } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectUnauthorized?: boolean;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectUnauthorized = true,
}: RoleGuardProps) {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check if localStorage has credentials before rendering
    const storedToken = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');

    if (!storedToken && !token) {
      if (redirectUnauthorized) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
      setIsVerifying(false);
      return;
    }

    let currentRole: UserRole = user?.role || 'user';
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        if (parsed.role) currentRole = parsed.role;
      } catch (e) {
        // ignore json parse error
      }
    }

    if (!allowedRoles.includes(currentRole)) {
      if (redirectUnauthorized) {
        const dest = getRoleDefaultPath(currentRole);
        router.replace(dest);
      }
    }

    setIsVerifying(false);
  }, [user, token, allowedRoles, redirectUnauthorized, router, pathname]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-navy-deepest flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-10 h-10 text-gold-primary animate-spin mb-4" />
        <p className="font-sans text-sm text-text-muted-dark tracking-wide">
          Verifying cryptographic credentials & permissions...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated && !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-navy-deepest flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-danger" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="font-sans text-sm text-text-muted-dark max-w-md mb-6">
          This portal section requires institutional login credentials. Please sign in to verify your role.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gold-primary text-navy-deepest font-bold text-sm hover:bg-gold-light transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  // Role mismatch
  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-navy-deepest flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-danger" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="font-sans text-sm text-text-muted-dark max-w-md mb-6">
          Your account role (<span className="text-gold-primary font-mono uppercase">{user.role}</span>) does not possess clearance to access this department.
        </p>
        <div className="flex gap-4">
          <Link
            href={getRoleDefaultPath(user.role)}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gold-primary text-navy-deepest font-bold text-sm hover:bg-gold-light transition-colors"
          >
            Go to Your Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-navy-border text-white text-sm hover:bg-navy-surface transition-colors"
          >
            Public Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
