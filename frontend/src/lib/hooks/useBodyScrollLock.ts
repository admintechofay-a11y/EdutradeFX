'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to lock body scroll on mobile and desktop modals, sheets, and drawers.
 * Handles iOS rubberband prevention and restores scroll position cleanly on unmount.
 */
export function useBodyScrollLock(isLocked: boolean): void {
  const originalStyles = useRef<{
    overflow: string;
    position: string;
    top: string;
    width: string;
  } | null>(null);
  const scrollY = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLocked) {
      scrollY.current = window.scrollY;
      originalStyles.current = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY.current}px`;
      document.body.style.width = '100%';
    } else if (originalStyles.current) {
      document.body.style.overflow = originalStyles.current.overflow;
      document.body.style.position = originalStyles.current.position;
      document.body.style.top = originalStyles.current.top;
      document.body.style.width = originalStyles.current.width;
      window.scrollTo(0, scrollY.current);
      originalStyles.current = null;
    }

    return () => {
      if (originalStyles.current) {
        document.body.style.overflow = originalStyles.current.overflow;
        document.body.style.position = originalStyles.current.position;
        document.body.style.top = originalStyles.current.top;
        document.body.style.width = originalStyles.current.width;
        window.scrollTo(0, scrollY.current);
        originalStyles.current = null;
      }
    };
  }, [isLocked]);
}
