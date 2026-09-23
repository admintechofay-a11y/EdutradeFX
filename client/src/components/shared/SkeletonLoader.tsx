'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded-md',
        className
      )}
    />
  );
}

export function SkeletonBrokerCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-12 w-12 rounded-xl" />
          <div className="flex flex-col gap-2">
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="h-3 w-20" />
          </div>
        </div>
        <SkeletonBox className="h-6 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60">
        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-4 w-16" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <SkeletonBox className="h-8 w-24 rounded-lg" />
        <SkeletonBox className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonManagerCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-1.5 flex-1">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-3 w-20" />
        </div>
        <SkeletonBox className="h-5 w-16 rounded-md" />
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60">
        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-4 w-14" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-4 w-14" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-4 w-14" />
        </div>
      </div>

      <SkeletonBox className="h-9 w-full rounded-lg mt-1" />
    </div>
  );
}

export function SkeletonProviderCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-11 w-11 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>
        <SkeletonBox className="h-6 w-20 rounded-md" />
      </div>

      <div className="flex gap-1.5">
        <SkeletonBox className="h-5 w-14 rounded-md" />
        <SkeletonBox className="h-5 w-14 rounded-md" />
        <SkeletonBox className="h-5 w-14 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/60">
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-4 w-20" />
      </div>

      <SkeletonBox className="h-9 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonCourseCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <SkeletonBox className="h-44 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-20 rounded-md" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <SkeletonBox className="h-5 w-4/5" />
        <SkeletonBox className="h-3 w-full" />
        <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-2">
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4">
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="flex flex-col divide-y divide-border/60 pt-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonBox key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoader({
  type = 'broker',
  count = 6,
}: {
  type?: 'broker' | 'manager' | 'provider' | 'course' | 'table';
  count?: number;
}) {
  if (type === 'table') {
    return <SkeletonTable rows={count} />;
  }

  const Skeletons = {
    broker: SkeletonBrokerCard,
    manager: SkeletonManagerCard,
    provider: SkeletonProviderCard,
    course: SkeletonCourseCard,
  };

  const Component = Skeletons[type] || SkeletonBrokerCard;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <Component key={idx} />
      ))}
    </div>
  );
}
