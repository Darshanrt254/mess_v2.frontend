import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Ticket, Sparkles, QrCode, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * MealTokenCard
 * 
 * Ready to receive backend-generated tokens.
 * The frontend does NOT generate token IDs.
 * Accepts backend token object (e.g. tokenId: "27-09-01-C-001").
 */
export function MealTokenCard({
  tokens,
  token,
  isAttendanceAbsent = false,
  isSuspended = false,
  isAttendanceUnmarked = false,
  className = '',
}) {
  const tokenList = tokens && tokens.length > 0 ? tokens : (token ? [token] : []);

  return (
    <Card
      title="Today's Meal Tokens"
      subtitle="Show this digital pass at the mess counter or delivery point"
      icon={<Ticket className="w-5 h-5 text-brand-orange" />}
      className={className}
    >
      {isSuspended ? (
        <div className="p-4 rounded-brand-sm bg-gray-100 border-2 border-dashed border-gray-300 text-center font-nunito">
          <AlertCircle className="w-6 h-6 text-gray-500 mx-auto mb-1" />
          <span className="text-sm font-black text-gray-700 block">
            No Active Tokens Available
          </span>
          <span className="text-xs font-bold text-gray-500 block mt-0.5">
            Meal services and token generation are paused while your account is suspended.
          </span>
        </div>
      ) : isAttendanceAbsent ? (
        <div className="p-4 rounded-brand-sm bg-gray-100 border-2 border-dashed border-gray-300 text-center font-nunito">
          <span className="text-sm font-black text-gray-700 block">
            No Meal Tokens Generated
          </span>
          <span className="text-xs font-bold text-gray-500 block mt-0.5">
            Attendance was marked as Absent for today. No meal deducted.
          </span>
        </div>
      ) : isAttendanceUnmarked && tokenList.length === 0 ? (
        <div className="p-4 rounded-brand-sm bg-brand-yellow/15 border-2 border-dashed border-brand-orange/40 text-center font-nunito">
          <span className="text-sm font-black text-brand-darkGreen block">
            Token Pending Attendance Confirmation
          </span>
          <span className="text-xs font-bold text-brand-green block mt-0.5">
            Please confirm your meal attendance above to generate your token.
          </span>
        </div>
      ) : tokenList.length > 0 ? (
        <div className="space-y-3">
          {tokenList.map((t, idx) => (
            <div
              key={t.id || t.tokenId || idx}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-brand-sm bg-brand-yellow/20 border-2 border-brand-orange/40 font-nunito"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-yellow rounded-brand-sm border-2 border-brand-orange text-brand-darkGreen font-black text-center min-w-[64px]">
                  <span className="text-xs block text-brand-green uppercase tracking-wider font-extrabold leading-tight">Token</span>
                  <span className="text-lg font-black block leading-none">
                    {t.tokenDisplayNumber || ((t.serialNumber !== undefined || t.counterNumber !== undefined) ? `#${t.serialNumber ?? t.counterNumber}` : '—')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-brand-darkGreen">
                      {t.mealType || 'Meal'} Token
                    </span>
                    <Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {t.status || 'Active'}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-brand-green mt-0.5">
                    ID: <span className="font-mono font-black text-brand-darkGreen">{t.token || t.tokenId || t.tokenString || t.tokenNumber || '—'}</span>
                  </p>
                  <p className="text-xs font-bold text-brand-darkGreen/80 mt-0.5">
                    Target: {t.targetLocation || t.location || '—'}
                  </p>
                </div>
              </div>
              <Link to="/customer/tokens">
                <Button variant="outline" size="sm" leftIcon={<QrCode className="w-4 h-4" />}>
                  View QR Code
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-brand-sm bg-brand-yellow/15 border-2 border-dashed border-brand-orange/40 text-center font-nunito">
          <span className="text-sm font-black text-brand-darkGreen block">
            Token Generation Pending
          </span>
          <span className="text-xs font-bold text-brand-green block mt-0.5">
            Your attendance is recorded. Digital tokens are issued upon daily finalization or meal collection.
          </span>
        </div>
      )}
    </Card>
  );
}
