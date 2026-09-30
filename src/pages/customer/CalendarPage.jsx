import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AttendanceCalendarPreview, computeDayAttendanceState } from '@/components/attendance/AttendanceCalendarPreview';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { useCustomerMealsToday, useCustomerAttendanceHistory } from '@/hooks/useCustomer';

export function CalendarPage() {
  const { data: mealsData, isLoading: isMealsLoading, error: mealsError } = useCustomerMealsToday();

  // Derive initial year and month from backend businessDate (or current date)
  const businessDate = mealsData?.businessDate || '';
  const initialDate = businessDate ? new Date(`${businessDate}T12:00:00Z`) : new Date();

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() + 1 || 9); // 1-indexed

  // Format from and to boundaries for the selected month
  const monthStr = String(currentMonth).padStart(2, '0');
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const from = `${currentYear}-${monthStr}-01`;
  const to = `${currentYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useCustomerAttendanceHistory({ from, to });

  const handlePrevMonth = () => {
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
          onPrevMonth={handlePrevMonth}
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
