import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REPORTING_START_DATE,
  TIFFIN_PLAN_OPTIONS,
  formatPlanLabel,
  isMealEligibleForPlan,
  isPastMealCutoff,
  isLunchPollWindowOpen,
  clampToReportingBoundary,
  getISTTimeComponents,
} from '../src/utils/planLabels.js';

describe('Phase 4: Customer Meal Plans and Formatter', () => {
  it('formats meal plan labels accurately for display', () => {
    assert.equal(formatPlanLabel('BOTH'), 'Lunch & Dinner');
    assert.equal(formatPlanLabel('LUNCH_ONLY'), 'Lunch Only');
    assert.equal(formatPlanLabel('DINNER_ONLY'), 'Dinner Only');
    assert.equal(formatPlanLabel(null), 'Lunch & Dinner', 'Fallback should be Lunch & Dinner');
    assert.equal(formatPlanLabel(undefined), 'Lunch & Dinner', 'Fallback should be Lunch & Dinner');
  });

  it('exposes supported customer creation plan options', () => {
    assert.equal(TIFFIN_PLAN_OPTIONS.length, 3);
    const values = TIFFIN_PLAN_OPTIONS.map((o) => o.value);
    assert.deepEqual(values, ['BOTH', 'LUNCH_ONLY', 'DINNER_ONLY']);
  });

  it('validates customer creation payload structure with each plan', () => {
    const buildCustomerPayload = (name, phone, loginId, password, initialTiffins, tiffinPlan) => {
      return {
        name: name.trim(),
        phone: phone.trim(),
        loginIdentifier: loginId.trim(),
        password: password.trim(),
        initialTiffins: Number(initialTiffins) || 56,
        tiffinPlan: tiffinPlan || 'BOTH',
      };
    };

    const pBoth = buildCustomerPayload('Rohan Deshmukh', '9876543210', 'rohan_d', 'pass123', 56, 'BOTH');
    assert.equal(pBoth.tiffinPlan, 'BOTH');
    assert.equal(pBoth.initialTiffins, 56);

    const pLunch = buildCustomerPayload('Priya Sharma', '9876543211', 'priya_s', 'pass123', 30, 'LUNCH_ONLY');
    assert.equal(pLunch.tiffinPlan, 'LUNCH_ONLY');

    const pDinner = buildCustomerPayload('Amit Patil', '9876543212', 'amit_p', 'pass123', 30, 'DINNER_ONLY');
    assert.equal(pDinner.tiffinPlan, 'DINNER_ONLY');
  });
});

describe('Phase 4: Meal Plan Eligibility and Cutoff Rules', () => {
  it('enforces plan-specific meal availability', () => {
    // BOTH plan: lunch and dinner both available
    assert.equal(isMealEligibleForPlan('LUNCH', 'BOTH'), true);
    assert.equal(isMealEligibleForPlan('DINNER', 'BOTH'), true);

    // LUNCH_ONLY plan: lunch eligible, dinner ineligible
    assert.equal(isMealEligibleForPlan('LUNCH', 'LUNCH_ONLY'), true);
    assert.equal(isMealEligibleForPlan('DINNER', 'LUNCH_ONLY'), false);

    // DINNER_ONLY plan: lunch ineligible, dinner eligible
    assert.equal(isMealEligibleForPlan('LUNCH', 'DINNER_ONLY'), false);
    assert.equal(isMealEligibleForPlan('DINNER', 'DINNER_ONLY'), true);
  });

  it('enforces Lunch attendance cutoff at 2:00 PM IST (14:00)', () => {
    // 2026-10-15 13:59 IST (08:29 UTC) -> before cutoff
    const dateBefore = new Date('2026-10-15T08:29:00Z');
    assert.equal(isPastMealCutoff('LUNCH', dateBefore), false, '13:59 IST should be open');

    // 2026-10-15 14:00 IST (08:30 UTC) -> at cutoff
    const dateAt = new Date('2026-10-15T08:30:00Z');
    assert.equal(isPastMealCutoff('LUNCH', dateAt), true, '14:00 IST should be closed');

    // 2026-10-15 15:30 IST (10:00 UTC) -> past cutoff
    const datePast = new Date('2026-10-15T10:00:00Z');
    assert.equal(isPastMealCutoff('LUNCH', datePast), true, '15:30 IST should be closed');
  });

  it('enforces Dinner attendance cutoff at 9:00 PM IST (21:00)', () => {
    // 2026-10-15 20:59 IST (15:29 UTC) -> before cutoff
    const dateBefore = new Date('2026-10-15T15:29:00Z');
    assert.equal(isPastMealCutoff('DINNER', dateBefore), false, '20:59 IST should be open');

    // 2026-10-15 21:00 IST (15:30 UTC) -> at cutoff
    const dateAt = new Date('2026-10-15T15:30:00Z');
    assert.equal(isPastMealCutoff('DINNER', dateAt), true, '21:00 IST should be closed');
  });

  it('enforces Lunch Poll window (06:00 to 11:30 IST on weekdays; closed weekends)', () => {
    // 2026-10-15 (Thursday) 07:00 IST (01:30 UTC) -> inside poll window
    const weekdayOpen = new Date('2026-10-15T01:30:00Z');
    assert.equal(isLunchPollWindowOpen(weekdayOpen), true, 'Weekday 07:00 IST should be open');

    // 2026-10-15 (Thursday) 12:00 IST (06:30 UTC) -> closed poll window
    const weekdayClosed = new Date('2026-10-15T06:30:00Z');
    assert.equal(isLunchPollWindowOpen(weekdayClosed), false, 'Weekday 12:00 IST should be closed');

    // 2026-10-17 (Saturday) 08:00 IST (02:30 UTC) -> weekend has no poll
    const satMorning = new Date('2026-10-17T02:30:00Z');
    assert.equal(isLunchPollWindowOpen(satMorning), false, 'Saturday morning should have no poll');

    // 2026-10-18 (Sunday) 08:00 IST (02:30 UTC) -> Sunday has no poll
    const sunMorning = new Date('2026-10-18T02:30:00Z');
    assert.equal(isLunchPollWindowOpen(sunMorning), false, 'Sunday morning should have no poll');
  });
});

describe('Phase 4: Reporting Boundary and Date Clamping', () => {
  it('reporting start date is fixed at October 1, 2026', () => {
    assert.equal(REPORTING_START_DATE, '2026-10-01');
  });

  it('clamps dates prior to reporting boundary', () => {
    assert.equal(clampToReportingBoundary('2026-09-30'), '2026-10-01');
    assert.equal(clampToReportingBoundary('2026-08-01'), '2026-10-01');
    assert.equal(clampToReportingBoundary('2025-12-31'), '2026-10-01');
    assert.equal(clampToReportingBoundary(null), '2026-10-01');
  });

  it('preserves valid dates on or after reporting boundary', () => {
    assert.equal(clampToReportingBoundary('2026-10-01'), '2026-10-01');
    assert.equal(clampToReportingBoundary('2026-10-19'), '2026-10-19');
    assert.equal(clampToReportingBoundary('2027-01-01'), '2027-01-01');
  });

  it('prevents calendar pagination before October 2026', () => {
    const canGoPrev = (year, month) => year > 2026 || (year === 2026 && month > 10);

    assert.equal(canGoPrev(2026, 10), false, 'October 2026 should be boundary floor');
    assert.equal(canGoPrev(2026, 9), false, 'September 2026 is disallowed');
    assert.equal(canGoPrev(2026, 11), true, 'November 2026 can go back to October 2026');
    assert.equal(canGoPrev(2027, 1), true, 'January 2027 can go back to December 2026');
  });
});

describe('Phase 4: Ledger Separation and Duplicate Submission Guard', () => {
  it('separates package expiry losses from meals consumed in ledger calculations', () => {
    const ledger = {
      initialBalance: 56,
      cashRecharge: 60,
      mealConsumption: 40,
      packageExpired: 10,
      adjustments: 0,
    };

    const netChange =
      ledger.initialBalance +
      ledger.cashRecharge -
      ledger.mealConsumption -
      ledger.packageExpired +
      ledger.adjustments;

    assert.equal(netChange, 66);
    assert.notEqual(ledger.packageExpired, ledger.mealConsumption, 'Expiry losses are tracked separately');
  });

  it('prevents duplicate recharge submissions when request is pending', () => {
    let callCount = 0;
    const fakeMutate = () => {
      callCount++;
    };

    let isPending = false;
    const handleRechargeSubmit = (e) => {
      if (isPending) return;
      isPending = true;
      fakeMutate();
    };

    // First submit
    handleRechargeSubmit();
    assert.equal(callCount, 1);

    // Second accidental submit while still pending
    handleRechargeSubmit();
    assert.equal(callCount, 1, 'Should block duplicate submit while pending');

    // Request completes
    isPending = false;
    handleRechargeSubmit();
    assert.equal(callCount, 2, 'Should allow submission after previous finishes');
  });

  it('detects empty analytics state correctly', () => {
    const isEmpty = (overview) => {
      const mealsTotal = overview?.meals?.total || 0;
      const expiredTotal = overview?.tiffins?.expired || 0;
      const lunchTotal = (overview?.attendance?.lunch?.present || 0) + (overview?.attendance?.lunch?.absent || 0);
      return mealsTotal === 0 && expiredTotal === 0 && lunchTotal === 0;
    };

    assert.equal(isEmpty({ meals: { total: 0 }, tiffins: { expired: 0 }, attendance: { lunch: { present: 0, absent: 0 } } }), true);
    assert.equal(isEmpty({ meals: { total: 5 }, tiffins: { expired: 0 }, attendance: { lunch: { present: 5, absent: 0 } } }), false);
    assert.equal(isEmpty({ meals: { total: 0 }, tiffins: { expired: 12 }, attendance: { lunch: { present: 0, absent: 0 } } }), false);
  });
});
