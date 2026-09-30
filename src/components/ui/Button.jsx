import React from 'react';
import { cn } from '@/utils/cn';
import { UI_VARIANTS } from '@/styles/tokens';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-brand-sm gap-1.5',
    md: 'px-4 py-2 text-sm rounded-brand-sm gap-2',
    lg: 'px-6 py-3 text-base rounded-brand gap-2.5',
    pill: 'px-5 py-2.5 text-sm rounded-full gap-2',
  };

  const variantClass = UI_VARIANTS.buttons[variant] || UI_VARIANTS.buttons.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-nunito transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none select-none',
        sizeClasses[size] || sizeClasses.md,
        variantClass,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
