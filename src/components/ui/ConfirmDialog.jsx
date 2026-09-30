import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable ConfirmDialog
 * 
 * Supports:
 * - title
 * - description
 * - selectedValue (visual snippet displaying choice, e.g. 🍛 Lunch ✓ Present)
 * - note / warning banner
 * - cancel button
 * - confirm button
 * - loading state
 * - disabled state
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  description,
  selectedValue,
  note,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
  children,
}) {
  const handleCancel = onCancel || onClose;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button
            variant="outline"
            size="md"
            onClick={handleCancel}
            disabled={isLoading || disabled}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={disabled}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-4 font-nunito">
        {description && (
          <p className="text-sm font-bold text-brand-darkGreen leading-relaxed">
            {description}
          </p>
        )}

        {/* Selected Value Highlight Card */}
        {selectedValue && (
          <div className="p-4 rounded-brand-sm bg-brand-yellow/30 border-2.5 border-brand-orange text-center">
            {selectedValue}
          </div>
        )}

        {children}

        {/* Warning / Immutability Note */}
        {note ? (
          <div className="flex items-start gap-2.5 p-3 rounded-brand-sm bg-amber-50 border border-brand-orange/40 text-brand-darkGreen">
            <AlertCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <p className="text-xs font-extrabold text-amber-950 leading-snug">
              {note}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 p-3 rounded-brand-sm bg-amber-50 border border-brand-orange/40 text-brand-darkGreen">
            <AlertCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <p className="text-xs font-extrabold text-amber-950 leading-snug">
              You will not be able to change this choice after confirmation.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
