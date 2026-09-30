/**
 * Calendar Attendance State Evaluation Rules
 *
 * Rules:
 * - FAINT: Lunch PRESENT + Dinner PRESENT
 * - LIGHT: Exactly one meal PRESENT
 * - DARK: Both meals ABSENT
 * - TODAY: Today has unresolved attendance
 * - NEUTRAL: Unmarked / Missing attendance (Missing attendance record != ABSENT)
 * - Sunday dinner: NOT_AVAILABLE (Do not treat Sunday dinner as ABSENT)
 */
export function computeDayAttendanceState(lunch, dinner, isToday = false, isSunday = false) {
  const isLunchPresent = lunch === 'PRESENT';
  const isLunchAbsent = lunch === 'ABSENT';
  const isDinnerPresent = dinner === 'PRESENT';
  const isDinnerAbsent = dinner === 'ABSENT';
  const isDinnerUnavailable = dinner === 'NOT_AVAILABLE' || isSunday;

  if (isToday) {
    const lunchUnresolved = !lunch || lunch === 'UNMARKED' || lunch === 'PENDING';
    const dinnerUnresolved = !isDinnerUnavailable && (!dinner || dinner === 'UNMARKED' || dinner === 'PENDING');
    if (lunchUnresolved || dinnerUnresolved) {
      return 'TODAY';
    }
  }

  // 1. Both Present
  if (isLunchPresent && isDinnerPresent) {
    return 'FAINT';
  }

  // 2. Exactly one present
  if (
    (isLunchPresent && isDinnerAbsent) ||
    (isLunchAbsent && isDinnerPresent) ||
    (isLunchPresent && isDinnerUnavailable)
  ) {
    return 'LIGHT';
  }

  // 3. Both Absent
  if (
    (isLunchAbsent && isDinnerAbsent) ||
    (isLunchAbsent && isDinnerUnavailable)
  ) {
    return 'DARK';
  }

  // Missing or unmarked attendance
  return isToday ? 'TODAY' : 'NEUTRAL';
}

/**
 * Calculates start and end dates for a calendar month
 */
export function computeMonthDateRange(year, month) {
  const monthStr = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${monthStr}-01`,
    to: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
  };
}
