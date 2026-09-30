import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  ArrowLeft,
  User,
  Phone,
  Utensils,
  PlusCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  Receipt,
} from 'lucide-react';
import {
  useOwnerCustomerDetail,
  useCustomerSuspensions,
  useRechargeCustomer,
  useCreateSuspension,
  useUnsuspendCustomer,
} from '@/hooks/useOwner';

export function CustomerDetailsPage() {
  const { id } = useParams();

  const { data: customer, isLoading, error } = useOwnerCustomerDetail(id);
  const { data: suspensions = [] } = useCustomerSuspensions(id);

  const rechargeMutation = useRechargeCustomer();
  const createSuspensionMutation = useCreateSuspension();
  const unsuspendMutation = useUnsuspendCustomer();

  // Modals
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  // Form states
  const [rechargeAmount, setRechargeAmount] = useState('30');
  const [suspensionStart, setSuspensionStart] = useState('');
  const [suspensionEnd, setSuspensionEnd] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading customer subscription record..." />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link to="/owner/customers">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
        <Alert variant="danger" title="Customer Not Found">
          {error?.message || 'Could not find customer with this ID.'}
        </Alert>
      </div>
    );
  }

  const remainingTiffins = customer.remainingTiffins ?? 0;
  const isPaymentSuspended = remainingTiffins <= 0;
  const isServiceSuspended = customer.serviceStatus === 'SERVICE_SUSPENDED';

  const getStatusBadge = () => {
    if (isPaymentSuspended) {
      return <Badge variant="danger" size="sm">Payment Pending (0)</Badge>;
    }
    if (isServiceSuspended) {
      return <Badge variant="brand" size="sm">Service Suspended</Badge>;
    }
    if (remainingTiffins <= 5) {
      return <Badge variant="danger" size="sm">Very Low ({remainingTiffins})</Badge>;
    }
    if (remainingTiffins <= 10) {
      return <Badge variant="warning" size="sm">Low ({remainingTiffins})</Badge>;
    }
    return <Badge variant="success" size="sm">Active Account</Badge>;
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    setActionError(null);
    const count = parseInt(rechargeAmount, 10);
    if (isNaN(count) || count <= 0) {
      setActionError('Please enter a valid positive meal count.');
      return;
    }

    try {
      await rechargeMutation.mutateAsync({
        customerId: id,
        amount: count,
      });
      setIsTopupModalOpen(false);
      setActionSuccess(`Recharge of ${count} tiffins completed successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Recharge failed.');
    }
  };

  const handleCreateSuspension = async (e) => {
    e.preventDefault();
    setActionError(null);
    if (!suspensionStart || !suspensionEnd) {
      setActionError('Start date and end date are required.');
      return;
    }

    try {
      await createSuspensionMutation.mutateAsync({
        customerId: id,
        startDate: suspensionStart,
        endDate: suspensionEnd,
        reason: suspensionReason,
      });
      setIsSuspendModalOpen(false);
      setSuspensionStart('');
      setSuspensionEnd('');
      setSuspensionReason('');
      setActionSuccess('Service suspension recorded successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to create suspension.');
    }
  };

  const handleUnsuspend = async (suspensionId) => {
    setActionError(null);
    try {
      await unsuspendMutation.mutateAsync({
        customerId: id,
        suspensionId,
      });
      setActionSuccess('Customer unsuspended successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to unsuspend customer.');
    }
  };

  const transactions = customer.tiffinTransactions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/owner/customers">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={customer.name}
        subtitle={`Viewing subscription record for Customer ID: #${customer.id}`}
        badge={getStatusBadge()}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSuspendModalOpen(true)}
              leftIcon={<PauseCircle className="w-4 h-4" />}
            >
              Suspend Service
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTopupModalOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Cash Recharge
            </Button>
          </div>
        }
      />

      {actionError && (
        <Alert variant="danger" title="Operation Failed">
          {actionError}
        </Alert>
      )}

      {actionSuccess && (
        <Alert variant="success" title="Success">
          {actionSuccess}
        </Alert>
      )}

      {/* Suspension / Payment alert for owner */}
      {isPaymentSuspended && (
        <div className="p-4 rounded-brand-sm bg-red-50 border-2.5 border-red-400 font-nunito flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-red-950">Payment Suspension Active</h4>
            <p className="text-xs font-bold text-red-800 mt-0.5">
              Customer has 0 tiffins left. Services are halted until cash payment is received and balance is topped up.
            </p>
          </div>
        </div>
      )}

      {isServiceSuspended && (
        <div className="p-4 rounded-brand-sm bg-amber-50 border-2.5 border-brand-orange font-nunito flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-amber-950">Service Suspension Active</h4>
            <p className="text-xs font-bold text-amber-800 mt-0.5">
              Service is paused for this customer. Daily attendance will mark ABSENT with 0 deductions.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer Profile Card */}
        <Card
          title="Customer Profile"
          icon={<User className="w-5 h-5 text-brand-orange" />}
        >
          <div className="flex flex-col items-center text-center p-2 font-nunito">
            <Avatar name={customer.name} size="xl" className="border-3 border-brand-orange mb-3" />
            <h3 className="text-lg font-black text-brand-darkGreen">{customer.name}</h3>
            <span className="text-xs font-bold text-brand-green flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5" /> {customer.phone}
            </span>
            <div className="w-full mt-4 pt-4 border-t border-brand-orange/20 text-left space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-brand-green">Login ID:</span>
                <span className="text-brand-darkGreen font-mono">{customer.user?.loginIdentifier || customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-green">Role:</span>
                <span className="text-brand-darkGreen font-mono">{customer.user?.role || 'CUSTOMER'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-green">Status:</span>
                <span className="text-brand-darkGreen font-black">{customer.serviceStatus}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Statistics and Ledger */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Tiffins Remaining"
              value={remainingTiffins}
              variant={remainingTiffins === 0 ? 'yellow' : remainingTiffins <= 5 ? 'yellow' : 'green'}
            />
            <StatCard
              label="Ledger Records"
              value={transactions.length}
              variant="default"
            />
            <StatCard
              label="Suspensions"
              value={suspensions.length}
              variant="default"
            />
          </div>

          {/* Service Suspensions Card */}
          {suspensions.length > 0 && (
            <Card
              title="Service Suspensions"
              icon={<PauseCircle className="w-5 h-5 text-brand-orange" />}
            >
              <div className="divide-y divide-brand-orange/20 text-xs font-bold font-nunito">
                {suspensions.map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-brand-darkGreen font-black block">
                        {new Date(s.startDate).toISOString().slice(0, 10)} to {new Date(s.endDate).toISOString().slice(0, 10)}
                      </span>
                      {s.reason && <span className="text-[11px] text-brand-green">{s.reason}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.isActive ? 'warning' : 'neutral'} size="sm">
                        {s.isActive ? 'Active' : 'Ended'}
                      </Badge>
                      {s.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsuspend(s.id)}
                          disabled={unsuspendMutation.isPending}
                        >
                          Unsuspend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tiffin Ledger History */}
          <Card
            title="Tiffin Ledger Transactions"
            subtitle="Authoritative balance movements from backend"
            icon={<Receipt className="w-5 h-5 text-brand-orange" />}
          >
            {transactions.length === 0 ? (
              <div className="py-4 text-center text-xs font-bold text-brand-green font-nunito">
                No ledger transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-orange/20 text-xs font-bold font-nunito max-h-80 overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-brand-darkGreen font-black block font-mono">
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-brand-green">
                        {new Date(tx.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {tx.reason ? ` • ${tx.reason}` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                      <span className="text-[10px] text-brand-green block">
                        Bal: {tx.resultingBalance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Top-up (Recharge) Modal */}
      <Modal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        title="Cash Recharge Customer Tiffins"
        subtitle={`Add meals to ${customer.name}'s balance`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsTopupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRecharge}
              disabled={rechargeMutation.isPending}
            >
              {rechargeMutation.isPending ? 'Processing...' : 'Confirm Recharge'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecharge} className="space-y-4 font-nunito">
          <Input
            label="Tiffin Quantity to Add"
            type="number"
            min="1"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            required
            helperText="Direct cash recharge recorded in customer ledger."
          />
        </form>
      </Modal>

      {/* Service Suspension Modal */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title="Schedule Service Suspension"
        subtitle={`Pause meal services for ${customer.name}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateSuspension}
              disabled={createSuspensionMutation.isPending}
            >
              {createSuspensionMutation.isPending ? 'Saving...' : 'Apply Suspension'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSuspension} className="space-y-4 font-nunito">
          <Input
            label="Start Date (YYYY-MM-DD)"
            type="date"
            value={suspensionStart}
            onChange={(e) => setSuspensionStart(e.target.value)}
            required
          />
          <Input
            label="End Date (YYYY-MM-DD)"
            type="date"
            value={suspensionEnd}
            onChange={(e) => setSuspensionEnd(e.target.value)}
            required
          />
          <Input
            label="Reason / Notes (Optional)"
            placeholder="e.g. Diwali holiday leave"
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
