import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) {
  const variantStyles = {
    info: {
      container: 'bg-sky-50 border-sky-300 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      container: 'bg-amber-50 border-brand-orange text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-brand-orange shrink-0" />,
    },
    danger: {
      container: 'bg-rose-50 border-rose-300 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
  };

  const current = variantStyles[variant] || variantStyles.info;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-brand-sm border-2 font-nunito shadow-subtle',
        current.container,
        className
      )}
      role="alert"
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-extrabold mb-0.5">{title}</h4>}
        <div className="text-xs font-semibold leading-relaxed opacity-95">
          {children}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-black/5 transition-colors -mr-1"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
