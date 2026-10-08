import React from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface-tint border border-border">
      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-blue mb-4 border border-border shadow-sm">
        {icon || <AlertCircle size={28} />}
      </div>
      <h3 className="text-lg font-bold text-text-heading mb-1.5">{title}</h3>
      <p className="text-sm text-text-body max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold rounded-full bg-orange hover:bg-orange-hover text-white transition-all shadow-soft"
        >
          {actionLabel}
        </button>
      )}
      {actionText && actionHref && !onAction && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold rounded-full bg-orange hover:bg-orange-hover text-white transition-all shadow-soft"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};
