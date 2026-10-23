/**
 * Tiffin Plan Helpers and Constants
 * 
 * Supports:
 * - BOTH: Lunch and Dinner
 * - LUNCH_ONLY: Lunch service only
 * - DINNER_ONLY: Dinner service only
 * 
 * Reporting boundary: 2026-10-01 (Asia/Kolkata)
 */

export const REPORTING_START_DATE = '2026-10-01';

export const TIFFIN_PLAN_OPTIONS = [
  { value: 'BOTH', label: 'Lunch & Dinner (Both)' },
  { value: 'LUNCH_ONLY', label: 'Lunch Only' },
  { value: 'DINNER_ONLY', label: 'Dinner Only' },
];

/**
 * Returns human-readable label for customer meal plan
 */
export function formatPlanLabel(plan) {
  switch (plan) {
    case 'LUNCH_ONLY':
      return 'Lunch Only';
    case 'DINNER_ONLY':
      return 'Dinner Only';
    case 'BOTH':
    default:
      return 'Lunch & Dinner';
  }
}

/**
 * Checks whether a meal type is included in customer's plan
 */
export function isMealEligibleForPlan(mealType, plan = 'BOTH') {
  const normalizedPlan = plan || 'BOTH';
  if (normalizedPlan === 'BOTH') return true;
  if (mealType === 'LUNCH') return normalizedPlan === 'LUNCH_ONLY';
  if (mealType === 'DINNER') return normalizedPlan === 'DINNER_ONLY';
  return false;
}

/**
 * Converts a date or current time to Asia/Kolkata components
 */
export function getISTTimeComponents(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(d);
  const getPart = (type) => parts.find((p) => p.type === type)?.value;

  const hour = parseInt(getPart('hour') || '0', 10);
  const minute = parseInt(getPart('minute') || '0', 10);
  const day = getPart('day');
  const month = getPart('month');
  const year = getPart('year');
  const weekday = (getPart('weekday') || '').toUpperCase();

  return {
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
    dateString: `${year}-${month}-${day}`,
    dayOfWeek: weekday,
  };
}

/**
 * Determines whether today's attendance marking has passed cutoff time in Asia/Kolkata.
 * - Lunch cutoff: 14:00 (2:00 PM IST)
 * - Dinner cutoff: 21:00 (9:00 PM IST)
 */
export function isPastMealCutoff(mealType, date = new Date()) {
  const { totalMinutes } = getISTTimeComponents(date);
  if (mealType === 'LUNCH') {
    return totalMinutes >= 14 * 60; // 14:00 (2:00 PM IST)
  }
  if (mealType === 'DINNER') {
    return totalMinutes >= 21 * 60; // 21:00 (9:00 PM IST)
  }
  return false;
}

/**
 * Determines whether the weekday lunch poll is currently open in Asia/Kolkata.
 * - Weekday 06:00 to 11:30 IST
 * - Saturday & Sunday: no lunch poll
 */
export function isLunchPollWindowOpen(date = new Date()) {
  const { totalMinutes, dayOfWeek } = getISTTimeComponents(date);
  const isWeekend = dayOfWeek.startsWith('SAT') || dayOfWeek.startsWith('SUN');
  if (isWeekend) return false;
  return totalMinutes >= 6 * 60 && totalMinutes < (11 * 60 + 30);
}

/**
 * Clamps date string to be at or after the reporting start boundary '2026-10-01'
 */
export function clampToReportingBoundary(dateStr) {
  if (!dateStr) return REPORTING_START_DATE;
  return dateStr < REPORTING_START_DATE ? REPORTING_START_DATE : dateStr;
}

/**
 * Formats a Date or ISO timestamp in Asia/Kolkata timezone
 */
export function formatISTDateTime(dateInput, includeTime = true) {
  if (!dateInput) return '—';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const options = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };

  const formatted = new Intl.DateTimeFormat('en-IN', options).format(d);
  return includeTime ? `${formatted} IST` : formatted;
}

/**
 * Resolves frontend display status for a MealPackage.
 * 
 * Invariant: Never describe a package as currently usable solely because its
 * stored status is ACTIVE. If expiresAt has passed in Asia/Kolkata, label it
 * clearly as expired / awaiting reconciliation without mutating raw backend data.
 */
export function resolvePackageDisplayStatus(pkg, referenceDate = new Date()) {
  if (!pkg) return null;

  const rawStatus = pkg.status || 'UNKNOWN';

  if (rawStatus === 'EXHAUSTED') {
    return {
      status: 'EXHAUSTED',
      label: 'Exhausted',
      variant: 'neutral',
      isUsable: false,
      isReconciliationPending: false,
      rawStatus,
    };
  }

  if (rawStatus === 'EXPIRED') {
    return {
      status: 'EXPIRED',
      label: 'Expired',
      variant: 'danger',
      isUsable: false,
      isReconciliationPending: false,
      rawStatus,
    };
  }

  if (rawStatus === 'ACTIVE') {
    const refTime = referenceDate instanceof Date ? referenceDate.getTime() : new Date(referenceDate).getTime();
    const expTime = new Date(pkg.expiresAt).getTime();

    // If expiry timestamp in Asia/Kolkata has passed, mark as AWAITING_RECONCILIATION
    if (!isNaN(expTime) && expTime <= refTime) {
      return {
        status: 'AWAITING_RECONCILIATION',
        label: 'Expired (Awaiting Reconciliation)',
        variant: 'warning',
        isUsable: false,
        isReconciliationPending: true,
        rawStatus: 'ACTIVE',
      };
    }

    return {
      status: 'ACTIVE',
      label: 'Active',
      variant: 'success',
      isUsable: true,
      isReconciliationPending: false,
      rawStatus: 'ACTIVE',
    };
  }

  return {
    status: rawStatus,
    label: rawStatus,
    variant: 'neutral',
    isUsable: false,
    isReconciliationPending: false,
    rawStatus,
  };
}

/**
 * Checks if any package in a list has reached its expiry timestamp but is still stored as ACTIVE.
 */
export function hasPackagesAwaitingReconciliation(packages = [], referenceDate = new Date()) {
  if (!Array.isArray(packages) || packages.length === 0) return false;
  return packages.some((p) => {
    const resolved = resolvePackageDisplayStatus(p, referenceDate);
    return resolved?.isReconciliationPending === true;
  });
}

/**
 * Sorts packages by expiry date ascending, preserving backend ordering where possible
 */
export function sortPackagesByExpiry(packages = []) {
  if (!Array.isArray(packages)) return [];
  return [...packages].sort((a, b) => {
    const timeA = new Date(a.expiresAt).getTime();
    const timeB = new Date(b.expiresAt).getTime();
    if (isNaN(timeA) || isNaN(timeB)) return 0;
    return timeA - timeB;
  });
}
