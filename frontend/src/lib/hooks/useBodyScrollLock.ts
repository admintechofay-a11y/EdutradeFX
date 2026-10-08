'use client';

import { useEffect } from 'react';

// Global counter for nested or concurrent modals/drawers
let activeLocksCount = 0;

/**
 * Hook to lock body scroll on mobile and desktop modals, sheets, and drawers.
 * Uses reference counting so nested/transitioning modals don't prematurely unlock
 * or leave the body scroll permanently disabled.
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !isLocked) return;

    activeLocksCount++;
    if (activeLocksCount === 1) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Clean up any stale legacy fixed position inline styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    }

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1);
      if (activeLocksCount === 0) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };
  }, [isLocked]);
}
