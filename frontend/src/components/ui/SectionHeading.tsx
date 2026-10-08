import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  highlightText?: string;
  highlightColor?: 'orange' | 'green' | 'blue';
  align?: 'left' | 'center' | 'right';
  className?: string;
  isDarkBackground?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  highlightText,
  highlightColor = 'orange',
  align = 'left',
  className,
  isDarkBackground = false,
}) => {
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  }[align];

  const highlightClass = {
    orange: 'text-orange',
    green: 'text-green',
    blue: 'text-blue',
  }[highlightColor];

  // Helper to highlight specific text in title string if provided
  const renderTitle = () => {
    if (typeof title !== 'string' || !highlightText) {
      return title;
    }

    const parts = title.split(new RegExp(`(${highlightText})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlightText.toLowerCase() ? (
        <span key={index} className={highlightClass}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={cn('flex flex-col max-w-3xl mb-10', alignmentClass, className)}>
      {eyebrow && (
        <span
          className={cn(
            'inline-block text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] mb-2.5 px-3 py-1 rounded-full',
            isDarkBackground
              ? 'bg-blue/20 text-blue-200 border border-blue-400/30'
              : 'bg-surface-tint text-blue border border-blue/20'
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight',
          isDarkBackground ? 'text-white' : 'text-text-heading'
        )}
      >
        {renderTitle()}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'mt-3.5 text-sm sm:text-base leading-relaxed',
            isDarkBackground ? 'text-slate-200/90' : 'text-text-body'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
