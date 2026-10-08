'use client';

import { useState, useEffect } from 'react';

/**
 * SSR-safe media query hook.
 * @param query CSS media query string, e.g. '(min-width: 1024px)'
 * @param defaultValue Fallback value during SSR (defaults to false)
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Legacy Safari / browser fallback
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}
