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

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edutrade_user', JSON.stringify(user));
      localStorage.setItem('edutrade_token', accessToken);
      if (refreshToken) localStorage.setItem('edutrade_refresh_token', refreshToken);
    }
    set({
      user,
      accessToken,
      refreshToken: refreshToken || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setAccessToken: (accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edutrade_token', accessToken);
    }
    set({ accessToken });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edutrade_user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('edutrade_user');
      localStorage.removeItem('edutrade_token');
      localStorage.removeItem('edutrade_refresh_token');
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
      const storedToken = localStorage.getItem('edutrade_token');
      const storedRefresh = localStorage.getItem('edutrade_refresh_token');

      if (storedUser && storedToken) {
        set({
          user: JSON.parse(storedUser),
          accessToken: storedToken,
          refreshToken: storedRefresh || null,
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
