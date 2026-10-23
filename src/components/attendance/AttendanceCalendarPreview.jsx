import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Ticket, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CALENDAR_STATES } from '@/styles/tokens';
import { cn } from '@/utils/cn';
import { computeDayAttendanceState } from '@/utils/calendarRules';

export { computeDayAttendanceState };

export function AttendanceCalendarPreview({
  monthName = 'September 2026',
  days = [],
  onPrevMonth,
  onNextMonth,
  action,
  className = '',
}) {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [selectedDay, setSelectedDay] = useState(null);

  // Compute leading padding slots based on the first day's weekday
  // Monday = 0, Tuesday = 1, ..., Sunday = 6
  let leadingPadding = 0;
  if (days.length > 0 && days[0].date) {
    const firstDate = new Date(`${days[0].date}T12:00:00Z`);
    // JavaScript getUTCDay: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const jsDay = firstDate.getUTCDay();
    leadingPadding = jsDay === 0 ? 6 : jsDay - 1;
  }

  const resolveDayState = (item) => {
    if (item.state) return item.state;
    const isSunday = item.dayOfWeek === 'SUNDAY';
    return computeDayAttendanceState(item.lunch, item.dinner, item.isToday, isSunday);
  };

  const formatStatus = (status) => {
    if (!status || status === 'UNMARKED') return 'Unmarked';
    if (status === 'PRESENT') return 'Present';
    if (status === 'ABSENT') return 'Absent';
    if (status === 'NOT_AVAILABLE') return 'No Service';
    return status;
  };

  const formatLocation = (loc) => {
    if (!loc) return '—';
    if (loc === 'COLLEGE') return 'College';
    if (loc === 'RESTAURANT') return 'Restaurant';
    return loc;
  };

  return (
    <Card
      title="Attendance Calendar"
      subtitle={monthName}
      icon={<CalendarIcon className="w-5 h-5 text-brand-orange" />}
      action={
        <div className="flex items-center gap-2">
          {onPrevMonth && (
            <button
              type="button"
              onClick={onPrevMonth}
              className="p-1 rounded hover:bg-brand-orange/20 text-brand-darkGreen transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {onNextMonth && (
            <button
              type="button"
              onClick={onNextMonth}
              className="p-1 rounded hover:bg-brand-orange/20 text-brand-darkGreen transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {action}
        </div>
      }
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
        {/* Leading empty padding slots */}
        {Array.from({ length: leadingPadding }).map((_, pIdx) => (
          <div key={`pad-${pIdx}`} className="aspect-square" aria-hidden="true" />
        ))}

        {days.map((item, idx) => {
          const stateKey = resolveDayState(item);
          const stateConfig = CALENDAR_STATES[stateKey] || CALENDAR_STATES.NEUTRAL;
          const isSelected = selectedDay && selectedDay.date === item.date;

          return (
            <button
              type="button"
              key={item.date || idx}
              onClick={() => setSelectedDay(item)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-brand-sm text-xs font-black border transition-all cursor-pointer select-none',
                stateConfig.classNames,
                isSelected && 'ring-3 ring-brand-orange ring-offset-1 scale-105 z-10'
              )}
              title={`Day ${item.day}: ${stateConfig.label} (Click for details)`}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      {/* Day Details Card (shown when clicking a day) */}
      {selectedDay && (
        <div className="mt-4 p-4 rounded-brand-sm bg-brand-creamLight border-2 border-brand-orange font-nunito animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-brand-orange/30 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-brand-orange" />
              <span className="text-sm font-black text-brand-darkGreen">
                Details for {selectedDay.date} ({selectedDay.dayOfWeek || 'DAY'})
              </span>
              {selectedDay.isToday && (
                <Badge variant="brand" size="sm">Today</Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-brand-darkGreen/60 hover:text-brand-darkGreen p-1"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Lunch Details */}
            <div className="p-3 bg-white/70 rounded-brand-sm border border-brand-orange/20">
              <span className="font-black text-brand-darkGreen block uppercase tracking-wide text-[10px] mb-1">
                Lunch
              </span>
              <div className="space-y-1 text-brand-darkGreen font-bold">
                {selectedDay.lunchServiceAvailable === false ? (
                  <div className="text-brand-orange font-black">
                    {selectedDay.lunchReason === 'PLAN_EXCLUDED'
                      ? 'Excluded (Meal Plan)'
                      : selectedDay.lunchReason === 'PRE_ENROLLMENT'
                      ? 'Pre-Enrollment'
                      : selectedDay.lunchReason === 'SERVICE_SUSPENDED'
                      ? 'Service Suspended'
                      : 'No Service'}
                  </div>
                ) : (
                  <>
                    <div>
                      Status: <span className="font-black">{formatStatus(selectedDay.lunch)}</span>
                    </div>
                    <div>
                      Location: <span className="font-black">{formatLocation(selectedDay.lunchLocation)}</span>
                    </div>
                    <div>
                      Token:{' '}
                      <span className="font-mono font-black">
                        {selectedDay.lunchToken?.tokenString ||
                          selectedDay.lunchToken?.tokenNumber ||
                          selectedDay.lunchToken?.id ||
                          '—'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dinner Details */}
            <div className="p-3 bg-white/70 rounded-brand-sm border border-brand-orange/20">
              <span className="font-black text-brand-darkGreen block uppercase tracking-wide text-[10px] mb-1">
                Dinner
              </span>
              <div className="space-y-1 text-brand-darkGreen font-bold">
                {selectedDay.dayOfWeek === 'SUNDAY' || selectedDay.dinnerServiceAvailable === false ? (
                  <div className="text-brand-orange font-black">
                    {selectedDay.dinnerReason === 'PLAN_EXCLUDED'
                      ? 'Excluded (Meal Plan)'
                      : selectedDay.dinnerReason === 'PRE_ENROLLMENT'
                      ? 'Pre-Enrollment'
                      : selectedDay.dinnerReason === 'SERVICE_SUSPENDED'
                      ? 'Service Suspended'
                      : 'No Service (Sunday)'}
                  </div>
                ) : (
                  <>
                    <div>
                      Status: <span className="font-black">{formatStatus(selectedDay.dinner)}</span>
                    </div>
                    <div>
                      Location: <span className="font-black">{formatLocation(selectedDay.dinnerLocation || 'RESTAURANT')}</span>
                    </div>
                    <div>
                      Token:{' '}
                      <span className="font-mono font-black">
                        {selectedDay.dinnerToken?.tokenString ||
                          selectedDay.dinnerToken?.tokenNumber ||
                          selectedDay.dinnerToken?.id ||
                          '—'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend with REQUIRED exact color mapping:
          [dark]   Both Absent
          [light]  One Present
          [faint]  Both Present
          [blue]   Today (Pending)
          [neutral] Unmarked
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

        {/* 5. NEUTRAL: Unmarked */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn('w-3.5 h-3.5 rounded-sm inline-block shrink-0', CALENDAR_STATES.NEUTRAL.dotClass)}
            aria-hidden="true"
          />
          <span>Unmarked</span>
        </div>
      </div>
    </Card>
  );
}
