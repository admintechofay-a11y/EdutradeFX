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
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800">
      <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-blue-400 mb-4 border border-slate-700/50">
        {icon || <AlertCircle size={28} />}
      </div>
      <h3 className="text-lg font-bold text-gray-100 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
      {actionText && actionHref && !onAction && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};
