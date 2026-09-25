import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from './constants';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = useAuthStore.getState().accessToken;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('edutrade_token');
      if (!token && typeof document !== 'undefined') {
        const match = document.cookie.match(/(^|;\s*)edutrade_token=([^;]*)/);
        if (match) token = decodeURIComponent(match[2]);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 with Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(formatApiError(error));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = data.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        return Promise.reject(formatApiError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatApiError(error));
  }
);

export function formatApiError(error: any): { message: string; errors?: any } {
  if (error.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const detailed = data.errors
        .map((err: any) => err.message)
        .filter(Boolean)
        .join('. ');
      return {
        message: detailed || data.message || 'Validation failed. Please check your inputs.',
        errors: data.errors,
      };
    }
    return {
      message: data.message || 'An unexpected error occurred.',
      errors: data.errors,
    };
  }

  // Handle network / offline / CORS / unreachable backend errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      return {
        message:
          'Backend API is unreachable. Please verify NEXT_PUBLIC_API_URL or BACKEND_URL is configured in your Vercel project environment variables.',
      };
    }
    return {
      message: 'Network connection failed. Please ensure the backend server is running on port 5000.',
    };
  }

  return {
    message: error.message || 'Network connection failed. Please check your internet.',
  };
}

export const adApi = {
  getActiveAds: async (placement?: string) => {
    const params = placement ? `?placement=${encodeURIComponent(placement)}` : '';
    return api.get(`/advertisements${params}`);
  },
  trackClick: async (adId: string) => {
    return api.post(`/advertisements/${adId}/click`);
  },
};

