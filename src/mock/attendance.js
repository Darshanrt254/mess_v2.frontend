/**
 * Mock Attendance Data Layer
 * 
 * Supports full tri-state model: UNMARKED, PRESENT, ABSENT
 * And composite Lunch states:
 * - PRESENT + LOCATION_PENDING
 * - PRESENT + COLLEGE
 * - PRESENT + RESTAURANT
 * 
 * Includes day-of-week rules:
 * - Weekday: Regular meal operations with College/Restaurant Lunch poll.
 * - Saturday: Lunch at Restaurant, Dinner at Restaurant, NO lunch poll.
 * - Sunday: Lunch at Restaurant, NO lunch poll, Dinner NO SERVICE (hide dinner card).
 */

export const ATTENDANCE_STATE = {
  UNMARKED: 'UNMARKED',
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
};

export const LUNCH_LOCATION = {
  PENDING: 'PENDING',
  COLLEGE: 'COLLEGE',
  RESTAURANT: 'RESTAURANT',
};

// Cutoff timings
export const MEAL_TIMINGS = {
  LUNCH_CUTOFF: '10:30 AM',
  DINNER_CUTOFF: '05:30 PM',
  LUNCH_DISPATCH: '12:30 PM',
  DINNER_SERVICE_START: '07:30 PM',
};

/**
 * Returns operational meal configuration for a given day of the week (0 = Sunday, 6 = Saturday)
 */
export function getDayMealRules(dayOfWeek = 3) {
  // 6 = Saturday
  if (dayOfWeek === 6) {
    return {
      isSaturday: true,
      isSunday: false,
      hasLunchPoll: false,
      defaultLunchLocation: LUNCH_LOCATION.RESTAURANT,
      lunchNote: 'Saturday Lunch: Dine-in at Restaurant (No campus delivery)',
      hasDinnerService: true,
      dinnerNote: 'Saturday Dinner: Dine-in at Restaurant',
    };
  }

  // 0 = Sunday
  if (dayOfWeek === 0) {
    return {
      isSaturday: false,
      isSunday: true,
      hasLunchPoll: false,
      defaultLunchLocation: LUNCH_LOCATION.RESTAURANT,
      lunchNote: 'Sunday Special Lunch: Dine-in at Restaurant',
      hasDinnerService: false, // NO SERVICE on Sunday night
      dinnerNote: 'Sunday Dinner: Kitchen Closed (No Service)',
    };
  }

  // Regular Weekday (Monday - Friday)
  return {
    isSaturday: false,
    isSunday: false,
    hasLunchPoll: true,
    defaultLunchLocation: null,
    lunchNote: 'Regular Weekday Lunch: Delivery poll available (College vs Restaurant)',
    hasDinnerService: true,
    dinnerNote: 'Regular Weekday Dinner: Mess dining hall',
  };
}

// Initial mock attendance for today (Wednesday, Weekday)
export const mockTodayAttendance = {
  date: '2026-09-30',
  dayName: 'Wednesday',
  dayOfWeek: 3,
  lunch: {
    state: ATTENDANCE_STATE.UNMARKED, // Can be UNMARKED, PRESENT, ABSENT
    location: LUNCH_LOCATION.PENDING,  // PENDING, COLLEGE, RESTAURANT
    isLocked: false,
    confirmedAt: null,
  },
  dinner: {
    state: ATTENDANCE_STATE.UNMARKED, // Can be UNMARKED, PRESENT, ABSENT
    isLocked: false,
    confirmedAt: null,
  },
};

// Owner Live Attendance Roster mock
export const mockOwnerAttendanceRoster = [
  { id: '1', name: 'Rahul Sharma', phone: '9876543210', lunch: 'PRESENT', lunchLocation: 'College (Gate 2)', dinner: 'PENDING' },
  { id: '2', name: 'Amit Patil', phone: '9822334455', lunch: 'PRESENT', lunchLocation: 'Mess Dining', dinner: 'PRESENT' },
  { id: '3', name: 'Sneha Deshmukh', phone: '9765432109', lunch: 'ABSENT', lunchLocation: '—', dinner: 'PRESENT' },
  { id: '4', name: 'Vikram Joshi', phone: '9422001122', lunch: 'UNMARKED', lunchLocation: '—', dinner: 'UNMARKED' },
  { id: '5', name: 'Pooja Kulkarni', phone: '9890112233', lunch: 'ABSENT', lunchLocation: '—', dinner: 'ABSENT' },
  { id: '6', name: 'Rohan Mehra', phone: '9811223344', lunch: 'PRESENT', lunchLocation: 'College (Gate 1)', dinner: 'PENDING' },
];
