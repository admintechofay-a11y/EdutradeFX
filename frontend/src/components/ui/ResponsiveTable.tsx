'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ResponsiveTableColumn<T> {
  id?: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
  isAction?: boolean;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  variant?: 'auto' | 'table' | 'cards';
  className?: string;
  tableClassName?: string;
  cardClassName?: string;
  renderCardHeader?: (item: T, index: number) => React.ReactNode;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  variant = 'auto',
  className,
  tableClassName,
  cardClassName,
  renderCardHeader,
}: ResponsiveTableProps<T>) {
  const getKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item, index);
    if (item && typeof item === 'object' && 'id' in item) {
      return (item as any).id;
    }
    return index;
  };

  const getCellValue = (col: ResponsiveTableColumn<T>, item: T, index: number) => {
    if (col.cell) return col.cell(item, index);
    if (col.accessorKey) return String((item as any)[col.accessorKey] ?? '');
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-border dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-blue animate-spin mb-3" />
        <p className="text-sm text-text-muted dark:text-slate-400">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-border dark:border-slate-800">
        <p className="text-sm text-text-muted dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  const showCards = variant === 'cards' || variant === 'auto';
  const showTable = variant === 'table' || variant === 'auto';

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Card-Based Data List (< md) */}
      {showCards && (
        <div
          className={cn(
            'space-y-3',
            variant === 'auto' ? 'block md:hidden' : 'block'
          )}
        >
          {data.map((item, index) => {
            const key = getKey(item, index);
            const actionColumns = columns.filter((col) => col.isAction);
            const dataColumns = columns.filter(
              (col) => !col.hideOnMobile && !col.isAction
            );

            return (
              <div
                key={key}
                className={cn(
                  'p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border dark:border-slate-800 shadow-sm space-y-3',
                  cardClassName
                )}
              >
                {/* Optional Custom Card Header */}
                {renderCardHeader && (
                  <div className="border-b border-border/60 dark:border-slate-800/60 pb-2.5">
                    {renderCardHeader(item, index)}
                  </div>
                )}

                {/* Key-Value Pair rows */}
                <div className="space-y-2 text-xs sm:text-sm">
                  {dataColumns.map((col, colIndex) => (
                    <div
                      key={col.id || colIndex}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-text-muted dark:text-slate-400 font-medium shrink-0">
                        {col.header}:
                      </span>
                      <div className="text-right text-text-heading dark:text-slate-200 font-medium break-words">
                        {getCellValue(col, item, index)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Actions Footer if action columns exist */}
                {actionColumns.length > 0 && (
                  <div className="pt-2.5 border-t border-border/60 dark:border-slate-800/60 flex items-center justify-end gap-2 flex-wrap">
                    {actionColumns.map((col, colIndex) => (
                      <React.Fragment key={col.id || colIndex}>
                        {getCellValue(col, item, index)}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop / Tablet Standard Table (>= md) */}
      {showTable && (
        <div
          className={cn(
            'overflow-x-auto rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
            variant === 'auto' ? 'hidden md:block' : 'block'
          )}
        >
          <table className={cn('w-full text-left text-xs sm:text-sm', tableClassName)}>
            <thead className="bg-surface-tint/60 dark:bg-slate-800/60 border-b border-border dark:border-slate-800 text-text-muted dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={col.id || i}
                    scope="col"
                    className={cn('px-4 sm:px-6 py-3.5', col.headerClassName)}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-slate-800/60">
              {data.map((item, index) => {
                const key = getKey(item, index);
                return (
                  <tr
                    key={key}
                    className="hover:bg-surface-tint/30 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.id || colIndex}
                        className={cn('px-4 sm:px-6 py-3.5 text-text-body dark:text-slate-300', col.className)}
                      >
                        {getCellValue(col, item, index)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
