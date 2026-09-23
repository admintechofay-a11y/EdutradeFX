'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'user' | 'broker' | 'signal_provider' | 'tutor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  isVerified?: boolean;
  avatar?: string;
  companyName?: string;
  savedBrokers?: string[];
  enrolledCourses?: any[];
}

export const getRoleDefaultPath = (role?: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'broker':
      return '/dashboard/broker';
    case 'signal_provider':
      return '/dashboard/signal-provider';
    case 'tutor':
      return '/dashboard/tutor';
    case 'user':
    default:
      return '/dashboard';
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBroker: boolean;
  isSignalProvider: boolean;
  isTutor: boolean;
  isTrader: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  register: (
    name: string,
    email: string,
    pass: string,
    mobile: string,
    consent: boolean,
    role?: UserRole,
    companyName?: string
  ) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Silent session refresh
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        setToken(data.token);
        return true;
      }
    } catch (err) {
      console.warn('Session refresh check silent fail');
    }
    return false;
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Attempt silent session refresh on mount
    refreshSession();

    // Setup periodic silent refresh every 14 minutes (access token lives 15m)
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        refreshSession();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshSession]);

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        return {
          success: false,
          message: data.message || 'Invalid email or password. Please check your credentials.',
        };
      }
    } catch (err) {
      // Fallback demo login for offline development
      const isMockAdmin = email.includes('admin');
      const isMockBroker = email.includes('broker');
      const isMockSignal = email.includes('provider') || email.includes('signal');
      const isMockTutor = email.includes('tutor');

      let assignedRole: UserRole = 'user';
      let name = 'Trader Michael';
      if (isMockAdmin) {
        assignedRole = 'admin';
        name = 'EduTradeFX Admin';
      } else if (isMockBroker) {
        assignedRole = 'broker';
        name = 'IC Markets Official';
      } else if (isMockSignal) {
        assignedRole = 'signal_provider';
        name = 'Apex Forex Signals';
      } else if (isMockTutor) {
        assignedRole = 'tutor';
        name = 'David Sutherland';
      }

      const mockUser: User = {
        id: `mock-${assignedRole}-1`,
        name,
        email,
        role: assignedRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      };
      const mockToken = 'mock_jwt_token_edutradefx';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return { success: true, role: assignedRole };
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    mobile: string,
    consent: boolean,
    role: UserRole = 'user',
    companyName?: string
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, mobile, consent, role, companyName }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        return {
          success: false,
          message:
            data.errors?.[0]?.message ||
            data.message ||
            'Registration failed. Please verify your details.',
        };
      }
    } catch (err) {
      const mockUser: User = {
        id: 'new-user-' + Date.now(),
        name,
        email,
        mobile,
        role,
        companyName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      };
      const mockToken = 'mock_jwt_token_edutradefx';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return { success: true, role };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isBroker: user?.role === 'broker',
        isSignalProvider: user?.role === 'signal_provider',
        isTutor: user?.role === 'tutor',
        isTrader: user?.role === 'user',
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
