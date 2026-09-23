'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissing?: boolean;
}

interface ToastContextType {
  toast: (options: {
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number;
  }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    ({
      type = 'info',
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType;
      title?: string;
      message: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = { id, type, title, message, duration, dismissing: false };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'success', title, message }),
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'error', title, message }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'warning', title, message }),
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'info', title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <Toaster toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster({
  toasts = [],
  onDismiss,
}: {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const borderClasses = {
    success: 'border-accent-green/40 shadow-glow-green',
    error: 'border-rose-500/40 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]',
    warning: 'border-accent-gold/40 shadow-glow-gold',
    info: 'border-secondary-light/40 shadow-glow-blue',
  };

  const iconColors = {
    success: 'text-accent-green',
    error: 'text-rose-400',
    warning: 'text-accent-gold',
    info: 'text-blue-400',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none sm:px-0">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xl',
              toast.dismissing ? 'animate-toast-dismiss' : 'animate-toast-appear',
              borderClasses[toast.type]
            )}
          >
            <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[toast.type])} />

            <div className="flex-1 flex flex-col gap-0.5">
              {toast.title && (
                <h5 className="font-bold text-sm text-text-primary">
                  {toast.title}
                </h5>
              )}
              <p className="text-xs text-text-muted leading-relaxed">
                {toast.message}
              </p>
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-text-muted hover:text-text-primary p-0.5 rounded focus:outline-none"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
