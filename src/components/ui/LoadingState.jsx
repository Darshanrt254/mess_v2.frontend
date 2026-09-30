import React from 'react';
import { cn } from '@/utils/cn';

export function LoadingState({
  message = 'Loading data...',
  description,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center font-nunito',
        className
      )}
    >
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-orange/30 border-t-brand-darkGreen animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-brand-orange animate-ping" />
        </div>
      </div>
      <h4 className="text-sm font-black text-brand-darkGreen">{message}</h4>
      {description && (
        <p className="text-xs font-bold text-brand-green/80 mt-1 max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
}
