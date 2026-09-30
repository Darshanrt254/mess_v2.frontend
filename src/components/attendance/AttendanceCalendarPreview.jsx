import React from 'react';
import { Card } from '@/components/ui/Card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { CALENDAR_STATES } from '@/styles/tokens';
import { cn } from '@/utils/cn';

/**
 * Computes a day's visual attendance state based on COMBINED Lunch + Dinner attendance.
 * 
 * Mapping:
 * - Lunch PRESENT + Dinner PRESENT -> FAINT (Lightest attendance color)
 * - Lunch PRESENT + Dinner ABSENT  -> LIGHT (One present)
 * - Lunch ABSENT  + Dinner PRESENT -> LIGHT (One present)
 * - Lunch ABSENT  + Dinner ABSENT  -> DARK  (Both absent)
 * - Today (while unresolved/pending) -> TODAY (Dedicated light blue)
 * - Historical unmarked -> NEUTRAL
 */
export function computeDayAttendanceState(lunch, dinner, isToday = false) {
  if (isToday) {
    // If today's dinner or final attendance is unresolved, today MUST use dedicated light blue
    if (dinner === 'PENDING' || lunch === 'PENDING' || !dinner || !lunch) {
      return 'TODAY';
    }
  }

  if (lunch === 'PRESENT' && dinner === 'PRESENT') {
    return 'FAINT';
  }
  if (
    (lunch === 'PRESENT' && dinner === 'ABSENT') ||
    (lunch === 'ABSENT' && dinner === 'PRESENT')
  ) {
    return 'LIGHT';
  }
  if (lunch === 'ABSENT' && dinner === 'ABSENT') {
    return 'DARK';
  }

  return isToday ? 'TODAY' : 'NEUTRAL';
}

export function AttendanceCalendarPreview({
  monthName = 'September 2026',
  days = [],
  action,
  className = '',
}) {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Default sample preview days demonstrating the exact combined states:
  // Day 1-29: historical combinations.
  // Day 30: Today (pending final dinner attendance -> light blue override).
  const defaultDays = days.length > 0 ? days : [
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

  const resolveDayState = (item) => {
    if (item.state) return item.state;
    return computeDayAttendanceState(item.lunch, item.dinner, item.isToday);
  };

  return (
    <Card
      title="Attendance Calendar"
      subtitle={monthName}
      icon={<CalendarIcon className="w-5 h-5 text-brand-orange" />}
      action={action}
      className={className}
    >
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
        {weekDays.map((d, i) => (
          <div key={i} className="text-[11px] font-black text-brand-green">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {defaultDays.map((item, idx) => {
          const stateKey = resolveDayState(item);
          const stateConfig = CALENDAR_STATES[stateKey] || CALENDAR_STATES.NEUTRAL;

          return (
            <div
              key={idx}
              className={cn(
                'aspect-square flex items-center justify-center rounded-brand-sm text-xs font-black border transition-transform hover:scale-110 cursor-default select-none',
                stateConfig.classNames
              )}
              title={`Day ${item.day}: ${stateConfig.label}`}
            >
              {item.day}
            </div>
          );
        })}
      </div>

      {/* Legend with REQUIRED exact color mapping:
          [dark]   Both Absent
          [light]  One Present
          [faint]  Both Present
          [blue]   Today (Pending)
      */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4 mt-4 border-t border-brand-orange/20 text-[11px] font-bold text-brand-green">
        {/* 1. DARK: Both Absent */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn('w-3.5 h-3.5 rounded-sm inline-block shrink-0', CALENDAR_STATES.DARK.dotClass)}
            aria-hidden="true"
          />
          <span>Both Absent</span>
        </div>

        {/* 2. LIGHT: One Present */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn('w-3.5 h-3.5 rounded-sm inline-block shrink-0', CALENDAR_STATES.LIGHT.dotClass)}
            aria-hidden="true"
          />
          <span>One Present</span>
        </div>

        {/* 3. FAINT: Both Present */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn('w-3.5 h-3.5 rounded-sm inline-block shrink-0', CALENDAR_STATES.FAINT.dotClass)}
            aria-hidden="true"
          />
          <span>Both Present</span>
        </div>

        {/* 4. TODAY: Today (Pending) */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn('w-3.5 h-3.5 rounded-sm inline-block shrink-0', CALENDAR_STATES.TODAY.dotClass)}
            aria-hidden="true"
          />
          <span>Today (Pending)</span>
        </div>
      </div>
    </Card>
  );
}
