import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Receipt, Download } from 'lucide-react';
import { useOwnerAnalyticsTiffins, downloadOwnerExportXlsx } from '@/hooks/useOwner';

export function TransactionsPage() {
  const { data: tiffinData, isLoading, error } = useOwnerAnalyticsTiffins();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

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
        <LoadingState message="Loading tiffin ledger data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tiffin Transactions & Ledger"
        subtitle="Recharge history, meal consumption, and balance movements from the authoritative backend ledger."
        badge={<Badge variant="brand" size="sm">Billing</Badge>}
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

      {/* Ledger Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Initial Balances Added"
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
                <td className="py-3.5 px-3 text-right"><Badge variant="danger" size="sm">Debit</Badge></td>
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
      </Card>
    </div>
  );
}
