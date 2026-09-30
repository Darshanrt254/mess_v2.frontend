import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Home,
  UtensilsCrossed,
  Calendar,
  Ticket,
  MessageSquare,
  User,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

const CUSTOMER_NAV_ITEMS = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: Home },
  { to: '/customer/attendance', label: 'Mark Meals', icon: UtensilsCrossed },
  { to: '/customer/calendar', label: 'Monthly Calendar', icon: Calendar },
  { to: '/customer/tokens', label: 'My Tokens', icon: Ticket },
  { to: '/customer/messages', label: 'Contact Kitchen', icon: MessageSquare },
  { to: '/customer/profile', label: 'Profile', icon: User },
];

const CUSTOMER_MOBILE_NAV_ITEMS = [
  { to: '/customer/dashboard', label: 'Home', icon: Home },
  { to: '/customer/attendance', label: 'Meals', icon: UtensilsCrossed },
  { to: '/customer/calendar', label: 'Calendar', icon: Calendar },
  { to: '/customer/tokens', label: 'Tokens', icon: Ticket },
  { to: '/customer/profile', label: 'Profile', icon: User },
];

export function CustomerLayout() {
  return (
    <AppShell
      role="CUSTOMER"
      sidebarTitle="Student / Customer"
      navItems={CUSTOMER_NAV_ITEMS}
      mobileNavItems={CUSTOMER_MOBILE_NAV_ITEMS}
      containerClassName="max-w-4xl"
    >
      <Outlet />
    </AppShell>
  );
}
