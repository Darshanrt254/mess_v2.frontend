import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { TrendingUp, BarChart2, Download, Users, Utensils, School, Store } from 'lucide-react';
import {
  useOwnerAnalyticsOverview,
  useOwnerAnalyticsMeals,
  useOwnerAnalyticsLocations,
  useOwnerAnalyticsAttendance,
  downloadOwnerExportXlsx,
} from '@/hooks/useOwner';

export function AnalyticsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const { data: overview, isLoading: isOverviewLoading } = useOwnerAnalyticsOverview();
  const { data: meals } = useOwnerAnalyticsMeals();
  const { data: locations } = useOwnerAnalyticsLocations();
  const { data: attendance } = useOwnerAnalyticsAttendance();

  const isLoading = isOverviewLoading;

  const handleExport = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadOwnerExportXlsx();
    } catch (err) {
      setDownloadError(err.message || 'XLSX download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading operational analytics..." />
      </div>
    );
  }

  const customers = overview?.customers || {};
  const mealsSummary = overview?.meals || {};
  const locationsSummary = overview?.locations || {};
  const attendanceSummary = overview?.attendance || {};

  const lunchPresent = attendanceSummary?.lunch?.present || 0;
  const lunchAbsent = attendanceSummary?.lunch?.absent || 0;
  const lunchTotal = lunchPresent + lunchAbsent;
  const lunchAbsentRate = lunchTotal > 0 ? ((lunchAbsent / lunchTotal) * 100).toFixed(1) : '0';

  const collegePercent = locationsSummary?.lunch?.college && (locationsSummary.lunch.college + locationsSummary.lunch.restaurant) > 0
    ? ((locationsSummary.lunch.college / (locationsSummary.lunch.college + locationsSummary.lunch.restaurant)) * 100).toFixed(0)
    : 0;

  // Daily breakdown from meals analytics if available
  const dailyRows = meals?.daily || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Analytics & Reports"
        subtitle="Operational performance, attendance trends, and meal consumption patterns."
        badge={<Badge variant="brand" size="sm">Live Analytics</Badge>}
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Export XLSX'}
          </Button>
        }
      />

      {downloadError && (
        <Alert variant="danger" title="Export Failed">
          {downloadError}
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Meals (Range)"
          value={mealsSummary?.total || 0}
          variant="green"
          icon={<Utensils className="w-5 h-5 text-brand-darkGreen" />}
        />
        <StatCard
          label="Active Customers"
          value={customers?.active || 0}
          variant="default"
          icon={<Users className="w-5 h-5 text-brand-darkGreen" />}
        />
        <StatCard
          label="Campus Delivery %"
          value={`${collegePercent}%`}
          variant="yellow"
          icon={<School className="w-5 h-5 text-brand-darkGreen" />}
        />
        <StatCard
          label="Lunch Absent Rate"
          value={`${lunchAbsentRate}%`}
          variant="default"
          icon={<TrendingUp className="w-5 h-5 text-brand-darkGreen" />}
        />
      </div>

      {/* Attendance Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Attendance Summary"
          subtitle="Lunch & Dinner present/absent breakdown for the selected range"
          icon={<BarChart2 className="w-5 h-5 text-brand-orange" />}
        >
          <div className="space-y-4 mt-2 font-nunito">
            {['lunch', 'dinner'].map((meal) => {
              const mealData = attendanceSummary[meal] || {};
              const present = mealData.present || 0;
              const absent = mealData.absent || 0;
              const total = present + absent;
              const presentPct = total > 0 ? ((present / total) * 100).toFixed(0) : 0;
              return (
                <div key={meal}>
                  <div className="flex justify-between text-xs font-black text-brand-darkGreen mb-1">
                    <span className="capitalize">{meal}</span>
                    <span>{present} Present / {absent} Absent</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex border border-brand-orange/40">
                    <div
                      className="bg-brand-darkGreen transition-all"
                      style={{ width: `${presentPct}%` }}
                      title={`Present: ${present}`}
                    />
                    <div
                      className="bg-brand-orange/60 transition-all"
                      style={{ width: `${100 - parseInt(presentPct)}%` }}
                      title={`Absent: ${absent}`}
                    />
                  </div>
                  <p className="text-[10px] text-brand-green mt-0.5">{presentPct}% attendance rate</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Location Breakdown */}
        <Card
          title="Lunch Location Breakdown"
          subtitle="College delivery vs. Dining Hall distribution"
          icon={<Store className="w-5 h-5 text-brand-orange" />}
        >
          <div className="space-y-4 mt-2 font-nunito">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-brand-sm bg-brand-yellow/20 border border-brand-orange/40 text-center">
                <span className="text-2xl font-black text-brand-darkGreen block">
                  {locationsSummary?.lunch?.college || 0}
                </span>
                <span className="text-xs font-bold text-brand-green">College Deliveries</span>
              </div>
              <div className="p-3 rounded-brand-sm bg-brand-creamLight border border-brand-orange/40 text-center">
                <span className="text-2xl font-black text-brand-darkGreen block">
                  {locationsSummary?.lunch?.restaurant || 0}
                </span>
                <span className="text-xs font-bold text-brand-green">Restaurant Meals</span>
              </div>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex border-2 border-brand-orange">
              <div
                className="bg-brand-darkGreen text-brand-yellow font-black text-xs flex items-center justify-center transition-all duration-300"
                style={{ width: `${collegePercent}%` }}
              >
                {collegePercent > 20 ? `${collegePercent}%` : ''}
              </div>
              <div
                className="bg-brand-yellow text-brand-darkGreen font-black text-xs flex items-center justify-center transition-all duration-300"
                style={{ width: `${100 - parseInt(collegePercent)}%` }}
              >
                {(100 - parseInt(collegePercent)) > 20 ? `${100 - parseInt(collegePercent)}%` : ''}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Note */}
      <Card
        title="Export Operational Report"
        subtitle="Download complete meal, attendance, and transaction data as XLSX"
        icon={<Download className="w-5 h-5 text-brand-orange" />}
      >
        <div className="p-4 font-nunito space-y-3">
          <p className="text-sm font-bold text-brand-darkGreen">
            Export includes: attendance records, meal tokens, tiffin transactions, customer balances, poll results, and daily summaries.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={isDownloading}
          >
            {isDownloading ? 'Generating Report...' : 'Download Full XLSX Report'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
