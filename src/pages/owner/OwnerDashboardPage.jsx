import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { Link } from 'react-router-dom';
import {
  Users,
  Utensils,
  Vote,
  TrendingUp,
  School,
  Store,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useOwnerAnalyticsOverview } from '@/hooks/useOwner';

export function OwnerDashboardPage() {
  const { data: overview, isLoading, error } = useOwnerAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading owner operations dashboard..." />
      </div>
    );
  }

  const customers = overview?.customers || { total: 0, active: 0, paymentSuspended: 0, serviceSuspended: 0 };
  const meals = overview?.meals || { total: 0, lunch: 0, dinner: 0 };
  const locations = overview?.locations || { lunch: { restaurant: 0, college: 0 }, dinner: { restaurant: 0, college: 0 } };
  const attendance = overview?.attendance || { lunch: { present: 0, absent: 0, unmarked: 0 }, dinner: { present: 0, absent: 0, unmarked: 0 } };

  const collegeCount = locations.lunch?.college || 0;
  const restaurantCount = locations.lunch?.restaurant || 0;
  const totalPollLunch = collegeCount + restaurantCount;
  const lunchPresent = attendance.lunch?.present || 0;
  const pollPercentage = lunchPresent > 0 ? Math.round((totalPollLunch / lunchPresent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Owner Operations Dashboard"
        subtitle="Live meal counts, today's deliveries, and attendance overview."
        dateSubtitle={overview?.to ? `Range: ${overview.from} to ${overview.to}` : "Live Operations"}
        badge={<Badge variant="brand" size="sm">Kitchen Live</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link to="/owner/attendance">
              <Button variant="yellow" size="sm" leftIcon={<Utensils className="w-4 h-4" />}>
                Manage Attendance
              </Button>
            </Link>
            <Link to="/owner/polls">
              <Button variant="primary" size="sm" leftIcon={<Vote className="w-4 h-4" />}>
                View Polls
              </Button>
            </Link>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" title="Error Loading Overview">
          {error.message}
        </Alert>
      )}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Customers"
          value={customers.active}
          icon={<Users className="w-5 h-5 text-brand-darkGreen" />}
          change={`${customers.total} Total Registered`}
          changeType="positive"
          variant="default"
        />
        <StatCard
          label="Today's Lunch"
          value={attendance.lunch.present}
          icon={<Utensils className="w-5 h-5 text-brand-yellow" />}
          change={`${collegeCount} College • ${restaurantCount} Mess`}
          changeType="positive"
          variant="green"
        />
        <StatCard
          label="Today's Dinner"
          value={attendance.dinner.present}
          icon={<Clock className="w-5 h-5 text-brand-darkGreen" />}
          change={`${attendance.dinner.present} Present`}
          changeType="neutral"
          variant="yellow"
        />
        <StatCard
          label="Poll Votes Cast"
          value={`${pollPercentage}%`}
          icon={<Vote className="w-5 h-5 text-brand-darkGreen" />}
          change={`${totalPollLunch}/${lunchPresent} Locations Set`}
          changeType="positive"
          variant="default"
        />
      </div>

      {/* Lunch Delivery Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Today's Lunch Location Breakdown"
          subtitle="Real-time aggregation from customer lunch poll"
          icon={<Vote className="w-5 h-5 text-brand-orange" />}
          action={
            <Link to="/owner/polls">
              <span className="text-xs font-black text-brand-orange hover:underline flex items-center gap-1">
                Full Details <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 font-nunito">
            <div className="p-4 rounded-brand bg-brand-yellow/30 border-2.5 border-brand-orange flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-brand-darkGreen uppercase tracking-wider block">
                  College Delivery
                </span>
                <span className="text-3xl font-black text-brand-darkGreen block leading-tight mt-1">
                  {collegeCount} Tiffins
                </span>
                <span className="text-xs font-bold text-brand-green mt-1 block">
                  Campus Gates 1 & 2
                </span>
              </div>
              <div className="p-3 bg-brand-yellow rounded-brand border-2 border-brand-orange">
                <School className="w-8 h-8 text-brand-darkGreen" />
              </div>
            </div>

            <div className="p-4 rounded-brand bg-brand-creamLight border-2.5 border-brand-orange flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-brand-darkGreen uppercase tracking-wider block">
                  Mess / Dining Hall
                </span>
                <span className="text-3xl font-black text-brand-darkGreen block leading-tight mt-1">
                  {restaurantCount} Meals
                </span>
                <span className="text-xs font-bold text-brand-green mt-1 block">
                  Dine-in at Swayamsiddha
                </span>
              </div>
              <div className="p-3 bg-brand-card rounded-brand border-2 border-brand-orange">
                <Store className="w-8 h-8 text-brand-darkGreen" />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Operations Shortcuts */}
        <Card
          title="Quick Actions"
          subtitle="Common operational tasks"
          icon={<TrendingUp className="w-5 h-5 text-brand-orange" />}
        >
          <div className="flex flex-col gap-2.5 font-nunito">
            <Link to="/owner/customers">
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Add New Customer
              </Button>
            </Link>
            <Link to="/owner/attendance">
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Mark Attendance & Tokens
              </Button>
            </Link>
            <Link to="/owner/messages">
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Kitchen Inquiries
              </Button>
            </Link>
            <Link to="/owner/analytics">
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Operational Reports
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
