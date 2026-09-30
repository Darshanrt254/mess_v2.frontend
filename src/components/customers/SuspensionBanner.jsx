import React from 'react';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, AlertCircle, Phone, Calendar, ShieldAlert } from 'lucide-react';
import { SUPPORT_CONTACT } from '@/config/constants';

/**
 * Reusable banner displaying Customer Suspension & Balance Alert states:
 * - ACTIVE
 * - LOW_BALANCE (<= 10 tiffins)
 * - VERY_LOW_BALANCE (<= 5 tiffins)
 * - PAYMENT_SUSPENDED
 * - SERVICE_SUSPENDED (date range)
 */
export function SuspensionBanner({
  status = 'ACTIVE',
  balance,
  startDate,
  endDate,
  contactPhone = SUPPORT_CONTACT,
  className = '',
}) {
  // 1. Payment Suspended State
  if (status === 'PAYMENT_SUSPENDED') {
    return (
      <div
        className={`p-5 rounded-brand bg-red-50 border-3 border-red-500 shadow-md font-nunito ${className}`}
        role="alert"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0">
            <span className="text-2xl">🔴</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-red-950 flex items-center gap-2">
              Payment Pending
            </h3>
            <p className="text-sm font-bold text-red-800 mt-1">
              Your tiffin balance is 0.
            </p>
            <p className="text-sm font-bold text-red-900 mt-1">
              Please contact{' '}
              <a
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                className="underline font-black text-red-950 inline-flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 inline" /> {contactPhone}
              </a>{' '}
              for payment and resuming your services.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Service Suspended State (Planned Leave / Vacation)
  if (status === 'SERVICE_SUSPENDED') {
    return (
      <div
        className={`p-5 rounded-brand bg-amber-50 border-3 border-brand-orange shadow-md font-nunito ${className}`}
        role="alert"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-full text-brand-orange shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-amber-950 flex items-center gap-2">
              Service Suspended
            </h3>
            <p className="text-sm font-extrabold text-amber-900 mt-1">
              Your service is suspended from{' '}
              <span className="font-black text-amber-950 underline">
                {startDate || '—'}
              </span>{' '}
              to{' '}
              <span className="font-black text-amber-950 underline">
                {endDate || '—'}
              </span>
              .
            </p>
            <p className="text-xs font-bold text-amber-800 mt-1">
              Daily attendance and meal deductions are currently paused. For inquiries or early resumption, contact{' '}
              <span className="font-black">{contactPhone}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Very Low Balance Warning (<= 5 tiffins)
  if (status === 'VERY_LOW_BALANCE' || (balance > 0 && balance <= 5)) {
    return (
      <div
        className={`p-4 rounded-brand-sm bg-rose-50 border-2.5 border-rose-400 font-nunito ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-rose-950">
              Very Low Balance Alert ({balance} Tiffins Remaining)
            </h4>
            <p className="text-xs font-bold text-rose-800 mt-0.5">
              You have only {balance} {balance === 1 ? 'meal' : 'meals'} remaining. Please contact {contactPhone} to recharge your account and prevent service suspension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Low Balance Warning (<= 10 tiffins)
  if (status === 'LOW_BALANCE' || (balance > 5 && balance <= 10)) {
    return (
      <div
        className={`p-4 rounded-brand-sm bg-amber-50 border-2 border-brand-orangeLight font-nunito ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-950">
              Low Balance Notice ({balance} Tiffins Remaining)
            </h4>
            <p className="text-xs font-bold text-amber-800 mt-0.5">
              Your subscription balance is running low. Please plan your renewal soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active status with healthy balance -> no alert banner needed
  return null;
}
