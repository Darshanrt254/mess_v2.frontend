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
  const activeToken = lunchToken || dinnerToken;

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

      {/* Active Token Card */}
      {activeToken ? (
        <Card
          variant="green"
          title="Active Meal Token"
          subtitle={`Valid for today's ${activeToken.mealType || 'Meal'} service`}
          icon={<Ticket className="w-5 h-5 text-brand-yellow" />}
          action={<Badge variant="brand" size="sm">ACTIVE</Badge>}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4 font-nunito">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white rounded-brand-sm p-2 flex items-center justify-center border-2 border-brand-orange shadow-inner">
                <QrCode className="w-20 h-20 text-brand-darkGreen" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-brand-yellow tracking-tight block font-mono">
                  {activeToken.token || activeToken.tokenString || activeToken.tokenId || activeToken.id}
                </span>
                <p className="text-xs font-bold text-brand-creamLight/90 mt-1">
                  {profile?.name || 'Customer'} • Counter #{activeToken.counterNumber || activeToken.serialNumber || '1'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 mr-1 inline" /> Verified
                  </Badge>
                  <span className="text-[11px] font-bold text-brand-yellow">
                    Location: {activeToken.location === 'COLLEGE' ? 'Campus Delivery' : 'Restaurant Dine-in'}
                  </span>
                </div>
              </div>
            </div>
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
