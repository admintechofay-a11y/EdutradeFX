import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {/* Label: Inter 13px weight 600 --color-text-primary, margin-bottom 6px */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-sans text-[13px] font-semibold text-text-primary mb-[6px]"
          >
            {label}
          </label>
        )}

        {/* Textarea: min-height 120px, padding 12px 16px */}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[120px] w-full rounded-md border-[1.5px] border-[#D1D5DB] bg-white p-[12px_16px] font-sans text-[15px] text-text-primary placeholder:text-text-secondary transition-all outline-none resize-y',
            // Focus state: border-color: --color-gold-primary, box-shadow: 0 0 0 3px rgba(201,168,76,0.15)
            'focus:border-gold-primary focus:[box-shadow:0_0_0_3px_rgba(201,168,76,0.15)]',
            // Error state: border-color: --color-danger, box-shadow: 0 0 0 3px rgba(220,38,38,0.10)
            error && 'border-danger focus:border-danger focus:[box-shadow:0_0_0_3px_rgba(220,38,38,0.10)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />

        {/* Error message: Inter 12px --color-danger, margin-top 4px */}
        {error && (
          <p className="font-sans text-[12px] text-danger mt-[4px]">
            {error}
          </p>
        )}

        {/* Helper text: Inter 12px --color-text-secondary, margin-top 4px */}
        {helperText && !error && (
          <p className="font-sans text-[12px] text-text-secondary mt-[4px]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
