import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Ticket, QrCode, CheckCircle, Clock } from 'lucide-react';
import { useCustomerMealsToday, useCustomerProfile } from '@/hooks/useCustomer';

export function TokensPage() {
  const { data: profile, isLoading: isProfileLoading } = useCustomerProfile();
  const { data: mealsData, isLoading: isMealsLoading, error } = useCustomerMealsToday();

  if (isProfileLoading || isMealsLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading your meal tokens..." />
      </div>
    );
  }

  const lunchToken = mealsData?.lunch?.mealToken;
  const dinnerToken = mealsData?.dinner?.mealToken;

  const activeTokens = [];
  if (lunchToken) {
    activeTokens.push({
      ...lunchToken,
      mealType: lunchToken.mealType || 'LUNCH',
      location: mealsData?.lunch?.location || lunchToken.location || 'RESTAURANT',
    });
  }
  if (dinnerToken) {
    activeTokens.push({
      ...dinnerToken,
      mealType: dinnerToken.mealType || 'DINNER',
      location: mealsData?.dinner?.location || dinnerToken.location || 'RESTAURANT',
    });
  }

  const isLunchPendingToken = mealsData?.lunch?.status === 'PRESENT' && !lunchToken;
  const isDinnerPendingToken = mealsData?.dinner?.status === 'PRESENT' && !dinnerToken;
  const hasPendingToken = isLunchPendingToken || isDinnerPendingToken;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Meal Tokens"
        subtitle="Active meal delivery tokens and past redemption records."
        badge={<Badge variant="brand" size="sm">Digital Pass</Badge>}
      />

      {error && (
        <Alert variant="danger" title="Error">
          {error.message}
        </Alert>
      )}

      {hasPendingToken && activeTokens.length === 0 && (
        <Alert variant="warning" title="Token Generation Pending">
          Your attendance is recorded as Present. The digital token will appear here as soon as backend processing or poll voting completes.
        </Alert>
      )}

      {/* Active Token Cards */}
      {activeTokens.length > 0 ? (
        <div className="space-y-4">
          {activeTokens.map((token, idx) => (
            <Card
              key={token.id || token.token || idx}
              variant="green"
              title={`Active ${token.mealType === 'LUNCH' ? 'Lunch' : 'Dinner'} Token`}
              subtitle={`Valid for today's ${token.mealType} service`}
              icon={<Ticket className="w-5 h-5 text-brand-yellow" />}
              action={<Badge variant="brand" size="sm">ACTIVE</Badge>}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4 font-nunito">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-brand-sm p-2 flex items-center justify-center border-2 border-brand-orange shadow-inner shrink-0">
                    <QrCode className="w-20 h-20 text-brand-darkGreen" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-brand-yellow tracking-tight block font-mono">
                      {token.token || token.tokenString || token.tokenId || token.id}
                    </span>
                    <p className="text-xs font-bold text-brand-creamLight/90 mt-1">
                      {profile?.name || 'Customer'} • Counter #{token.counterNumber || token.serialNumber || '1'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1 inline" /> Verified
                      </Badge>
                      <span className="text-[11px] font-bold text-brand-yellow">
                        Location: {token.location === 'COLLEGE' ? 'Campus Delivery' : 'Restaurant Dine-in'}
                      </span>
                      <span className="text-[11px] font-bold text-brand-creamLight/80">
                        • Meal: {token.mealType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : hasPendingToken ? (
        <Card
          title="Token Awaiting Confirmation"
          subtitle="Attendance confirmed Present"
          icon={<Clock className="w-5 h-5 text-brand-orange" />}
        >
          <div className="p-6 text-center font-nunito space-y-2">
            <p className="text-sm font-black text-brand-darkGreen">
              Your attendance choice is confirmed.
            </p>
            <p className="text-xs font-bold text-brand-green">
              Digital tokens are generated upon location poll submission or finalization by mess management.
            </p>
          </div>
        </Card>
      ) : (
        <Card
          title="No Active Meal Token"
          subtitle="Tokens are automatically generated when lunch or dinner attendance is marked"
          icon={<Ticket className="w-5 h-5 text-brand-orange" />}
        >
          <div className="p-6 text-center font-nunito space-y-2">
            <p className="text-sm font-bold text-brand-darkGreen">
              You do not have any active meal tokens for today yet.
            </p>
            <p className="text-xs text-brand-green">
              If you marked Present, your token will appear here once finalized by the mess management.
            </p>
          </div>
        </Card>
      )}

      {/* Information note */}
      <Card
        title="Token Information"
        subtitle="How Swayamsiddha meal verification works"
        icon={<Clock className="w-5 h-5 text-brand-orange" />}
      >
        <div className="space-y-2 text-xs font-bold text-brand-green leading-relaxed font-nunito">
          <p>• Your unique digital token is generated securely on the server upon confirmed attendance.</p>
          <p>• Present the token code or QR pass to the mess runner or restaurant counter to claim your meal.</p>
          <p>• Exactly one tiffin is deducted from your balance per valid meal token.</p>
        </div>
      </Card>
    </div>
  );
}
