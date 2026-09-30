import React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    id,
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full font-nunito">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-extrabold uppercase tracking-wider text-brand-darkGreen mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-brand-darkGreen/60">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full bg-brand-cream border-2.5 rounded-brand-sm px-4 py-2.5 text-sm font-bold text-brand-darkGreen placeholder:text-brand-darkGreen/40 placeholder:font-medium outline-none transition-all duration-150',
            'border-brand-orange focus:border-brand-darkGreen focus:ring-2 focus:ring-brand-orange/30',
            'disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-600 focus:ring-red-200',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-brand-darkGreen/60">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs font-medium text-brand-darkGreen/70">{helperText}</p>
      ) : null}
    </div>
  );
});
