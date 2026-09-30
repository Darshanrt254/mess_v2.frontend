import React from 'react';
import { cn } from '@/utils/cn';

export function PageHeader({
  title,
  subtitle,
  dateSubtitle,
  badge,
  action,
  centered = false,
  className = '',
}) {
  return (
    <div
      className={cn(
        'mb-6 font-nunito',
        centered ? 'text-center' : 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className
      )}
    >
      <div className={centered ? 'mx-auto max-w-xl' : ''}>
        <div className={cn('flex items-center gap-2.5', centered && 'justify-center')}>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-darkGreen tracking-tight">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {subtitle && (
          <p className="text-sm font-bold text-brand-green mt-1">
            {subtitle}
          </p>
        )}
        {dateSubtitle && (
          <p className="text-xs font-extrabold text-brand-green/80 mt-0.5">
            {dateSubtitle}
          </p>
        )}
      </div>

      {action && !centered && <div className="shrink-0">{action}</div>}
      {action && centered && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}
