import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display here.',
  icon,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-brand-cream/50 border-2 border-dashed border-brand-orange/40 rounded-brand font-nunito',
        className
      )}
    >
      <div className="p-3.5 mb-3 rounded-full bg-brand-yellow/40 text-brand-darkGreen">
        {icon || <PackageOpen className="w-8 h-8 text-brand-darkGreen" />}
      </div>
      <h4 className="text-base font-black text-brand-darkGreen mb-1">{title}</h4>
      <p className="text-xs font-bold text-brand-green max-w-sm mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
