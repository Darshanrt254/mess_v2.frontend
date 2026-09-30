import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { MealAttendanceCard } from '@/components/meals/MealAttendanceCard';
import { MealTokenCard } from '@/components/meals/MealTokenCard';
import { LunchPollCard } from '@/components/poll/LunchPollCard';
import { AttendanceCalendarPreview } from '@/components/attendance/AttendanceCalendarPreview';
import { SuspensionBanner } from '@/components/customers/SuspensionBanner';
import { useAuth } from '@/hooks/useAuth';
import {
  useCustomerProfile,
  useCustomerMealsToday,
  useMarkAttendance,
  useVotePoll,
  useSendCustomerMessage,
} from '@/hooks/useCustomer';
import {
  Utensils,
  MessageSquare,
  Send,
  CheckCircle,
} from 'lucide-react';

const SUPPORT_CONTACT = '+91 91655 35902';

export function CustomerDashboardPage() {
  const { user } = useAuth();

  // Real backend queries
  const { data: customerProfile, isLoading: isProfileLoading } = useCustomerProfile();
  const { data: mealsData, isLoading: isMealsLoading, error: mealsError } = useCustomerMealsToday();

  // Mutations
  const markAttendanceMutation = useMarkAttendance();
  const votePollMutation = useVotePoll();
  const sendMessageMutation = useSendCustomerMessage();

  // Local state for kitchen message input and feedback
  const [kitchenNote, setKitchenNote] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (isProfileLoading || isMealsLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading your meal dashboard..." />
      </div>
    );
  }

  // Derive authoritative customer & meal values from backend
  const customerName = customerProfile?.name || user?.name || 'Customer';
  const remainingTiffins = mealsData?.remainingTiffins ?? customerProfile?.remainingTiffins ?? 0;
  const isPaymentSuspended = mealsData?.isPaymentSuspended || remainingTiffins <= 0;
  const isServiceSuspended = mealsData?.isServiceSuspended || mealsData?.serviceStatus === 'SERVICE_SUSPENDED';
  const isSuspended = isPaymentSuspended || isServiceSuspended;

  const lunchState = mealsData?.lunch;
  const dinnerState = mealsData?.dinner;
  const pollState = mealsData?.poll;

  const dayOfWeek = mealsData?.dayOfWeek || 'TODAY';
  const businessDate = mealsData?.businessDate || '';
  const dateLabel = businessDate ? `Today: ${dayOfWeek}, ${businessDate}` : `Today: ${dayOfWeek}`;

  // Attendance handlers
  const handleConfirmAttendance = async (mealType, choice) => {
    setActionError(null);
    try {
      await markAttendanceMutation.mutateAsync({ mealType, status: choice });
    } catch (err) {
      setActionError(err.message || 'Failed to update attendance');
    }
  };

  // Lunch Poll Handler
  const handleConfirmPollVote = async (choice) => {
    setActionError(null);
    try {
      await votePollMutation.mutateAsync({ location: choice });
    } catch (err) {
      setActionError(err.message || 'Failed to submit poll vote');
    }
  };

  // Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!kitchenNote.trim()) return;
    setActionError(null);
    try {
      await sendMessageMutation.mutateAsync({ content: kitchenNote });
      setKitchenNote('');
      setMessageSuccess(true);
      setTimeout(() => setMessageSuccess(false), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to send message to kitchen');
    }
  };

  // Format token if available
  const activeToken = lunchState?.mealToken
    ? {
        ...lunchState.mealToken,
        tokenId: lunchState.mealToken.tokenString || lunchState.mealToken.id,
        tokenDisplayNumber: lunchState.mealToken.counterNumber ? `#${lunchState.mealToken.counterNumber}` : undefined,
        targetLocation: lunchState.location === 'COLLEGE' ? 'Campus Delivery' : 'Swayamsiddha Restaurant',
      }
    : null;

  // Calendar day calculation based on today's real attendance
  const todayCalendarState =
    lunchState?.status === 'PRESENT' && dinnerState?.status === 'PRESENT'
      ? 'FAINT'
      : (lunchState?.status === 'PRESENT' && dinnerState?.status === 'ABSENT') ||
        (lunchState?.status === 'ABSENT' && dinnerState?.status === 'PRESENT')
      ? 'LIGHT'
      : lunchState?.status === 'ABSENT' && dinnerState?.status === 'ABSENT'
      ? 'DARK'
      : 'TODAY';

  const todayDayNumber = businessDate ? parseInt(businessDate.split('-')[2], 10) : new Date().getDate();

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title={`Namaste, ${customerName}!`}
        subtitle="Manage your daily tiffins, attendance, and meal preferences."
        dateSubtitle={dateLabel}
        badge={
          <Badge
            variant={
              isSuspended
                ? 'danger'
                : remainingTiffins <= 5
                ? 'warning'
                : 'brand'
            }
            size="sm"
          >
            {isServiceSuspended
              ? 'Service Suspended'
              : isPaymentSuspended
              ? 'Payment Pending'
              : 'Active Member'}
          </Badge>
        }
      />

      {/* Action / Mutation error feedback */}
      {actionError && (
        <Alert variant="danger" title="Action Failed">
          {actionError}
        </Alert>
      )}

      {mealsError && (
        <Alert variant="danger" title="Error Loading Meal Status">
          {mealsError.message}
        </Alert>
      )}

      {/* Suspension & Low Balance Warning Banners */}
      <SuspensionBanner
        status={
          isPaymentSuspended
            ? 'PAYMENT_SUSPENDED'
            : isServiceSuspended
            ? 'SERVICE_SUSPENDED'
            : remainingTiffins <= 5
            ? 'LOW_BALANCE'
            : 'ACTIVE'
        }
        balance={remainingTiffins}
        contactPhone={SUPPORT_CONTACT}
      />

      {/* 2. Tiffin Balance Card */}
      <Card
        variant="green"
        title="Tiffin Account Balance"
        subtitle="Current Plan: Regular Tiffin Service"
        icon={<Utensils className="w-5 h-5 text-brand-yellow" />}
        action={
          <Badge variant="brand" size="sm">
            Status: {mealsData?.serviceStatus || 'ACTIVE'}
          </Badge>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          <div className="bg-white/10 rounded-brand-sm p-3 text-center border border-white/10">
            <span className="block text-2xl font-black text-brand-yellow">
              {remainingTiffins}
            </span>
            <span className="block text-[11px] font-bold text-brand-creamLight/80">Remaining Tiffins</span>
          </div>
          <div className="bg-white/10 rounded-brand-sm p-3 text-center border border-white/10">
            <span className="block text-2xl font-black text-white">
              {lunchState?.status === 'PRESENT' ? '1' : '0'}
            </span>
            <span className="block text-[11px] font-bold text-brand-creamLight/80">Today Taken</span>
          </div>
          <div className="bg-white/10 rounded-brand-sm p-3 text-center border border-white/10">
            <span className={`block text-2xl font-black ${isSuspended ? 'text-red-300' : 'text-emerald-300'}`}>
              {isSuspended ? 'Suspended' : 'Active'}
            </span>
            <span className="block text-[11px] font-bold text-brand-creamLight/80">Subscription</span>
          </div>
          <div className="bg-white/10 rounded-brand-sm p-3 text-center border border-white/10">
            <span className="block text-2xl font-black text-brand-orangeLight">
              {isPaymentSuspended ? 'Yes' : 'None'}
            </span>
            <span className="block text-[11px] font-bold text-brand-creamLight/80">Payment Due</span>
          </div>
        </div>
      </Card>

      {/* Zero balance / Payment suspension state */}
      {isPaymentSuspended && (
        <Card
          title="Tiffin Balance Exhausted"
          subtitle="Service renewal required"
          icon={<Utensils className="w-5 h-5 text-brand-orange" />}
        >
          <div className="p-6 text-center space-y-3 font-nunito">
            <p className="text-base font-black text-red-700 max-w-md mx-auto">
              Your tiffin balance is 0. Please contact {SUPPORT_CONTACT} for payment and resuming your services.
            </p>
            <p className="text-xs font-bold text-brand-green">
              Attendance and poll voting are paused until a recharge is recorded.
            </p>
          </div>
        </Card>
      )}

      {/* Service Suspension State */}
      {isServiceSuspended && !isPaymentSuspended && (
        <Card
          title="Daily Meal Operations Paused"
          subtitle="Your account is temporarily suspended"
          icon={<Utensils className="w-5 h-5 text-brand-orange" />}
        >
          <div className="p-6 text-center space-y-3 font-nunito">
            <p className="text-sm font-bold text-brand-darkGreen max-w-md mx-auto">
              Daily attendance marking and meal dispatches are temporarily paused during your approved service suspension.
            </p>
            <p className="text-xs font-black text-brand-green">
              Please contact the mess management at <span className="underline">{SUPPORT_CONTACT}</span> for any changes.
            </p>
          </div>
        </Card>
      )}

      {/* Normal Active Operations (Attendance, Poll, Tokens) */}
      {!isSuspended && (
        <>
          {/* 3. Today's Meals (Lunch & Dinner Attendance Cards) */}
          <div className={`grid grid-cols-1 ${dinnerState?.serviceAvailable ? 'sm:grid-cols-2' : ''} gap-4`}>
            {/* Lunch Card */}
            {lunchState && (
              <MealAttendanceCard
                mealType="LUNCH"
                status={lunchState.status}
                location={lunchState.location || (pollState?.existingVote)}
                cutoffTime={dayOfWeek === 'SUNDAY' ? '11:00 AM' : '10:30 AM'}
                isLocked={lunchState.locked}
                onConfirmAttendance={handleConfirmAttendance}
              />
            )}

            {/* Dinner Card (Shown when dinner service is available) */}
            {dinnerState?.serviceAvailable ? (
              <MealAttendanceCard
                mealType="DINNER"
                status={dinnerState.status}
                cutoffTime="05:30 PM"
                isLocked={dinnerState.locked}
                onConfirmAttendance={handleConfirmAttendance}
              />
            ) : null}
          </div>

          {/* Sunday Note */}
          {dayOfWeek === 'SUNDAY' && (
            <div className="p-3.5 bg-brand-yellow/20 rounded-brand-sm border border-brand-orange/40 text-center font-nunito text-xs font-bold text-brand-green">
              <span>🌙 Sunday Dinner: Kitchen is closed on Sunday evenings (No service).</span>
            </div>
          )}

          {/* Saturday Lunch Note */}
          {dayOfWeek === 'SATURDAY' && (
            <div className="p-3 bg-brand-creamLight rounded-brand-sm border border-brand-orange/40 text-center font-nunito text-xs font-bold text-brand-green">
              <span>🍴 Saturday Schedule: All meals served dine-in at the Restaurant. No college delivery or poll.</span>
            </div>
          )}

          {/* 4. Lunch Poll Card
              - Only rendered when pollState?.pollExists === true.
              - Remains visible if Lunch is PRESENT or UNMARKED.
              - Disappears completely if Lunch is ABSENT.
          */}
          {pollState?.pollExists && lunchState?.status !== 'ABSENT' && (
            <LunchPollCard
              isAttendanceAbsent={lunchState?.status === 'ABSENT'}
              currentLocation={pollState.existingVote || lunchState?.location}
              isVoteLocked={pollState.locked || Boolean(pollState.existingVote)}
              onConfirmVote={handleConfirmPollVote}
            />
          )}

          {/* 5. Today's Tokens */}
          <MealTokenCard
            token={activeToken}
            isAttendanceAbsent={lunchState?.status === 'ABSENT'}
            isAttendanceUnmarked={lunchState?.status === 'UNMARKED'}
            isSuspended={isSuspended}
          />
        </>
      )}

      {/* 6. Attendance Calendar Preview */}
      <AttendanceCalendarPreview
        monthName="Current Month"
        days={[
          {
            day: todayDayNumber,
            lunch: lunchState?.status || 'UNMARKED',
            dinner: dinnerState?.status || 'UNMARKED',
            isToday: true,
            state: todayCalendarState,
          },
        ]}
      />

      {/* 7. Message Restaurant Card */}
      <Card
        title="Message Swayamsiddha Kitchen"
        subtitle="Need extra rotis, diet customization, or reporting late arrival?"
        icon={<MessageSquare className="w-5 h-5 text-brand-orange" />}
      >
        <form onSubmit={handleSendMessage} className="space-y-3 font-nunito">
          {messageSuccess && (
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-brand-sm text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Message sent successfully to kitchen staff!</span>
            </div>
          )}
          <textarea
            rows={3}
            value={kitchenNote}
            onChange={(e) => setKitchenNote(e.target.value)}
            placeholder="Type your note to the kitchen staff..."
            className="w-full bg-brand-cream border-2.5 border-brand-orange rounded-brand-sm p-3 text-sm font-bold text-brand-darkGreen placeholder:text-brand-darkGreen/40 outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={sendMessageMutation.isPending || !kitchenNote.trim()}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
