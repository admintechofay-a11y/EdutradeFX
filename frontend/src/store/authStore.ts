import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edutrade_user', JSON.stringify(user));
      localStorage.setItem('edutrade_token', accessToken);
      // Clean up legacy refresh token storage from localStorage (strictly httpOnly cookies now)
      localStorage.removeItem('edutrade_refresh_token');
      // Synchronize cookie for server-side edge middleware protection
      document.cookie = `edutrade_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `edutrade_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    }
    set({
      user,
      accessToken,
      refreshToken: null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setAccessToken: (accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edutrade_token', accessToken);
      document.cookie = `edutrade_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
    }
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edutrade_user', JSON.stringify(user));
      document.cookie = `edutrade_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('edutrade_user');
      localStorage.removeItem('edutrade_token');
      localStorage.removeItem('edutrade_refresh_token');
      // Clear middleware auth cookies
      document.cookie = 'edutrade_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'edutrade_role=; path=/; max-age=0; SameSite=Lax';
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const storedUser = localStorage.getItem('edutrade_user');
      let token = localStorage.getItem('edutrade_token');
      if (!token && typeof document !== 'undefined') {
        const match = document.cookie.match(/(^|;\s*)edutrade_token=([^;]*)/);
        if (match) token = decodeURIComponent(match[2]);
      }

      // Purge any lingering refresh token from localStorage for compliance
      localStorage.removeItem('edutrade_refresh_token');

      if (storedUser) {
        set({
          user: JSON.parse(storedUser),
          accessToken: token || null,
          refreshToken: null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
