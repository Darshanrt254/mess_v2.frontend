import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Ticket, Scan, CheckCircle } from 'lucide-react';
import { useOwnerAnalyticsTokens, useOwnerAttendance } from '@/hooks/useOwner';

export function TokensPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const { data: tokenAnalytics, isLoading: isAnalyticsLoading } = useOwnerAnalyticsTokens();
  const { data: todayLunchAttendance = [] } = useOwnerAttendance({ mealType: 'LUNCH' });
  const { data: todayDinnerAttendance = [] } = useOwnerAttendance({ mealType: 'DINNER' });

  const allTokens = [
    ...todayLunchAttendance.filter((r) => Boolean(r.mealToken)).map((r) => ({
      tokenString: r.mealToken?.token || r.mealToken?.tokenString,
      counterNumber: r.mealToken?.serialNumber ?? r.mealToken?.counterNumber,
      customerName: r.customer?.name,
      mealType: 'LUNCH',
      location: r.location,
    })),
    ...todayDinnerAttendance.filter((r) => Boolean(r.mealToken)).map((r) => ({
      tokenString: r.mealToken?.token || r.mealToken?.tokenString,
      counterNumber: r.mealToken?.serialNumber ?? r.mealToken?.counterNumber,
      customerName: r.customer?.name,
      mealType: 'DINNER',
      location: r.location,
    })),
  ];

  const handleValidate = (e) => {
    e?.preventDefault();
    const query = tokenInput.trim();
    if (!query) return;

    const found = allTokens.find(
      (t) => (t.tokenString && t.tokenString.toLowerCase() === query.toLowerCase()) ||
             (t.counterNumber !== undefined && String(t.counterNumber) === query)
    );

    if (found) {
      setLookupResult({
        ...found,
        status: 'Valid & Active',
        valid: true,
      });
    } else {
      setLookupResult({
        tokenString: query,
        status: 'Token Not Found or Invalid',
        valid: false,
      });
    }
  };

  if (isAnalyticsLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading token data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Token Verification & Issuance"
        subtitle="Validate digital meal tokens at delivery counters and dining hall entrances."
        badge={<Badge variant="brand" size="sm">Token Scanner</Badge>}
      />

      {/* Token Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tokens (Range)" value={tokenAnalytics?.totalTokens || 0} variant="green" />
        <StatCard label="Lunch Tokens" value={tokenAnalytics?.lunch || 0} variant="default" />
        <StatCard label="Dinner Tokens" value={tokenAnalytics?.dinner || 0} variant="default" />
        <StatCard label="Today Active Tokens" value={allTokens.length} variant="yellow" />
      </div>

      {/* Validation Input Card */}
      <Card
        variant="green"
        title="Quick Token Validator"
        subtitle="Enter customer token ID or counter number to verify"
        icon={<Scan className="w-5 h-5 text-brand-yellow" />}
      >
        <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-3 mt-2 font-nunito">
          <Input
            placeholder="e.g. token string or counter number"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setLookupResult(null);
            }}
            className="bg-brand-cream border-2 text-brand-darkGreen placeholder:text-brand-darkGreen/50"
          />
          <Button
            type="submit"
            variant="yellow"
            size="md"
            leftIcon={<CheckCircle className="w-4 h-4" />}
            className="whitespace-nowrap"
          >
            Validate Token
          </Button>
        </form>

        {lookupResult && (
          <div className={`mt-4 p-4 rounded-brand-sm border flex items-center justify-between font-nunito ${
            lookupResult.valid
              ? 'bg-white/10 border-brand-yellow/40'
              : 'bg-red-900/30 border-red-400/50'
          }`}>
            <div>
              <span className={`text-base font-black block ${lookupResult.valid ? 'text-brand-yellow' : 'text-red-300'}`}>
                Token: {lookupResult.tokenString} {lookupResult.valid ? `— ${lookupResult.customerName}` : ''}
              </span>
              {lookupResult.valid && (
                <span className="text-xs font-bold text-brand-creamLight/90">
                  {lookupResult.mealType} •{' '}
                  {lookupResult.location === 'COLLEGE' ? 'College Delivery' : 'Restaurant Dine-in'}
                </span>
              )}
            </div>
            <Badge variant={lookupResult.valid ? 'success' : 'danger'} size="md">
              {lookupResult.status}
            </Badge>
          </div>
        )}
      </Card>

      {/* Today's Active Tokens */}
      <Card
        title="Today's Generated Tokens"
        subtitle="All meal tokens issued by the system today"
        icon={<Ticket className="w-5 h-5 text-brand-orange" />}
      >
        {allTokens.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito">
            No meal tokens have been generated today yet.
          </div>
        ) : (
          <div className="divide-y divide-brand-orange/20 text-xs font-bold font-nunito">
            {allTokens.map((t, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-brand-darkGreen block font-mono">
                    {t.tokenString || (t.counterNumber !== undefined ? `Counter #${t.counterNumber}` : 'Active Token')}
                  </span>
                  <span className="text-brand-green">
                    {t.customerName} • {t.mealType} •{' '}
                    {t.location === 'COLLEGE' ? 'College Delivery' : 'Restaurant'}
                  </span>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
