import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Utensils, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * PollVoteModal
 * 
 * Pops up when a student marks attendance for lunch while the poll is live.
 * Rules:
 * - Prompts student: "Please vote at the poll to generate the token"
 * - Lets them select COLLEGE or RESTAURANT
 * - On submit, generates the respective token immediately
 */
export function PollVoteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const [selectedLocation, setSelectedLocation] = useState('COLLEGE');
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedLocation) return;
    setError(null);
    try {
      await onConfirm(selectedLocation);
    } catch (err) {
      setError(err?.message || 'Failed to submit vote and generate token.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? undefined : onClose}
      title="Generate Lunch Token"
      subtitle="Vote at the live poll to get your token"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 font-nunito">
        <div className="p-3 bg-brand-yellow/20 rounded-brand-sm border border-brand-orange/40 flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-brand-green leading-relaxed">
            Please vote at the poll to generate your token. Your lunch location will be locked and your meal token will be issued instantly.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-brand-sm flex items-start gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-brand-darkGreen block">
            Select Your Meal Location:
          </label>

          {/* College Delivery Option */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setSelectedLocation('COLLEGE')}
            className={cn(
              'w-full text-left p-3.5 rounded-brand border-2.5 transition-all flex items-center justify-between',
              selectedLocation === 'COLLEGE'
                ? 'bg-brand-yellow/30 border-brand-green shadow-brand-green'
                : 'bg-white hover:bg-emerald-50/50 border-brand-orange/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-brand-sm flex items-center justify-center font-black',
                selectedLocation === 'COLLEGE' ? 'bg-brand-darkGreen text-brand-yellow' : 'bg-brand-creamLight text-brand-green'
              )}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-darkGreen">
                  Campus / College Delivery
                </h4>
                <p className="text-[11px] font-bold text-brand-green">
                  Delivery directly to your college campus point
                </p>
              </div>
            </div>
            {selectedLocation === 'COLLEGE' && (
              <CheckCircle2 className="w-5 h-5 text-brand-darkGreen shrink-0" />
            )}
          </button>

          {/* Restaurant Dine-In Option */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setSelectedLocation('RESTAURANT')}
            className={cn(
              'w-full text-left p-3.5 rounded-brand border-2.5 transition-all flex items-center justify-between',
              selectedLocation === 'RESTAURANT'
                ? 'bg-brand-yellow/30 border-brand-green shadow-brand-green'
                : 'bg-white hover:bg-emerald-50/50 border-brand-orange/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-brand-sm flex items-center justify-center font-black',
                selectedLocation === 'RESTAURANT' ? 'bg-brand-darkGreen text-brand-yellow' : 'bg-brand-creamLight text-brand-green'
              )}>
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-brand-darkGreen">
                  Restaurant Dine-In
                </h4>
                <p className="text-[11px] font-bold text-brand-green">
                  Fresh dine-in service at Swayamsiddha Restaurant
                </p>
              </div>
            </div>
            {selectedLocation === 'RESTAURANT' && (
              <CheckCircle2 className="w-5 h-5 text-brand-darkGreen shrink-0" />
            )}
          </button>
        </div>

        <p className="text-[11px] font-bold text-center text-brand-green/80">
          * Voting automatically confirms attendance and generates your token.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex-1 font-black shadow-brand-md"
          >
            Vote & Generate Token
          </Button>
        </div>
      </div>
    </Modal>
  );
}
