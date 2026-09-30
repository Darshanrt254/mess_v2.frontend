import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AttendanceCalendarPreview } from '@/components/attendance/AttendanceCalendarPreview';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { useCustomerMealsToday } from '@/hooks/useCustomer';

export function CalendarPage() {
  const { data: mealsData, isLoading } = useCustomerMealsToday();

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading attendance records..." />
      </div>
    );
  }

  const businessDate = mealsData?.businessDate || '';
  const dayNumber = businessDate ? parseInt(businessDate.split('-')[2], 10) : new Date().getDate();
  const lunchStatus = mealsData?.lunch?.status || 'UNMARKED';
  const dinnerStatus = mealsData?.dinner?.status || 'UNMARKED';

  const todayState =
    lunchStatus === 'PRESENT' && dinnerStatus === 'PRESENT'
      ? 'FAINT'
      : (lunchStatus === 'PRESENT' && dinnerStatus === 'ABSENT') ||
        (lunchStatus === 'ABSENT' && dinnerStatus === 'PRESENT')
      ? 'LIGHT'
      : lunchStatus === 'ABSENT' && dinnerStatus === 'ABSENT'
      ? 'DARK'
      : 'TODAY';

  const realDays = [
    {
      day: dayNumber,
      lunch: lunchStatus,
      dinner: dinnerStatus,
      isToday: true,
      state: todayState,
    },
  ];

  const totalMealsToday = (lunchStatus === 'PRESENT' ? 1 : 0) + (dinnerStatus === 'PRESENT' ? 1 : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Calendar"
        subtitle="Daily attendance tracking and meal records from backend."
      />

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
          value={mealsData?.remainingTiffins ?? 0}
          variant="yellow"
        />
      </div>

      <AttendanceCalendarPreview
        monthName={businessDate ? `Business Date: ${businessDate}` : 'Current Month'}
        days={realDays}
        action={
          <Badge variant="brand" size="sm">
            Live Record
          </Badge>
        }
      />
    </div>
  );
}
