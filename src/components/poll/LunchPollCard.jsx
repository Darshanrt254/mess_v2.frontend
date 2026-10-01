import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Vote, CheckCircle2, Lock, Clock, AlertCircle } from 'lucide-react';
import { POLL_OPTIONS } from '@/styles/tokens';
import { cn } from '@/utils/cn';

/**
 * LunchPollCard
 * 
 * Rules:
 * 1. If Lunch is ABSENT, this card disappears completely (isAttendanceAbsent === true).
 * 2. If customer has ALREADY VOTED (existingVote is present, or confirmed vote):
 *    - Displays confirmed location with locked badge. No edit buttons.
 * 3. If Poll is CLOSED and customer did NOT vote (existingVote === null):
 *    - Displays clear "Poll Closed" informational state. Does NOT show "Already voted/marked".
 * 4. If Poll is OPEN and eligible:
 *    - Selecting College or Restaurant opens a ConfirmDialog.
 *    - Cancel closes modal without saving.
 *    - Confirm Vote submits and permanently locks the vote.
 * 5. If NOT eligible or suspended:
 *    - Displays honest disabled/unavailable state.
 */
export function LunchPollCard({
  pollStatus = 'CLOSED', // 'OPEN' | 'CLOSED'
  existingVote = null, // null | 'COLLEGE' | 'RESTAURANT'
  eligible = false,
  reason = null,
  isVoteLocked = false,
  currentLocation = null,
  onConfirmVote,
  isAttendanceAbsent = false,
  className = '',
}) {
  // 1. If customer confirmed Lunch as Absent, the poll disappears completely
  if (isAttendanceAbsent) {
    return null;
  }

  const [pendingChoice, setPendingChoice] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Authoritative voted check: either existingVote string or already confirmed location
  const hasVoted = Boolean(existingVote || (isVoteLocked && currentLocation));
  const votedLocation = existingVote || currentLocation;

  // Poll status checks
  const isClosed = pollStatus === 'CLOSED' || reason === 'CLOSED';
  const isOpen = pollStatus === 'OPEN' && eligible;

  const handleSelectOption = (choice) => {
    if (hasVoted || isClosed) return;
    setPendingChoice(choice);
    setIsConfirmModalOpen(true);
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
    setPendingChoice(null);
  };

  const handleConfirmVote = () => {
    if (pendingChoice && onConfirmVote) {
      onConfirmVote(pendingChoice);
    }
    setIsConfirmModalOpen(false);
  };

  // Render header action badge
  const renderActionBadge = () => {
    if (hasVoted) {
      return (
        <Badge variant="success" size="sm" icon={<Lock className="w-3 h-3" />}>
          Vote Locked
        </Badge>
      );
    }
    if (isClosed) {
      return (
        <Badge variant="neutral" size="sm" icon={<Clock className="w-3 h-3" />}>
          Poll Closed
        </Badge>
      );
    }
    if (isOpen) {
      return (
        <Badge variant="warning" size="sm">
          Vote Open
        </Badge>
      );
    }
    if (reason === 'NOT_OPEN_YET') {
      return (
        <Badge variant="neutral" size="sm" icon={<Clock className="w-3 h-3" />}>
          Opens at 6:00 AM
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        Unavailable
      </Badge>
    );
  };

  return (
    <>
      <Card
        title="Today's Lunch Delivery Poll"
        subtitle={
          hasVoted
            ? 'Your lunch delivery choice is confirmed for today'
            : isClosed
            ? 'Lunch poll closed at 11:30 AM IST'
            : isOpen
            ? 'Where will you be having your lunch today?'
            : 'Poll operates Monday to Friday, 06:00 to 11:30 AM IST'
        }
        icon={<Vote className="w-5 h-5 text-brand-orange" />}
        action={renderActionBadge()}
        className={className}
      >
        {/* State A: ALREADY VOTED */}
        {hasVoted ? (
          <div className="p-4 rounded-brand bg-brand-yellow/25 border-2.5 border-brand-orange text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Confirmed Vote</span>
            </div>
            <div className="text-xl font-black text-brand-darkGreen">
              {votedLocation === POLL_OPTIONS.COLLEGE
                ? '🎓 At College'
                : '🍴 At Restaurant'}
            </div>
            <p className="text-xs font-bold text-brand-green">
              Your lunch dispatch location is permanently locked for today.
            </p>
          </div>
        ) : isClosed ? (
          /* State B: POLL CLOSED (Customer did NOT vote) */
          <div className="p-4 rounded-brand bg-brand-yellow/15 border-2 border-dashed border-brand-orange/40 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Poll Closed</span>
            </div>
            <div className="text-base font-black text-brand-darkGreen">
              Voting Closed at 11:30 AM IST
            </div>
            <p className="text-xs font-bold text-brand-green max-w-md mx-auto">
              You did not vote in today&apos;s lunch poll before the cutoff time. If you are marked Present, your meal will be served dine-in at the Restaurant.
            </p>
          </div>
        ) : isOpen ? (
          /* State C: POLL OPEN (Interactive voting) */
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2 py-3 text-base font-black border-2 border-brand-orange/60 hover:bg-brand-yellow/30"
                onClick={() => handleSelectOption(POLL_OPTIONS.COLLEGE)}
              >
                <span>🎓</span>
                <span>At College</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2 py-3 text-base font-black border-2 border-brand-orange/60 hover:bg-brand-yellow/30"
                onClick={() => handleSelectOption(POLL_OPTIONS.RESTAURANT)}
              >
                <span>🍴</span>
                <span>At Restaurant</span>
              </Button>
            </div>

            <p className="text-[11px] font-bold text-brand-green/80 text-center">
              * Selecting a location will ask for confirmation. Once confirmed, your vote cannot be changed.
            </p>
          </div>
        ) : (
          /* State D: NOT ELIGIBLE or NOT OPEN YET */
          <div className="p-4 rounded-brand bg-gray-100 border-2 border-dashed border-gray-300 text-center space-y-1 font-nunito">
            <AlertCircle className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <span className="text-sm font-black text-gray-700 block">
              {reason === 'NOT_OPEN_YET'
                ? 'Poll Opens at 06:00 AM IST'
                : 'Poll Currently Unavailable'}
            </span>
            <p className="text-xs font-bold text-gray-500">
              {reason === 'NOT_OPEN_YET'
                ? 'Daily lunch delivery voting begins at 06:00 AM IST.'
                : reason === 'PAYMENT_SUSPENDED'
                ? 'Account payment suspended. Please recharge tiffins to participate.'
                : 'Voting is not active for this date.'}
            </p>
          </div>
        )}
      </Card>

      {/* Lunch Poll Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={handleCancel}
        onConfirm={handleConfirmVote}
        title="Confirm Lunch Poll"
        description="You selected:"
        confirmText="Confirm Vote"
        cancelText="Cancel"
        confirmVariant="green"
        selectedValue={
          <div className="text-xl font-black text-brand-darkGreen py-1">
            {pendingChoice === POLL_OPTIONS.COLLEGE ? '🎓 At College' : '🍴 At Restaurant'}
          </div>
        }
        note="Once you confirm, your vote cannot be changed."
      />
    </>
  );
}
