import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Sun, Moon, Check, X, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

export function MealAttendanceCard({
  mealType = 'LUNCH', // 'LUNCH' | 'DINNER'
  status = 'UNMARKED', // 'UNMARKED' | 'PRESENT' | 'ABSENT' | 'PENDING'
  location = null, // 'PENDING' | 'COLLEGE' | 'RESTAURANT' | null
  cutoffTime = '02:00 PM IST',
  isLocked = false,
  isPollLive = false,
  hasVotedPoll = false,
  serviceAvailable = true,
  unavailableReason = null,
  isPastCutoff = false,
  isSubmitting = false,
  onRequestPollVote = null,
  onConfirmAttendance,
  className = '',
}) {
  const isLunch = mealType === 'LUNCH';
  const Icon = isLunch ? Sun : Moon;
  const mealName = isLunch ? 'Lunch' : 'Dinner';
  const mealEmoji = isLunch ? '🍛' : '🌙';

  const [pendingChoice, setPendingChoice] = useState(null); // 'PRESENT' | 'ABSENT' | null
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isActionDisabled = isLocked || !serviceAvailable || isPastCutoff || isSubmitting;

  const handleOpenConfirm = (choice) => {
    if (isActionDisabled) return;
    if (isLunch && choice === 'PRESENT' && isPollLive && !hasVotedPoll && onRequestPollVote) {
      onRequestPollVote();
      return;
    }
    setPendingChoice(choice);
    setIsConfirmModalOpen(true);
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
    setPendingChoice(null);
  };

  const handleConfirm = () => {
    if (pendingChoice && onConfirmAttendance) {
      onConfirmAttendance(mealType, pendingChoice);
    }
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <Card
        className={cn('relative overflow-hidden font-nunito', className)}
        title={`Today's ${mealName}`}
        subtitle={!serviceAvailable ? 'Not available today' : `Cutoff: ${cutoffTime}`}
        icon={<Icon className="w-5 h-5 text-brand-orange" />}
        action={
          !serviceAvailable ? (
            <Badge variant="neutral" size="sm">
              {unavailableReason === 'PLAN_EXCLUDED'
                ? 'Plan Excluded'
                : unavailableReason === 'SUNDAY_DINNER_EXCLUDED'
                ? 'Closed'
                : 'Unavailable'}
            </Badge>
          ) : isLocked ? (
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant={status === 'PRESENT' ? 'success' : 'danger'}
                size="sm"
                icon={<Lock className="w-3 h-3" />}
              >
                Confirmed {status === 'PRESENT' ? 'Present' : 'Absent'}
              </Badge>
              {isLunch && status === 'PRESENT' && location && (
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-green">
                  {location === 'COLLEGE'
                    ? '🎓 At College'
                    : location === 'RESTAURANT'
                    ? '🍴 At Restaurant'
                    : 'Location Pending Poll'}
                </span>
              )}
            </div>
          ) : status === 'PRESENT' ? (
            <div className="flex flex-col items-end gap-1">
              <Badge variant="success" size="sm">Present</Badge>
              {isLunch && location && (
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-green">
                  {location === 'COLLEGE'
                    ? '🎓 At College'
                    : location === 'RESTAURANT'
                    ? '🍴 At Restaurant'
                    : 'Location Pending Poll'}
                </span>
              )}
            </div>
          ) : status === 'ABSENT' ? (
            <Badge variant="danger" size="sm">Absent</Badge>
          ) : isPastCutoff ? (
            <Badge variant="warning" size="sm">Cutoff Passed</Badge>
          ) : (
            <Badge variant="warning" size="sm">Unmarked</Badge>
          )
        }
      >
        {!serviceAvailable ? (
          <div className="py-4 px-3 rounded-brand-sm bg-brand-yellow/15 border-2 border-dashed border-brand-orange/40 text-center font-nunito mt-2">
            <span className="text-sm font-black text-brand-darkGreen block">
              {unavailableReason === 'PLAN_EXCLUDED'
                ? `${mealName} Excluded From Plan`
                : unavailableReason === 'SUNDAY_DINNER_EXCLUDED'
                ? 'Sunday Dinner Closed'
                : `${mealName} Unavailable`}
            </span>
            <span className="text-xs font-bold text-brand-green block mt-1">
              {unavailableReason === 'PLAN_EXCLUDED'
                ? `Your current subscription plan excludes ${mealName.toLowerCase()} service.`
                : unavailableReason === 'SUNDAY_DINNER_EXCLUDED'
                ? 'Kitchen is closed on Sunday evenings. No dinner service.'
                : 'Service is not scheduled for this meal.'}
            </span>
          </div>
        ) : isPastCutoff && status === 'UNMARKED' ? (
          <div className="py-3 px-3 rounded-brand-sm bg-gray-100 border-2 border-dashed border-gray-300 text-center font-nunito mt-2">
            <span className="text-xs font-black text-gray-700 block">
              Attendance Cutoff Passed ({cutoffTime})
            </span>
            <span className="text-[11px] font-bold text-gray-500 block mt-0.5">
              Attendance marking has closed for today's {mealName.toLowerCase()}.
            </span>
          </div>
        ) : (
          <>
            {/* Attendance Action Buttons */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                disabled={isActionDisabled}
                onClick={() => handleOpenConfirm('PRESENT')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-brand-sm border-2.5 font-black text-sm transition-all',
                  status === 'PRESENT'
                    ? 'bg-brand-darkGreen text-brand-yellow border-brand-green shadow-brand-green'
                    : 'bg-white hover:bg-emerald-50 text-brand-darkGreen border-emerald-600/40',
                  isActionDisabled && status !== 'PRESENT' && 'opacity-40 cursor-not-allowed hover:bg-white',
                  isLocked && status === 'PRESENT' && 'cursor-default'
                )}
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Present</span>
              </button>

              <button
                type="button"
                disabled={isActionDisabled}
                onClick={() => handleOpenConfirm('ABSENT')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-brand-sm border-2.5 font-black text-sm transition-all',
                  status === 'ABSENT'
                    ? 'bg-red-600 text-white border-red-700 shadow-md'
                    : 'bg-white hover:bg-rose-50 text-brand-darkGreen border-red-300',
                  isActionDisabled && status !== 'ABSENT' && 'opacity-40 cursor-not-allowed hover:bg-white',
                  isLocked && status === 'ABSENT' && 'cursor-default'
                )}
              >
                <X className="w-4 h-4 shrink-0" />
                <span>Absent</span>
              </button>
            </div>

            {/* If lunch attendance is present but pending poll vote */}
            {isLunch && status === 'PRESENT' && !location && isPollLive && !hasVotedPoll && onRequestPollVote && (
              <button
                type="button"
                onClick={onRequestPollVote}
                className="mt-3 w-full py-2.5 px-3 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-brand-sm font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-brand-sm"
              >
                <span>🗳️ Vote at Poll to Generate Token</span>
              </button>
            )}

            {/* Lock / Irreversibility Indicator */}
            {isLocked ? (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-brand-green bg-brand-yellow/20 py-1.5 px-2.5 rounded-brand-sm border border-brand-orange/30">
                <Lock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>Attendance choice confirmed and locked for today.</span>
              </div>
            ) : (
              <p className="text-[11px] font-bold text-brand-green/80 mt-2.5 text-center">
                * Once confirmed, your attendance choice cannot be changed.
              </p>
            )}
          </>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirm Attendance"
        description="You are about to mark:"
        confirmText="Confirm"
        cancelText="Cancel"
        confirmVariant={pendingChoice === 'PRESENT' ? 'green' : 'danger'}
        selectedValue={
          <div className="space-y-1">
            <div className="text-base font-black text-brand-darkGreen flex items-center justify-center gap-2">
              <span>{mealEmoji}</span>
              <span>{mealName}</span>
            </div>
            <div
              className={cn(
                'text-lg font-black tracking-wide',
                pendingChoice === 'PRESENT' ? 'text-emerald-700' : 'text-red-600'
              )}
            >
              {pendingChoice === 'PRESENT' ? '✓ Present' : '✕ Absent'}
            </div>
          </div>
        }
        note="Are you sure? You will not be able to change this attendance choice after confirmation."
      />
    </>
  );
}
