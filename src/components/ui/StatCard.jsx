import React from 'react';
import { cn } from '@/utils/cn';

export function StatCard({
  label,
  value,
  icon,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  variant = 'default', // 'default' | 'green' | 'yellow'
  className = '',
  onClick,
}) {
  const variantStyles = {
    default: {
      wrapper: 'bg-brand-card border-2.5 border-brand-orange text-brand-darkGreen shadow-brand',
      num: 'text-brand-darkGreen',
      label: 'text-brand-green',
    },
    green: {
      wrapper: 'bg-brand-darkGreen border-2.5 border-brand-orange text-brand-yellow shadow-brand-green',
      num: 'text-brand-yellow',
      label: 'text-brand-creamLight/90',
    },
    yellow: {
      wrapper: 'bg-brand-yellow border-2.5 border-brand-orange text-brand-darkGreen shadow-brand',
      num: 'text-brand-darkGreen',
      label: 'text-brand-darkGreen/80',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-brand p-4 sm:p-5 transition-transform duration-150',
        onClick && 'cursor-pointer hover:-translate-y-1',
        style.wrapper,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={cn('text-xs font-black uppercase tracking-wider', style.label)}>
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-brand-sm bg-black/5 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl sm:text-3xl font-black tracking-tight leading-none', style.num)}>
          {value}
        </span>
      </div>

      {change && (
        <div className="mt-2 text-[11px] font-extrabold flex items-center gap-1">
          <span
            className={cn(
              changeType === 'positive' && 'text-emerald-700',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-gray-600'
            )}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
