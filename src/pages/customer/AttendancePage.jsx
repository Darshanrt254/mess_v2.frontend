import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MealAttendanceCard } from '@/components/meals/MealAttendanceCard';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Info } from 'lucide-react';
import { useCustomerMealsToday, useMarkAttendance } from '@/hooks/useCustomer';
import { PAYMENT_SUSPENSION_MESSAGE } from '@/config/constants';

export function AttendancePage() {
  const { data: mealsData, isLoading, error } = useCustomerMealsToday();
  const markAttendanceMutation = useMarkAttendance();
  const [actionError, setActionError] = useState(null);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading today's attendance status..." />
      </div>
    );
  }

  const lunchState = mealsData?.lunch;
  const dinnerState = mealsData?.dinner;
  const isPaymentSuspended = Boolean(mealsData?.isPaymentSuspended);
  const isServiceSuspended = Boolean(mealsData?.isServiceSuspended);
  const isSuspended = isPaymentSuspended || isServiceSuspended;

  const handleConfirm = async (mealType, choice) => {
    setActionError(null);
    try {
      await markAttendanceMutation.mutateAsync({ mealType, status: choice });
    } catch (err) {
      setActionError(err.message || 'Failed to update attendance');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Meal Attendance"
        subtitle="Specify your daily presence for Lunch and Dinner before the cutoff deadlines."
        badge={<Badge variant="brand" size="sm">Daily Check</Badge>}
      />

      {actionError && (
        <Alert variant="danger" title="Error">
          {actionError}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Connection Error">
          {error.message}
        </Alert>
      )}

      {isPaymentSuspended ? (
        <Alert variant="danger" title="Payment Pending">
          {PAYMENT_SUSPENSION_MESSAGE}
        </Alert>
      ) : isServiceSuspended ? (
        <Alert variant="warning" title="Account Paused">
          Your tiffin service is currently suspended. Daily attendance marking is paused.
        </Alert>
      ) : (
        <Alert variant="info" title="Cutoff Time Policy">
          Lunch cutoff is strictly 10:30 AM. Dinner cutoff is 05:30 PM. Each attendance choice requires confirmation and cannot be modified once confirmed.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lunchState && (
          <MealAttendanceCard
            mealType="LUNCH"
            status={lunchState.status}
            cutoffTime="10:30 AM"
            location={lunchState.location}
            isLocked={lunchState.locked || isSuspended}
            onConfirmAttendance={handleConfirm}
          />
        )}
        {dinnerState?.serviceAvailable && (
          <MealAttendanceCard
            mealType="DINNER"
            status={dinnerState.status}
            cutoffTime="05:30 PM"
            isLocked={dinnerState.locked || isSuspended}
            onConfirmAttendance={handleConfirm}
          />
        )}
      </div>

      <Card
        title="Attendance Guidelines"
        subtitle="How your tiffin balance is tracked"
        icon={<Info className="w-5 h-5 text-brand-orange" />}
      >
        <ul className="space-y-2 text-xs font-bold text-brand-green leading-relaxed list-disc list-inside font-nunito">
          <li>Marking <strong>Absent</strong> before cutoff saves your tiffin meal for later.</li>
          <li>Once you confirm attendance, the choice is locked for today in the backend.</li>
          <li>Marking Lunch <strong>Present</strong> allows you to vote on the Lunch Delivery Poll (College vs Restaurant).</li>
          <li>Marking Lunch <strong>Absent</strong> cancels today&apos;s lunch dispatch and removes the lunch poll.</li>
          <li>For long leave or vacation, contact the mess owner to arrange a scheduled service pause.</li>
        </ul>
      </Card>
    </div>
  );
}
