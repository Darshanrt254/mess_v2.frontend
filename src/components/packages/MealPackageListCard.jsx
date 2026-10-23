import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hourglass,
} from 'lucide-react';
import {
  formatISTDateTime,
  resolvePackageDisplayStatus,
  hasPackagesAwaitingReconciliation,
  sortPackagesByExpiry,
} from '@/utils/planLabels';

/**
 * MealPackageListCard
 * 
 * Displays customer meal packages with:
 * - Current package status (Active, Exhausted, Expired, Awaiting Reconciliation).
 * - Initial quantity and remaining quantity.
 * - Activation and expiry dates formatted in Asia/Kolkata (IST).
 * - Clear warning when a package has passed expiry timestamp but is awaiting backend reconciliation.
 * - Strict adherence to backend authority: balance is NOT summed locally.
 */
export function MealPackageListCard({
  packages = [],
  isLoading = false,
  error = null,
  title = 'Meal Packages',
  subtitle = 'Independently expiring 50-calendar-day meal subscriptions',
  className = '',
}) {
  if (isLoading) {
    return (
      <Card
        title={title}
        subtitle={subtitle}
        icon={<Package className="w-5 h-5 text-brand-orange" />}
        className={className}
      >
        <div className="py-6">
          <LoadingState message="Loading meal packages..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title={title}
        subtitle={subtitle}
        icon={<Package className="w-5 h-5 text-brand-orange" />}
        className={className}
      >
        <Alert variant="danger" title="Error Loading Packages">
          {error?.message || 'Could not load meal package records.'}
        </Alert>
      </Card>
    );
  }

  const sortedPackages = sortPackagesByExpiry(packages);
  const isReconciliationPending = hasPackagesAwaitingReconciliation(sortedPackages);

  const activeCount = sortedPackages.filter((p) => {
    const s = resolvePackageDisplayStatus(p);
    return s?.isUsable;
  }).length;

  return (
    <Card
      title={title}
      subtitle={subtitle}
      icon={<Package className="w-5 h-5 text-brand-orange" />}
      action={
        <Badge variant={activeCount > 0 ? 'brand' : 'neutral'} size="sm">
          {sortedPackages.length} Total ({activeCount} Active)
        </Badge>
      }
      className={className}
    >
      <div className="space-y-4 font-nunito">
        {/* Policy Notice */}
        <div className="p-3 bg-brand-creamLight rounded-brand-sm border border-brand-orange/30 text-[11px] font-bold text-brand-green leading-relaxed">
          <span className="font-black text-brand-darkGreen block">Independent Package Policy:</span>
          Each recharge creates an independent package valid for 50 calendar days from activation.
          Meals are deducted First-Expiry-First-Out (FEFO). Recharging does not extend older packages.
          Authoritative balance is maintained by the backend profile ledger.
        </div>

        {/* Warning if any package has passed its expiry timestamp and is awaiting backend expiry reconciliation */}
        {isReconciliationPending && (
          <div
            data-testid="reconciliation-warning"
            className="p-3.5 rounded-brand-sm bg-amber-50 border-2 border-brand-orange flex items-start gap-2.5 text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-amber-950 block">
                Awaiting Expiry Reconciliation
              </span>
              <span className="font-bold text-amber-900 block mt-0.5 leading-snug">
                One or more packages have reached their expiration timestamp and are awaiting scheduled backend
                reconciliation. The backend-provided profile balance above remains authoritative.
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {sortedPackages.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito border-2 border-dashed border-brand-orange/30 rounded-brand-sm">
            No meal packages found for this account.
          </div>
        ) : (
          <div className="divide-y divide-brand-orange/20">
            {sortedPackages.map((pkg) => {
              const displayStatus = resolvePackageDisplayStatus(pkg);
              const initial = pkg.initialQuantity || 0;
              const remaining = pkg.remainingQuantity || 0;
              const percent = initial > 0 ? Math.min(100, Math.max(0, Math.round((remaining / initial) * 100))) : 0;

              // Border and styling accents based on resolved display status
              let itemBorderClass = 'border-brand-orange/20 bg-brand-card';
              let StatusIcon = CheckCircle2;

              if (displayStatus.status === 'ACTIVE') {
                itemBorderClass = 'border-brand-green/40 bg-white/70 shadow-2xs';
                StatusIcon = CheckCircle2;
              } else if (displayStatus.status === 'AWAITING_RECONCILIATION') {
                itemBorderClass = 'border-amber-400 bg-amber-50/60';
                StatusIcon = Hourglass;
              } else if (displayStatus.status === 'EXPIRED') {
                itemBorderClass = 'border-red-200 bg-red-50/30 opacity-80';
                StatusIcon = XCircle;
              } else if (displayStatus.status === 'EXHAUSTED') {
                itemBorderClass = 'border-gray-200 bg-gray-50/60 opacity-80';
                StatusIcon = CheckCircle2;
              }

              return (
                <div
                  key={pkg.id}
                  data-testid={`package-item-${pkg.id}`}
                  className={`py-3.5 px-3 rounded-brand-sm border ${itemBorderClass} my-2 transition-all`}
                >
                  {/* Top row: ID + Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${
                        displayStatus.variant === 'success'
                          ? 'text-emerald-600'
                          : displayStatus.variant === 'warning'
                          ? 'text-brand-orange'
                          : displayStatus.variant === 'danger'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`} />
                      <span className="font-mono text-xs font-black text-brand-darkGreen">
                        Package #{pkg.id.slice(0, 8)}
                      </span>
                    </div>

                    <Badge
                      variant={displayStatus.variant}
                      size="sm"
                      data-testid={`package-status-${pkg.id}`}
                    >
                      {displayStatus.label}
                    </Badge>
                  </div>

                  {/* Middle row: Quantity & Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between items-baseline text-xs font-bold mb-1">
                      <span className="text-brand-green">Meals Remaining</span>
                      <span className="text-brand-darkGreen font-black">
                        <span className={`text-sm ${remaining > 0 && displayStatus.isUsable ? 'text-brand-darkGreen' : 'text-brand-mutedText'}`}>
                          {remaining}
                        </span>
                        <span className="text-brand-green/70"> / {initial}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-brand-cream border border-brand-orange/30 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          displayStatus.isUsable
                            ? percent > 25
                              ? 'bg-brand-green'
                              : 'bg-brand-orange'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom row: Dates in Asia/Kolkata */}
                  <div className="mt-2.5 pt-2 border-t border-brand-orange/15 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-brand-green">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-green/70 shrink-0" />
                      <span>
                        Activated:{' '}
                        <strong className="text-brand-darkGreen font-black">
                          {formatISTDateTime(pkg.activatedAt)}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span>
                        Expires:{' '}
                        <strong className={`font-black ${displayStatus.isReconciliationPending ? 'text-brand-orange' : 'text-brand-darkGreen'}`}>
                          {formatISTDateTime(pkg.expiresAt)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
