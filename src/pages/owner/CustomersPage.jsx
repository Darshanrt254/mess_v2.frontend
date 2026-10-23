import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Users, UserPlus, Search, ArrowRight, Phone } from 'lucide-react';
import { useOwnerCustomers, useCreateCustomer } from '@/hooks/useOwner';
import { formatPlanLabel, TIFFIN_PLAN_OPTIONS } from '@/utils/planLabels';

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form state for creating customer
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLoginId, setNewLoginId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newInitialTiffins, setNewInitialTiffins] = useState(56);
  const [newTiffinPlan, setNewTiffinPlan] = useState('BOTH');

  const { data, isLoading, error } = useOwnerCustomers();
  const createCustomerMutation = useCreateCustomer();

  const customerList = data?.customers || [];

  const filtered = customerList.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.user?.loginIdentifier || '').includes(searchTerm);

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return c.serviceStatus === 'ACTIVE' && !c.isPaymentSuspended && c.remainingTiffins > 5;
    if (statusFilter === 'LOW_BALANCE') return !c.isPaymentSuspended && c.remainingTiffins > 5 && c.remainingTiffins <= 10;
    if (statusFilter === 'VERY_LOW_BALANCE') return !c.isPaymentSuspended && c.remainingTiffins > 0 && c.remainingTiffins <= 5;
    if (statusFilter === 'PAYMENT_SUSPENDED') return Boolean(c.isPaymentSuspended);
    if (statusFilter === 'SERVICE_SUSPENDED') return c.serviceStatus === 'SERVICE_SUSPENDED';
    return true;
  });

  const getStatusBadge = (cust) => {
    if (cust.isPaymentSuspended) {
      return <Badge variant="danger" size="sm">Payment Pending (0)</Badge>;
    }
    if (cust.serviceStatus === 'SERVICE_SUSPENDED') {
      return <Badge variant="brand" size="sm">Service Suspended</Badge>;
    }
    if (cust.remainingTiffins <= 5) {
      return <Badge variant="danger" size="sm">Very Low ({cust.remainingTiffins})</Badge>;
    }
    if (cust.remainingTiffins <= 10) {
      return <Badge variant="warning" size="sm">Low ({cust.remainingTiffins})</Badge>;
    }
    return <Badge variant="success" size="sm">Active</Badge>;
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!newName.trim() || !newPhone.trim() || !newLoginId.trim() || !newPassword.trim()) {
      setModalError('Please fill all required fields.');
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        name: newName.trim(),
        phone: newPhone.trim(),
        loginIdentifier: newLoginId.trim(),
        password: newPassword.trim(),
        initialTiffins: Number(newInitialTiffins) || 56,
        tiffinPlan: newTiffinPlan,
      });
      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewLoginId('');
      setNewPassword('');
      setNewInitialTiffins(56);
      setNewTiffinPlan('BOTH');
    } catch (err) {
      setModalError(err.message || 'Failed to create customer');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        subtitle="Manage customer tiffin accounts, balance, plan validity, and profiles."
        badge={<Badge variant="brand" size="sm">{customerList.length} Total</Badge>}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Customer
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" title="Error Loading Customers">
          {error.message}
        </Alert>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'All Customers' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'LOW_BALANCE', label: 'Low Balance (≤10)' },
          { key: 'VERY_LOW_BALANCE', label: 'Very Low (≤5)' },
          { key: 'PAYMENT_SUSPENDED', label: 'Payment Pending (0)' },
          { key: 'SERVICE_SUSPENDED', label: 'Service Suspended' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-brand-sm text-xs font-black transition-all ${
              statusFilter === tab.key
                ? 'bg-brand-darkGreen text-brand-yellow border-2 border-brand-orange shadow-xs'
                : 'bg-brand-card hover:bg-white text-brand-darkGreen border-2 border-brand-orange/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card
        title="Customer Directory"
        icon={<Users className="w-5 h-5 text-brand-orange" />}
        action={
          <div className="w-64">
            <Input
              placeholder="Search by name, phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="py-1.5 text-xs"
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="py-8">
            <LoadingState message="Loading customers..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito">
            No customers match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-nunito border-collapse">
              <thead>
                <tr className="border-b-2 border-brand-orange/30 text-xs font-black uppercase text-brand-green tracking-wider">
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Login ID</th>
                  <th className="py-3 px-3 text-center">Meal Plan</th>
                  <th className="py-3 px-3 text-center">Meals Left</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-orange/20 text-sm font-bold">
                {filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3.5 px-3 flex items-center gap-3">
                      <Avatar name={cust.name} size="sm" />
                      <div>
                        <span className="font-black text-brand-darkGreen block leading-tight">{cust.name}</span>
                        <span className="text-[10px] text-brand-green">ID: {cust.id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-brand-darkGreen/80">
                      <span className="flex items-center gap-1 text-xs">
                        <Phone className="w-3.5 h-3.5 text-brand-green" /> {cust.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-brand-green font-mono">
                      {cust.user?.loginIdentifier || cust.phone}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant="brand" size="sm">
                        {formatPlanLabel(cust.tiffinPlan)}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-base font-black ${cust.isPaymentSuspended ? 'text-red-600' : cust.remainingTiffins <= 5 ? 'text-rose-600' : 'text-brand-darkGreen'}`}>
                        {cust.remainingTiffins}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {getStatusBadge(cust)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link to={`/owner/customers/${cust.id}`}>
                        <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        subtitle="Create a customer account with initial balance"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveCustomer}
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? 'Saving...' : 'Save Customer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 font-nunito">
          {modalError && (
            <Alert variant="danger" title="Validation Error">
              {modalError}
            </Alert>
          )}
          <Input
            label="Full Name"
            placeholder="e.g. Anand Kulkarni"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            placeholder="10-digit mobile number"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            required
          />
          <Input
            label="Login Identifier (Username)"
            placeholder="e.g. anand_k or phone number"
            value={newLoginId}
            onChange={(e) => setNewLoginId(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="Enter temporary password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="block text-xs font-black text-brand-darkGreen uppercase tracking-wide">
              Customer Meal Plan
            </label>
            <select
              value={newTiffinPlan}
              onChange={(e) => setNewTiffinPlan(e.target.value)}
              className="w-full bg-brand-cream border-2.5 border-brand-orange rounded-brand-sm p-2.5 text-xs font-bold text-brand-darkGreen outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer"
            >
              {TIFFIN_PLAN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] font-bold text-brand-green">
              Select lunch only, dinner only, or regular lunch and dinner service.
            </p>
          </div>
          <Input
            label="Initial Tiffin Balance"
            type="number"
            min="0"
            value={newInitialTiffins}
            onChange={(e) => setNewInitialTiffins(e.target.value)}
            helperText="Default is 56 meals as per backend contract."
          />
        </form>
      </Modal>
    </div>
  );
}
