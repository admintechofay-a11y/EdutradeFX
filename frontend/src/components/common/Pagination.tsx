'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center justify-center w-9 h-9 rounded-md border border-slate-700 bg-slate-800/80 text-gray-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-xs text-gray-400 px-3 font-mono">
        Page <strong className="text-gray-100">{currentPage}</strong> of{' '}
        <strong className="text-gray-100">{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-md border border-slate-700 bg-slate-800/80 text-gray-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
