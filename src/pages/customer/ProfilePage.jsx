import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerProfile } from '@/hooks/useCustomer';
import { User, Phone, Mail, MapPin, Shield, LogOut, Utensils } from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { data: customerProfile, isLoading, error } = useCustomerProfile();

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading your profile..." />
      </div>
    );
  }

  const name = customerProfile?.name || user?.name || user?.loginIdentifier || 'Member';
  const phone = customerProfile?.phone || user?.loginIdentifier || 'Not provided';
  const remainingTiffins = customerProfile?.remainingTiffins ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Profile"
        subtitle="Manage your personal details and account settings."
      />

      {error && (
        <Alert variant="danger" title="Error Loading Profile">
          {error.message}
        </Alert>
      )}

      <Card
        title="Personal Details"
        icon={<User className="w-5 h-5 text-brand-orange" />}
        action={<Badge variant="success" size="sm">Active Account</Badge>}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 font-nunito">
          <Avatar
            name={name}
            size="xl"
            className="border-3 border-brand-orange"
          />
          <div className="flex-1 space-y-3 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-brand-creamLight p-3 rounded-brand-sm border border-brand-orange/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-green flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name
                </span>
                <span className="text-sm font-black text-brand-darkGreen block mt-0.5">
                  {name}
                </span>
              </div>

              <div className="bg-brand-creamLight p-3 rounded-brand-sm border border-brand-orange/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-green flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Registered Phone
                </span>
                <span className="text-sm font-black text-brand-darkGreen block mt-0.5">
                  {phone}
                </span>
              </div>

              <div className="bg-brand-creamLight p-3 rounded-brand-sm border border-brand-orange/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-green flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Login Identifier
                </span>
                <span className="text-sm font-black text-brand-darkGreen block mt-0.5 truncate">
                  {user?.loginIdentifier || phone}
                </span>
              </div>

              <div className="bg-brand-creamLight p-3 rounded-brand-sm border border-brand-orange/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-green flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Remaining Tiffins
                </span>
                <span className="text-sm font-black text-brand-darkGreen block mt-0.5">
                  {remainingTiffins} Meals
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Subscription Overview"
        icon={<Shield className="w-5 h-5 text-brand-orange" />}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-brand-sm bg-brand-yellow/20 border-2 border-brand-orange/40 font-nunito">
          <div>
            <span className="text-base font-black text-brand-darkGreen block">
              Swayamsiddha Tiffin Plan
            </span>
            <span className="text-xs font-bold text-brand-green block mt-0.5">
              Current Available Balance: {remainingTiffins} Tiffins
            </span>
          </div>
          <Badge variant={remainingTiffins > 0 ? 'brand' : 'danger'} size="md">
            {remainingTiffins > 0 ? 'Active Plan' : 'Renewal Needed'}
          </Badge>
        </div>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          variant="danger"
          size="md"
          onClick={logout}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out of Account
        </Button>
      </div>
    </div>
  );
}
