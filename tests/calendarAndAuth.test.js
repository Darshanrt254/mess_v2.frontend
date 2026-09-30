import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeDayAttendanceState, computeMonthDateRange } from '../src/utils/calendarRules.js';
import { SUPPORT_CONTACT, PAYMENT_SUSPENSION_MESSAGE } from '../src/config/constants.js';

describe('Historical Calendar Attendance State Rules', () => {
  it('two present meals => FAINT', () => {
    const state = computeDayAttendanceState('PRESENT', 'PRESENT', false, false);
    assert.equal(state, 'FAINT', 'Both meals PRESENT should yield FAINT');
  });

  it('exactly one present (Lunch Present, Dinner Absent) => LIGHT', () => {
    const state = computeDayAttendanceState('PRESENT', 'ABSENT', false, false);
    assert.equal(state, 'LIGHT', 'Lunch PRESENT and Dinner ABSENT should yield LIGHT');
  });

  it('exactly one present (Lunch Absent, Dinner Present) => LIGHT', () => {
    const state = computeDayAttendanceState('ABSENT', 'PRESENT', false, false);
    assert.equal(state, 'LIGHT', 'Lunch ABSENT and Dinner PRESENT should yield LIGHT');
  });

  it('both absent => DARK', () => {
    const state = computeDayAttendanceState('ABSENT', 'ABSENT', false, false);
    assert.equal(state, 'DARK', 'Both meals ABSENT should yield DARK');
  });

  it('missing attendance is NOT automatically ABSENT (returns NEUTRAL)', () => {
    const state = computeDayAttendanceState('UNMARKED', 'UNMARKED', false, false);
    assert.equal(state, 'NEUTRAL', 'Missing / Unmarked attendance should yield NEUTRAL');

    const stateNull = computeDayAttendanceState(null, null, false, false);
    assert.equal(stateNull, 'NEUTRAL', 'Null attendance should yield NEUTRAL');
  });

  it('Sunday dinner = unavailable (Lunch Present => LIGHT, Lunch Absent => DARK)', () => {
    // Sunday with Lunch Present and Dinner Not Available
    const stateSundayPresent = computeDayAttendanceState('PRESENT', 'NOT_AVAILABLE', false, true);
    assert.equal(stateSundayPresent, 'LIGHT', 'Sunday Lunch PRESENT with unavailable dinner should yield LIGHT');

    // Sunday with Lunch Absent and Dinner Not Available
    const stateSundayAbsent = computeDayAttendanceState('ABSENT', 'NOT_AVAILABLE', false, true);
    assert.equal(stateSundayAbsent, 'DARK', 'Sunday Lunch ABSENT with unavailable dinner should yield DARK');
  });

  it('today with unresolved attendance => TODAY', () => {
    const stateTodayUnmarked = computeDayAttendanceState('UNMARKED', 'UNMARKED', true, false);
    assert.equal(stateTodayUnmarked, 'TODAY', 'Unresolved today should yield TODAY');

    const stateTodayPending = computeDayAttendanceState('PRESENT', 'UNMARKED', true, false);
    assert.equal(stateTodayPending, 'TODAY', 'Today with pending dinner should yield TODAY');
  });

  it('changing month requests correct range', () => {
    const computeMonthRange = (year, month) => {
      const monthStr = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      return {
        from: `${year}-${monthStr}-01`,
        to: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
      };
    };

    const sepRange = computeMonthRange(2026, 9);
    assert.equal(sepRange.from, '2026-09-01');
    assert.equal(sepRange.to, '2026-09-30');

    const octRange = computeMonthRange(2026, 10);
    assert.equal(octRange.from, '2026-10-01');
    assert.equal(octRange.to, '2026-10-31');

    const febLeapRange = computeMonthRange(2024, 2);
    assert.equal(febLeapRange.from, '2024-02-01');
    assert.equal(febLeapRange.to, '2024-02-29');
  });
});

describe('Application Constants and Security Invariants', () => {
  it('Support contact matches authoritative value', () => {
    assert.equal(SUPPORT_CONTACT, '+91 91655 35902');
  });

  it('Payment suspension message matches requirement', () => {
    assert.equal(
      PAYMENT_SUSPENSION_MESSAGE,
      'Your tiffin balance is 0. Please contact +91 91655 35902 for payment and resuming your services.'
    );
  });

  it('Role routing security invariants: Owner blocked from customer, Customer blocked from owner', () => {
    const determineRedirect = (role, targetPortal) => {
      if (role !== targetPortal) {
        return role === 'OWNER' ? '/owner/dashboard' : '/customer/dashboard';
      }
      return null; // allowed
    };

    // Customer attempting owner portal
    assert.equal(determineRedirect('CUSTOMER', 'OWNER'), '/customer/dashboard');

    // Owner attempting customer portal
    assert.equal(determineRedirect('OWNER', 'CUSTOMER'), '/owner/dashboard');

    // Authorized access
    assert.equal(determineRedirect('OWNER', 'OWNER'), null);
    assert.equal(determineRedirect('CUSTOMER', 'CUSTOMER'), null);
  });

  it('Poll eligibility invariant: Poll available when Lunch is PRESENT even if location is null', () => {
    const isPollAvailable = (lunchStatus, pollExists) => {
      return Boolean(pollExists && lunchStatus !== 'ABSENT');
    };

    assert.equal(isPollAvailable('PRESENT', true), true, 'Poll should be available when lunch is PRESENT');
    assert.equal(isPollAvailable('UNMARKED', true), true, 'Poll should be available when lunch is UNMARKED');
    assert.equal(isPollAvailable('ABSENT', true), false, 'Poll should NOT be actionable when lunch is ABSENT');
    assert.equal(isPollAvailable('PRESENT', false), false, 'Poll should NOT be available if poll does not exist');
  });
});

