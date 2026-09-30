import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-rose-50/70 border-2 border-dashed border-rose-300 rounded-brand font-nunito',
        className
      )}
    >
      <div className="p-3 mb-3 rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-black text-rose-950 mb-1">{title}</h4>
      <p className="text-xs font-bold text-rose-700 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
