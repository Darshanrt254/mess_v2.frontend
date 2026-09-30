import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { Vote, School, Store, Clock, RefreshCw } from 'lucide-react';
import { useOwnerAnalyticsPolls, useOwnerAttendance } from '@/hooks/useOwner';
import { useQueryClient } from '@tanstack/react-query';

export function PollsPage() {
  const queryClient = useQueryClient();
  const { data: pollData, isLoading: isPollLoading, error: pollError } = useOwnerAnalyticsPolls();
  const { data: attendanceList = [], isLoading: isAttendanceLoading } = useOwnerAttendance({ mealType: 'LUNCH' });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', 'polls'] });
    queryClient.invalidateQueries({ queryKey: ['ownerAttendance'] });
  };

  if (isPollLoading || isAttendanceLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading lunch poll results..." />
      </div>
    );
  }

  const collegeCount = pollData?.college ?? 0;
  const restaurantCount = pollData?.restaurant ?? 0;
  const totalVotes = pollData?.totalVotes ?? (collegeCount + restaurantCount);

  // Present lunch customers who have not voted yet
  const presentCustomers = attendanceList.filter((r) => r.status === 'PRESENT');
  const pendingVotes = Math.max(0, presentCustomers.length - totalVotes);

  const percentageCollege = totalVotes > 0 ? (collegeCount / totalVotes) * 100 : 0;
  const percentageRestaurant = totalVotes > 0 ? (restaurantCount / totalVotes) * 100 : 0;

  // Real voter log from present attendances with a location
  const votedCustomers = presentCustomers.filter((r) => r.location !== null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lunch Poll Monitoring"
        subtitle="Live delivery location votes from customers for today's lunch dispatch."
        badge={<Badge variant="brand" size="sm">Active Poll</Badge>}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Votes
          </Button>
        }
      />

      {pollError && (
        <Alert variant="danger" title="Poll Error">
          {pollError.message}
        </Alert>
      )}

      {/* Top Aggregation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="College Delivery"
          value={collegeCount}
          icon={<School className="w-5 h-5 text-brand-darkGreen" />}
          change={`${percentageCollege.toFixed(0)}% of votes`}
          changeType="positive"
          variant="green"
        />
        <StatCard
          label="Mess / Dining Hall"
          value={restaurantCount}
          icon={<Store className="w-5 h-5 text-brand-darkGreen" />}
          change={`${percentageRestaurant.toFixed(0)}% of votes`}
          changeType="neutral"
          variant="yellow"
        />
        <StatCard
          label="Pending Votes"
          value={pendingVotes}
          icon={<Clock className="w-5 h-5 text-brand-orange" />}
          change="Marked Present without vote"
          changeType="negative"
          variant="default"
        />
      </div>

      {/* Visual Vote Progress Bar */}
      <Card
        title="Vote Distribution"
        subtitle="Ratio of Campus Delivery to Dining Hall"
        icon={<Vote className="w-5 h-5 text-brand-orange" />}
      >
        <div className="space-y-2 mt-2 font-nunito">
          <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex border-2 border-brand-orange">
            <div
              className="bg-brand-darkGreen text-brand-yellow font-black text-xs flex items-center justify-center transition-all duration-300"
              style={{ width: `${totalVotes > 0 ? percentageCollege : 50}%` }}
            >
              College ({percentageCollege.toFixed(0)}%)
            </div>
            <div
              className="bg-brand-yellow text-brand-darkGreen font-black text-xs flex items-center justify-center transition-all duration-300"
              style={{ width: `${totalVotes > 0 ? percentageRestaurant : 50}%` }}
            >
              Mess ({percentageRestaurant.toFixed(0)}%)
            </div>
          </div>
          <div className="flex justify-between text-xs font-bold text-brand-green px-1">
            <span>{collegeCount} Tiffins for Campus</span>
            <span>{restaurantCount} Meals for Dining Room</span>
          </div>
        </div>
      </Card>

      {/* Customer Voting Log */}
      <Card
        title="Customer Voter Log"
        subtitle="Live voter breakdown from attendance records"
        icon={<Clock className="w-5 h-5 text-brand-orange" />}
      >
        {votedCustomers.length === 0 ? (
          <div className="py-6 text-center text-xs font-bold text-brand-green font-nunito">
            No customer votes recorded yet for today&apos;s lunch.
          </div>
        ) : (
          <div className="divide-y divide-brand-orange/20 text-xs font-bold font-nunito">
            {votedCustomers.map((v) => (
              <div key={v.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-brand-darkGreen font-black block">{v.customer?.name || 'Customer'}</span>
                  <span className="text-[10px] text-brand-green">{v.customer?.phone}</span>
                </div>
                <Badge
                  variant={v.location === 'COLLEGE' ? 'brand' : 'success'}
                  size="sm"
                >
                  {v.location === 'COLLEGE' ? 'College Delivery' : 'Mess Dining'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
