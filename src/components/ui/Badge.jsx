import React from 'react';
import { cn } from '@/utils/cn';
import { UI_VARIANTS } from '@/styles/tokens';

export function Badge({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
  icon,
  ...props
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-extrabold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  };

  const variantClass = UI_VARIANTS.badges[variant] || UI_VARIANTS.badges.brand;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full uppercase tracking-wider select-none shrink-0',
        sizeClasses[size] || sizeClasses.md,
        variantClass,
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
