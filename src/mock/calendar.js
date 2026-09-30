/**
 * Mock Attendance Calendar Data Layer
 * 
 * Accurately models combined Lunch + Dinner attendance:
 * - FAINT: Both Present
 * - LIGHT: One Present (Lunch or Dinner)
 * - DARK: Both Absent
 * - TODAY: Light Blue (Today is pending final dinner confirmation)
 */

export const mockCalendarMonthDays = [
  { day: 1, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 2, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 3, lunch: 'PRESENT', dinner: 'ABSENT' },  // LIGHT
  { day: 4, lunch: 'ABSENT',  dinner: 'ABSENT' },  // DARK
  { day: 5, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 6, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 7, lunch: 'ABSENT',  dinner: 'ABSENT' },  // DARK
  { day: 8, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 9, lunch: 'ABSENT',  dinner: 'PRESENT' },  // LIGHT
  { day: 10, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 11, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 12, lunch: 'ABSENT',  dinner: 'ABSENT' },  // DARK
  { day: 13, lunch: 'ABSENT',  dinner: 'ABSENT' },  // DARK
  { day: 14, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 15, lunch: 'PRESENT', dinner: 'ABSENT' },  // LIGHT
  { day: 16, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 17, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 18, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 19, lunch: 'ABSENT',  dinner: 'ABSENT' },  // DARK
  { day: 20, lunch: 'ABSENT',  dinner: 'PRESENT' },  // LIGHT
  { day: 21, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 22, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 23, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 24, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 25, lunch: 'ABSENT',  dinner: 'ABSENT' },  // DARK
  { day: 26, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 27, lunch: 'PRESENT', dinner: 'ABSENT' },  // LIGHT
  { day: 28, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 29, lunch: 'PRESENT', dinner: 'PRESENT' }, // FAINT
  { day: 30, lunch: 'PRESENT', dinner: 'PENDING', isToday: true }, // TODAY (Light Blue)
];

export const mockCalendarSummary = {
  totalMealsTaken: 48,
  bothPresentDays: 21,
  onePresentDays: 6,
  bothAbsentDays: 3,
  trackedDays: 30,
};
