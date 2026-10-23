import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AttendanceCalendarPreview, computeDayAttendanceState } from '@/components/attendance/AttendanceCalendarPreview';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { useCustomerMealsToday, useCustomerAttendanceHistory } from '@/hooks/useCustomer';
import { clampToReportingBoundary } from '@/utils/planLabels';

export function CalendarPage() {
  const { data: mealsData, isLoading: isMealsLoading, error: mealsError } = useCustomerMealsToday();

  // Derive initial year and month from backend businessDate, respecting October 2026 boundary
  const businessDate = mealsData?.businessDate || '';
  const initialDate = businessDate ? new Date(`${businessDate}T12:00:00Z`) : new Date();

  const parsedYear = initialDate.getFullYear() || 2026;
  const parsedMonth = initialDate.getMonth() + 1 || 10;
  const initialYear = parsedYear < 2026 ? 2026 : parsedYear;
  const initialMonth = (initialYear === 2026 && parsedMonth < 10) ? 10 : parsedMonth;

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth); // 1-indexed

  // Format from and to boundaries for the selected month, clamped to 2026-10-01
  const monthStr = String(currentMonth).padStart(2, '0');
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const rawFrom = `${currentYear}-${monthStr}-01`;
  const from = clampToReportingBoundary(rawFrom);
  const to = `${currentYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useCustomerAttendanceHistory({ from, to });

  // Reporting boundary constraint: do not navigate earlier than October 2026
  const canGoPrev = currentYear > 2026 || (currentYear === 2026 && currentMonth > 10);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthLabel = `${monthNames[currentMonth - 1]} ${currentYear}`;

  if (isMealsLoading && !historyData) {
    return (
      <div className="py-12">
        <LoadingState message="Loading attendance records..." />
      </div>
    );
  }

  const lunchStatus = mealsData?.lunch?.status || 'UNMARKED';
  const dinnerStatus = mealsData?.dinner?.status || 'UNMARKED';
  const totalMealsToday = (lunchStatus === 'PRESENT' ? 1 : 0) + (dinnerStatus === 'PRESENT' ? 1 : 0);

  // Map backend history days
  const calendarDays =
    historyData?.days?.map((d) => {
      const isToday = d.date === businessDate;
      const isSunday = d.dayOfWeek === 'SUNDAY';
      const dayLunch = isToday && mealsData?.lunch ? mealsData.lunch.status : d.lunch?.status;
      const dayDinner = isToday && mealsData?.dinner ? mealsData.dinner.status : d.dinner?.status;

      const state = computeDayAttendanceState(dayLunch, dayDinner, isToday, isSunday);
      const dayNum = parseInt(d.date.split('-')[2], 10);

      return {
        date: d.date,
        day: dayNum,
        dayOfWeek: d.dayOfWeek,
        lunch: dayLunch,
        dinner: dayDinner,
        lunchLocation: d.lunch?.location,
        dinnerLocation: d.dinner?.location,
        lunchToken: d.lunch?.mealToken,
        dinnerToken: d.dinner?.mealToken,
        lunchReason: d.lunch?.reason,
        dinnerReason: d.dinner?.reason,
        lunchServiceAvailable: d.lunch?.serviceAvailable,
        dinnerServiceAvailable: d.dinner?.serviceAvailable,
        isToday,
        state,
      };
    }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Calendar"
        subtitle="Daily attendance history and meal tracking loaded from server."
      />

      {historyError && (
        <Alert variant="danger" title="Error Loading Attendance History">
          {historyError.message}
        </Alert>
      )}

      {mealsError && (
        <Alert variant="danger" title="Error Loading Today's Status">
          {mealsError.message}
        </Alert>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Today Meals Taken"
          value={totalMealsToday}
          variant="green"
        />
        <StatCard
          label="Lunch Status"
          value={lunchStatus}
          variant="default"
        />
        <StatCard
          label="Dinner Status"
          value={dinnerStatus}
          variant="default"
        />
        <StatCard
          label="Tiffin Balance"
          value={mealsData?.remainingTiffins ?? '—'}
          variant="yellow"
        />
      </div>

      {isHistoryLoading ? (
        <div className="py-8">
          <LoadingState message={`Loading ${monthLabel} records...`} />
        </div>
      ) : (
        <AttendanceCalendarPreview
          monthName={monthLabel}
          days={calendarDays}
          onPrevMonth={canGoPrev ? handlePrevMonth : undefined}
          onNextMonth={handleNextMonth}
          action={
            <Badge variant="brand" size="sm">
              Historical Records
            </Badge>
          }
        />
      )}
    </div>
  );
}
