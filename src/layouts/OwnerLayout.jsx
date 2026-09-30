import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Vote,
  MessageSquare,
  TrendingUp,
  Ticket,
  Receipt,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

const OWNER_NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/customers', label: 'Customers', icon: Users, end: false },
  { to: '/owner/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/owner/polls', label: 'Poll Monitoring', icon: Vote },
  { to: '/owner/messages', label: 'Messages', icon: MessageSquare },
  { to: '/owner/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/owner/tokens', label: 'Tokens', icon: Ticket },
  { to: '/owner/transactions', label: 'Transactions', icon: Receipt },
  { to: '/owner/settings', label: 'Settings', icon: Settings },
];

const OWNER_MOBILE_NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/customers', label: 'Customers', icon: Users, end: false },
  { to: '/owner/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/owner/polls', label: 'Polls', icon: Vote },
  { to: '/owner/tokens', label: 'Tokens', icon: Ticket },
];

export function OwnerLayout() {
  return (
    <AppShell
      role="OWNER"
      sidebarTitle="Owner Administration"
      navItems={OWNER_NAV_ITEMS}
      mobileNavItems={OWNER_MOBILE_NAV_ITEMS}
      containerClassName="max-w-7xl"
    >
      <Outlet />
    </AppShell>
  );
}
