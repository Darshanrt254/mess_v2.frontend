import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MealAttendanceCard } from '@/components/meals/MealAttendanceCard';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Info } from 'lucide-react';
import { useCustomerMealsToday, useMarkAttendance, useVotePoll } from '@/hooks/useCustomer';
import { PollVoteModal } from '@/components/poll/PollVoteModal';
import { PAYMENT_SUSPENSION_MESSAGE } from '@/config/constants';

export function AttendancePage() {
  const { data: mealsData, isLoading, error } = useCustomerMealsToday();
  const markAttendanceMutation = useMarkAttendance();
  const votePollMutation = useVotePoll();
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading today's attendance status..." />
      </div>
    );
  }

  const lunchState = mealsData?.lunch;
  const dinnerState = mealsData?.dinner;
  const pollState = mealsData?.poll;
  const dayOfWeek = mealsData?.dayOfWeek;
  const isPaymentSuspended = Boolean(mealsData?.isPaymentSuspended);
  const isServiceSuspended = Boolean(mealsData?.isServiceSuspended);
  const isSuspended = isPaymentSuspended || isServiceSuspended;

  const isPollLive = Boolean(pollState?.pollExists && pollState?.status === 'OPEN');
  const hasVotedPoll = Boolean(pollState?.existingVote);

  const handleVotePollSubmit = async (location) => {
    setActionError(null);
    try {
      await votePollMutation.mutateAsync({ location });
      setIsPollModalOpen(false);
      setSuccessMessage('Lunch token generated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to vote and generate token');
      throw err;
    }
  };

  const handleConfirm = async (mealType, choice) => {
    setActionError(null);
    try {
      const res = await markAttendanceMutation.mutateAsync({ mealType, status: choice });
      if (res?.requiresPollVote) {
        setIsPollModalOpen(true);
      } else if (choice === 'PRESENT') {
        setSuccessMessage(`${mealType === 'LUNCH' ? 'Lunch' : 'Dinner'} token generated successfully!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
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

      {successMessage && (
        <Alert variant="success" title="Token Generated">
          {successMessage}
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

      <div className={`grid grid-cols-1 ${dinnerState?.serviceAvailable ? 'sm:grid-cols-2' : ''} gap-4`}>
        {lunchState && (
          <MealAttendanceCard
            mealType="LUNCH"
            status={lunchState.status}
            cutoffTime={dayOfWeek === 'SUNDAY' ? '11:00 AM' : '10:30 AM'}
            location={lunchState.location || pollState?.existingVote}
            isLocked={lunchState.locked || isSuspended}
            isPollLive={isPollLive}
            hasVotedPoll={hasVotedPoll}
            onRequestPollVote={() => setIsPollModalOpen(true)}
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

      {/* Sunday Note */}
      {dayOfWeek === 'SUNDAY' && (
        <div className="p-3.5 bg-brand-yellow/20 rounded-brand-sm border border-brand-orange/40 text-center font-nunito text-xs font-bold text-brand-green">
          <span>🌙 Sunday Dinner: Kitchen is closed on Sunday evenings (No service).</span>
        </div>
      )}

      {/* Saturday Schedule Note */}
      {dayOfWeek === 'SATURDAY' && (
        <div className="p-3 bg-brand-creamLight rounded-brand-sm border border-brand-orange/40 text-center font-nunito text-xs font-bold text-brand-green">
          <span>🍴 Saturday Schedule: All meals (Lunch and Dinner) are served dine-in at the Restaurant. No college delivery or poll.</span>
        </div>
      )}

      <Card
        title="Attendance Guidelines"
        subtitle="How your tiffin balance is tracked"
        icon={<Info className="w-5 h-5 text-brand-orange" />}
      >
        <ul className="space-y-2 text-xs font-bold text-brand-green leading-relaxed list-disc list-inside font-nunito">
          <li>Marking <strong>Absent</strong> before cutoff saves your tiffin meal for later.</li>
          <li>Once you confirm attendance, the choice is locked for today in the backend.</li>
          <li>Monday–Friday: Marking Lunch <strong>Present</strong> allows you to vote on the Lunch Delivery Poll (College vs Restaurant).</li>
          <li>Saturday & Sunday: All lunches are served dine-in at the restaurant. No poll is required.</li>
          <li>Saturday: Dinner service is available dine-in at the restaurant.</li>
          <li>Sunday: Dinner service is closed.</li>
          <li>For long leave or vacation, contact the mess owner to arrange a scheduled service pause.</li>
        </ul>
      </Card>

      <PollVoteModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onConfirm={handleVotePollSubmit}
        isLoading={votePollMutation.isPending}
      />
    </div>
  );
}
