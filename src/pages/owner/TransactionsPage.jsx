import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Receipt, Download, Calendar, Flame } from 'lucide-react';
import { useOwnerAnalyticsTiffins, downloadOwnerExportXlsx } from '@/hooks/useOwner';
import { REPORTING_START_DATE, clampToReportingBoundary } from '@/utils/planLabels';

export function TransactionsPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(REPORTING_START_DATE);
  const [toDate, setToDate] = useState(todayStr);

  const { data: tiffinData, isLoading, error } = useOwnerAnalyticsTiffins({
    from: fromDate,
    to: toDate,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tiffin Transactions & Ledger"
        subtitle="Recharge history, meal consumption, and package expiration movements from the authoritative backend ledger."
        badge={<Badge variant="brand" size="sm">Reporting Start: Oct 1, 2026</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download XLSX'}
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" title="Error Loading Ledger">
          {error.message}
        </Alert>
      )}

      {downloadError && (
        <Alert variant="danger" title="Export Failed">
          {downloadError}
        </Alert>
      )}

      {/* Date Range Controls with October 1, 2026 Reporting Boundary */}
      <Card
        title="Ledger Date Range Filter"
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

      {isLoading ? (
        <div className="py-12">
          <LoadingState message="Loading tiffin ledger data..." />
        </div>
      ) : (
        <>
          {/* Ledger Summary Cards - Package Expiry Losses Separated from Consumed */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard
              label="Initial Balances"
              value={tiffinData?.initialBalance || 0}
              variant="green"
            />
            <StatCard
              label="Cash Recharges"
              value={tiffinData?.cashRecharge || 0}
              variant="default"
            />
            <StatCard
              label="Meals Consumed"
              value={tiffinData?.mealConsumption || 0}
              variant="yellow"
            />
            <StatCard
              label="Package Expiry Losses"
              value={tiffinData?.packageExpired || 0}
              variant="yellow"
              icon={<Flame className="w-5 h-5 text-red-600" />}
            />
            <StatCard
              label="Net Balance Change"
              value={tiffinData?.netChange || 0}
              variant="default"
            />
          </div>

          {/* Transaction Type Breakdown */}
          <Card
            title="Ledger Transaction Summary"
            subtitle="Authoritative tiffin movement data from backend database"
            icon={<Receipt className="w-5 h-5 text-brand-orange" />}
          >
            {(!tiffinData?.counts?.total || tiffinData.counts.total === 0) ? (
              <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito">
                No ledger transactions found in the selected date range.
              </div>
            ) : (
              <div className="overflow-x-auto font-nunito">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-brand-orange/30 text-xs font-black uppercase text-brand-green tracking-wider">
                      <th className="py-3 px-3">Transaction Type</th>
                      <th className="py-3 px-3 text-center">Count</th>
                      <th className="py-3 px-3 text-right">Total Tiffins</th>
                      <th className="py-3 px-3 text-right">Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-orange/20 text-sm font-bold">
                    <tr className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs bg-brand-yellow/30 px-2 py-0.5 rounded border border-brand-orange/30 text-brand-darkGreen">INITIAL_BALANCE</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-brand-darkGreen">{tiffinData?.counts?.initialBalance || 0}</td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-700">+{tiffinData?.initialBalance || 0}</td>
                      <td className="py-3.5 px-3 text-right"><Badge variant="success" size="sm">Credit</Badge></td>
                    </tr>
                    <tr className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs bg-brand-yellow/30 px-2 py-0.5 rounded border border-brand-orange/30 text-brand-darkGreen">CASH_RECHARGE</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-brand-darkGreen">{tiffinData?.counts?.cashRecharge || 0}</td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-700">+{tiffinData?.cashRecharge || 0}</td>
                      <td className="py-3.5 px-3 text-right"><Badge variant="success" size="sm">Credit</Badge></td>
                    </tr>
                    <tr className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs bg-brand-yellow/30 px-2 py-0.5 rounded border border-brand-orange/30 text-brand-darkGreen">MEAL_TOKEN</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-brand-darkGreen">{tiffinData?.counts?.mealToken || 0}</td>
                      <td className="py-3.5 px-3 text-right font-black text-red-700">-{tiffinData?.mealConsumption || 0}</td>
                      <td className="py-3.5 px-3 text-right"><Badge variant="danger" size="sm">Debit (Consumed)</Badge></td>
                    </tr>
                    <tr className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-300">PACKAGE_EXPIRED</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-brand-darkGreen">{tiffinData?.counts?.packageExpired || 0}</td>
                      <td className="py-3.5 px-3 text-right font-black text-red-700">-{tiffinData?.packageExpired || 0}</td>
                      <td className="py-3.5 px-3 text-right"><Badge variant="danger" size="sm">Debit (Expired)</Badge></td>
                    </tr>
                    {tiffinData?.adjustments !== 0 && (
                      <tr className="hover:bg-brand-yellow/10 transition-colors">
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-xs bg-brand-yellow/30 px-2 py-0.5 rounded border border-brand-orange/30 text-brand-darkGreen">ADJUSTMENT</span>
                        </td>
                        <td className="py-3.5 px-3 text-center text-brand-darkGreen">{tiffinData?.counts?.adjustment || 0}</td>
                        <td className="py-3.5 px-3 text-right font-black text-brand-darkGreen">{tiffinData?.adjustments || 0}</td>
                        <td className="py-3.5 px-3 text-right"><Badge variant="neutral" size="sm">Adjustment</Badge></td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-brand-orange/40 bg-brand-yellow/10">
                      <td className="py-3 px-3 font-black text-brand-darkGreen text-sm">Net Change</td>
                      <td className="py-3 px-3 text-center font-black text-brand-darkGreen">{tiffinData?.counts?.total || 0}</td>
                      <td className="py-3 px-3 text-right font-black text-brand-darkGreen text-base">
                        {(tiffinData?.netChange || 0) >= 0 ? '+' : ''}{tiffinData?.netChange || 0}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Badge variant={(tiffinData?.netChange || 0) >= 0 ? 'success' : 'warning'} size="sm">
                          {(tiffinData?.netChange || 0) >= 0 ? 'Net Positive' : 'Net Negative'}
                        </Badge>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
