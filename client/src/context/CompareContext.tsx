'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompareBrokerItem {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  safetyScore: number;
  eurUsdSpread: number;
  minDeposit: number;
  maxLeverage: string;
  spreadType: string;
  regulation: string[];
  tradingPlatforms: string[];
}

interface CompareContextType {
  compareList: CompareBrokerItem[];
  toggleCompare: (broker: CompareBrokerItem) => void;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<CompareBrokerItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edutradefx_compare');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('edutradefx_compare');
      }
    }
  }, []);

  const saveToStorage = (list: CompareBrokerItem[]) => {
    setCompareList(list);
    localStorage.setItem('edutradefx_compare', JSON.stringify(list));
  };

  const toggleCompare = (broker: CompareBrokerItem) => {
    const exists = compareList.some((b) => b.slug === broker.slug);
    if (exists) {
      const filtered = compareList.filter((b) => b.slug !== broker.slug);
      saveToStorage(filtered);
    } else {
      if (compareList.length >= 4) {
        alert('You can compare up to 4 brokers simultaneously.');
        return;
      }
      saveToStorage([...compareList, broker]);
    }
  };

  const removeFromCompare = (slug: string) => {
    const filtered = compareList.filter((b) => b.slug !== slug);
    saveToStorage(filtered);
  };

  const clearCompare = () => {
    saveToStorage([]);
  };

  const isInCompare = (slug: string) => {
    return compareList.some((b) => b.slug === slug);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};
