import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { TrendingUp, BarChart2, Download, Users, Utensils, School, Store, Calendar, Flame } from 'lucide-react';
import {
  useOwnerAnalyticsOverview,
  useOwnerAnalyticsMeals,
  useOwnerAnalyticsLocations,
  useOwnerAnalyticsAttendance,
  downloadOwnerExportXlsx,
} from '@/hooks/useOwner';
import { REPORTING_START_DATE, clampToReportingBoundary } from '@/utils/planLabels';

export function AnalyticsPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(REPORTING_START_DATE);
  const [toDate, setToDate] = useState(todayStr);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const queryParams = { from: fromDate, to: toDate };
  const { data: overview, isLoading: isOverviewLoading } = useOwnerAnalyticsOverview(queryParams);
  const { data: meals } = useOwnerAnalyticsMeals(queryParams);
  const { data: locations } = useOwnerAnalyticsLocations(queryParams);
  const { data: attendance } = useOwnerAnalyticsAttendance(queryParams);

  const isLoading = isOverviewLoading;

  const handleExport = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadOwnerExportXlsx({ from: fromDate, to: toDate });
    } catch (err) {
      setDownloadError(err.message || 'XLSX download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFromChange = (e) => {
    const val = e.target.value;
    setFromDate(clampToReportingBoundary(val));
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    setToDate(val < REPORTING_START_DATE ? REPORTING_START_DATE : val);
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
  const tiffinsSummary = overview?.tiffins || {};

  const lunchPresent = attendanceSummary?.lunch?.present || 0;
  const lunchAbsent = attendanceSummary?.lunch?.absent || 0;
  const lunchTotal = lunchPresent + lunchAbsent;
  const lunchAbsentRate = lunchTotal > 0 ? ((lunchAbsent / lunchTotal) * 100).toFixed(1) : '0';

  const collegeCount = locationsSummary?.lunch?.college || 0;
  const restaurantCount = locationsSummary?.lunch?.restaurant || 0;
  const totalLocations = collegeCount + restaurantCount;
  const collegePercent = totalLocations > 0 ? ((collegeCount / totalLocations) * 100).toFixed(0) : 0;

  const hasData = (mealsSummary?.total > 0) || (tiffinsSummary?.expired > 0) || (lunchTotal > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Analytics & Reports"
        subtitle="Operational performance, attendance trends, package expiry, and meal consumption."
        badge={<Badge variant="brand" size="sm">Reporting Start: Oct 1, 2026</Badge>}
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

      {/* Date Range Controls with October 1, 2026 Reporting Boundary */}
      <Card
        title="Analytics Date Range Filter"
        subtitle="Constrained to authoritative system history starting October 1, 2026"
        icon={<Calendar className="w-5 h-5 text-brand-orange" />}
      >
        <div className="flex flex-wrap items-center gap-4 py-2 font-nunito text-xs font-bold">
          <div className="flex items-center gap-2">
            <label className="text-brand-darkGreen font-black">From:</label>
            <input
              type="date"
              min={REPORTING_START_DATE}
              value={fromDate}
              onChange={handleFromChange}
              className="bg-brand-cream border-2 border-brand-orange rounded-brand-sm px-2.5 py-1.5 text-xs font-bold text-brand-darkGreen outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-brand-darkGreen font-black">To:</label>
            <input
              type="date"
              min={REPORTING_START_DATE}
              value={toDate}
              onChange={handleToChange}
              className="bg-brand-cream border-2 border-brand-orange rounded-brand-sm px-2.5 py-1.5 text-xs font-bold text-brand-darkGreen outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <div className="text-[11px] text-brand-green font-bold">
            Showing records between {fromDate} and {toDate} (Asia/Kolkata)
          </div>
        </div>
      </Card>

      {/* Summary Stats - Package Expiry Separated from Meals Consumed */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Meals (Range)"
          value={mealsSummary?.total || 0}
          variant="green"
          icon={<Utensils className="w-5 h-5 text-brand-darkGreen" />}
        />
        <StatCard
          label="Package Expirations"
          value={tiffinsSummary?.expired || 0}
          variant="yellow"
          icon={<Flame className="w-5 h-5 text-red-600" />}
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

      {!hasData && (
        <div className="p-4 rounded-brand-sm bg-brand-yellow/15 border-2 border-dashed border-brand-orange/40 text-center font-nunito">
          <span className="text-sm font-black text-brand-darkGreen block">
            No Activity Recorded in Selected Date Range
          </span>
          <span className="text-xs font-bold text-brand-green block mt-1">
            There are no meals, attendance records, or package expirations between {fromDate} and {toDate}.
          </span>
        </div>
      )}

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
                  {collegeCount}
                </span>
                <span className="text-xs font-bold text-brand-green">College Deliveries</span>
              </div>
              <div className="p-3 rounded-brand-sm bg-brand-creamLight border border-brand-orange/40 text-center">
                <span className="text-2xl font-black text-brand-darkGreen block">
                  {restaurantCount}
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
        subtitle={`Download complete operational records between ${fromDate} and ${toDate} as XLSX`}
        icon={<Download className="w-5 h-5 text-brand-orange" />}
      >
        <div className="p-4 font-nunito space-y-3">
          <p className="text-sm font-bold text-brand-darkGreen">
            Export includes: attendance records, meal tokens, tiffin ledger (recharges and package expiry losses), customer balances, poll results, and daily operational summaries.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={isDownloading}
          >
            {isDownloading ? 'Generating Report...' : `Download XLSX (${fromDate} to ${toDate})`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
