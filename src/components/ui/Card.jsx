import React from 'react';
import { cn } from '@/utils/cn';
import { UI_VARIANTS } from '@/styles/tokens';

export function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  variant = 'default',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) {
  const variantClass = UI_VARIANTS.cards[variant] || UI_VARIANTS.cards.default;

  return (
    <div className={cn(variantClass, className)} {...props}>
      {(title || subtitle || action || icon) && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 pb-3 mb-3 border-b border-brand-orange/30',
            variant === 'green' && 'border-brand-creamLight/20',
            headerClassName
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="shrink-0">{icon}</span>}
            <div className="min-w-0">
              {title && (
                <h3
                  className={cn(
                    'text-base font-extrabold tracking-tight truncate',
                    variant === 'green' ? 'text-brand-yellow' : 'text-brand-darkGreen'
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    'text-xs font-semibold truncate',
                    variant === 'green' ? 'text-brand-creamLight/80' : 'text-brand-green'
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}
