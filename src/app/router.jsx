import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/LoadingState';

// Layouts
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';

// Owner Pages
import { OwnerDashboardPage } from '@/pages/owner/OwnerDashboardPage';
import { CustomersPage } from '@/pages/owner/CustomersPage';
import { CustomerDetailsPage } from '@/pages/owner/CustomerDetailsPage';
import { AttendancePage as OwnerAttendancePage } from '@/pages/owner/AttendancePage';
import { PollsPage } from '@/pages/owner/PollsPage';
import { MessagesPage as OwnerMessagesPage } from '@/pages/owner/MessagesPage';
import { AnalyticsPage } from '@/pages/owner/AnalyticsPage';
import { TokensPage as OwnerTokensPage } from '@/pages/owner/TokensPage';
import { TransactionsPage } from '@/pages/owner/TransactionsPage';
import { SettingsPage } from '@/pages/owner/SettingsPage';

// Customer Pages
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage';
import { AttendancePage as CustomerAttendancePage } from '@/pages/customer/AttendancePage';
import { CalendarPage } from '@/pages/customer/CalendarPage';
import { TokensPage as CustomerTokensPage } from '@/pages/customer/TokensPage';
import { MessagesPage as CustomerMessagesPage } from '@/pages/customer/MessagesPage';
import { ProfilePage } from '@/pages/customer/ProfilePage';

/**
 * Root navigation handler:
 * Directs user to their appropriate role portal or to the login screen.
 * There is NO public landing page.
 */
function RootIndexRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-creamLight">
        <LoadingState message="Starting Swayamsiddha..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'OWNER') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return <Navigate to="/customer/dashboard" replace />;
}

export const router = createBrowserRouter([
  // Public Root & Login
  {
    path: '/',
    element: <RootIndexRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Protected OWNER Routes
  {
    path: '/owner',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="OWNER">
          <OwnerLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/owner/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <OwnerDashboardPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'customers/:id',
        element: <CustomerDetailsPage />,
      },
      {
        path: 'attendance',
        element: <OwnerAttendancePage />,
      },
      {
        path: 'polls',
        element: <PollsPage />,
      },
      {
        path: 'messages',
        element: <OwnerMessagesPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'tokens',
        element: <OwnerTokensPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Protected CUSTOMER Routes
  {
    path: '/customer',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="CUSTOMER">
          <CustomerLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/customer/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <CustomerDashboardPage />,
      },
      {
        path: 'attendance',
        element: <CustomerAttendancePage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'tokens',
        element: <CustomerTokensPage />,
      },
      {
        path: 'messages',
        element: <CustomerMessagesPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

  // Catch-all fallback
  {
    path: '*',
    element: <RootIndexRedirect />,
  },
]);
