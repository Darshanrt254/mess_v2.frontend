import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export function MetricTrendCard({
  title,
  value,
  trend,
  isPositive = true,
  subtitle,
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-brand-green">{title}</span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-black',
              isPositive ? 'text-emerald-700' : 'text-rose-600'
            )}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-brand-darkGreen mt-2">{value}</div>
      {subtitle && <p className="text-[11px] font-bold text-brand-green/80 mt-1">{subtitle}</p>}
    </Card>
  );
}
