'use client';

import React, { useEffect, useRef, useId, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  containerClassName?: string;
  headerClassName?: string;
}

const maxWidthMap = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  full: 'sm:max-w-[95vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  contentClassName,
  containerClassName,
  headerClassName,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Lock background scroll when open
  useBodyScrollLock(isOpen);

  // Close on Escape & trap focus
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (closeOnEsc && e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isOpen, closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      document.addEventListener('keydown', handleKeyDown);

      // Focus first element or dialog container
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const firstInput = dialogRef.current.querySelector<HTMLElement>(
            'input, button, select, textarea'
          );
          if (firstInput) {
            firstInput.focus();
          } else {
            dialogRef.current.focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={subtitle ? descId : undefined}
          className={cn(
            'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4',
            containerClassName
          )}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnBackdropClick && onClose()}
            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm"
          />

          {/* Modal / Bottom Sheet Card */}
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'relative z-10 w-full bg-white dark:bg-slate-900',
              'rounded-t-3xl sm:rounded-3xl border border-border dark:border-slate-800 shadow-2xl',
              'flex flex-col max-h-[92dvh] sm:max-h-[85vh]',
              'focus:outline-none overflow-hidden',
              maxWidthMap[maxWidth] || 'sm:max-w-lg',
              className
            )}
          >
            {/* Mobile Sheet Handle Bar */}
            <div className="pt-2.5 pb-1 sm:hidden flex justify-center shrink-0">
              <span className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-start justify-between gap-4 px-5 sm:px-6 pt-3 sm:pt-6 pb-3 border-b border-border/60 dark:border-slate-800/60 shrink-0',
                  headerClassName
                )}
              >
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2
                      id={titleId}
                      className="text-lg sm:text-xl font-bold text-navy dark:text-white truncate"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p
                      id={descId}
                      className="text-xs sm:text-sm text-text-muted dark:text-slate-400 mt-0.5 line-clamp-2"
                    >
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-text-muted hover:text-navy dark:hover:text-white hover:bg-surface-tint dark:hover:bg-slate-800 transition-colors shrink-0 -mr-1"
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div
              className={cn(
                'flex-1 overflow-y-auto px-5 sm:px-6 py-4 overscroll-contain text-sm text-text-body dark:text-slate-200',
                contentClassName
              )}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 sm:px-6 py-3.5 bg-surface-tint/50 dark:bg-slate-900/80 border-t border-border/60 dark:border-slate-800/60 shrink-0 pb-safe">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
