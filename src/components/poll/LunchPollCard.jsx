import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Vote, CheckCircle2, Lock } from 'lucide-react';
import { POLL_OPTIONS } from '@/styles/tokens';
import { cn } from '@/utils/cn';

/**
 * LunchPollCard
 * 
 * Rules:
 * 1. If Lunch is ABSENT, this card disappears completely.
 * 2. If Lunch is PRESENT, the customer can vote on the poll.
 * 3. Selecting College or Restaurant does NOT immediately submit; it opens a ConfirmDialog.
 * 4. Cancel closes modal without saving.
 * 5. Confirm Vote submits and permanently locks the vote.
 * 6. No "Change Vote" / "Edit Vote" buttons are provided.
 */
export function LunchPollCard({
  currentLocation = null, // null | 'COLLEGE' | 'RESTAURANT'
  isVoteLocked = false,
  onConfirmVote,
  isAttendanceAbsent = false,
  className = '',
}) {
  // If customer confirmed Lunch as Absent, the poll disappears completely
  if (isAttendanceAbsent) {
    return null;
  }

  const [pendingChoice, setPendingChoice] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSelectOption = (choice) => {
    if (isVoteLocked) return;
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

  const isConfirmedCollege = isVoteLocked && currentLocation === POLL_OPTIONS.COLLEGE;
  const isConfirmedRestaurant = isVoteLocked && currentLocation === POLL_OPTIONS.RESTAURANT;

  return (
    <>
      <Card
        title="Today's Lunch Delivery Poll"
        subtitle="Where will you be having your lunch today?"
        icon={<Vote className="w-5 h-5 text-brand-orange" />}
        action={
          isVoteLocked ? (
            <Badge variant="success" size="sm" icon={<Lock className="w-3 h-3" />}>
              Vote Locked
            </Badge>
          ) : currentLocation ? (
            <Badge variant="brand" size="sm">
              Selection Pending Confirm
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Vote Pending
            </Badge>
          )
        }
        className={className}
      >
        {isVoteLocked ? (
          /* Permanent Confirmed Locked State (NO Edit/Change buttons) */
          <div className="p-4 rounded-brand bg-brand-yellow/25 border-2.5 border-brand-orange text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Confirmed</span>
            </div>
            <div className="text-xl font-black text-brand-darkGreen">
              {currentLocation === POLL_OPTIONS.COLLEGE
                ? '🎓 At College'
                : '🍴 At Restaurant'}
            </div>
            <p className="text-xs font-bold text-brand-green">
              Your lunch dispatch location is permanently locked for today.
            </p>
          </div>
        ) : (
          /* Interactive Voting Options (opens confirmation popup) */
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <Button
                variant={currentLocation === POLL_OPTIONS.COLLEGE ? 'yellow' : 'outline'}
                size="md"
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 text-base font-black',
                  currentLocation === POLL_OPTIONS.COLLEGE && 'border-3 border-brand-orange'
                )}
                onClick={() => handleSelectOption(POLL_OPTIONS.COLLEGE)}
              >
                <span>🎓</span>
                <span>At College</span>
              </Button>

              <Button
                variant={currentLocation === POLL_OPTIONS.RESTAURANT ? 'yellow' : 'outline'}
                size="md"
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 text-base font-black',
                  currentLocation === POLL_OPTIONS.RESTAURANT && 'border-3 border-brand-orange'
                )}
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
