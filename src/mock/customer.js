/**
 * Mock Customer Data Layer
 * 
 * Provides isolated mock data for customer state, balance states,
 * and service/payment suspension states.
 */

export const CUSTOMER_STATUSES = {
  ACTIVE: 'ACTIVE',
  LOW_BALANCE: 'LOW_BALANCE',
  VERY_LOW_BALANCE: 'VERY_LOW_BALANCE',
  PAYMENT_SUSPENDED: 'PAYMENT_SUSPENDED',
  SERVICE_SUSPENDED: 'SERVICE_SUSPENDED',
};

export const SUPPORT_CONTACT = '+91 91655 35902';

// Primary active customer profile
export const mockCustomerProfile = {
  id: 'usr_cust_01',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@college.edu',
  phone: '9876543210',
  role: 'CUSTOMER',
  planName: 'Monthly 60-Meal Regular',
  expiryDate: '24 Oct 2026',
  balance: 42, // Default active balance
  totalMealsConsumed: 18,
  overdueAmount: 0,
  status: CUSTOMER_STATUSES.ACTIVE,
  deliveryLocation: 'Campus Gate 2 (Hostel B, Room 204)',
  suspension: {
    startDate: '01 Oct 2026',
    endDate: '08 Oct 2026',
    reason: 'Diwali Holiday Leave',
  },
};

// Owner Customer Directory with all required UI states
export const mockCustomerList = [
  {
    id: '1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    plan: 'Monthly 60-Meal',
    balance: 42,
    status: CUSTOMER_STATUSES.ACTIVE,
    location: 'Campus Gate 2',
    lastActive: 'Today, 09:42 AM',
  },
  {
    id: '2',
    name: 'Amit Patil',
    phone: '9822334455',
    plan: 'Lunch Only 30-Meal',
    balance: 10, // 10 tiffins -> Low Balance
    status: CUSTOMER_STATUSES.LOW_BALANCE,
    location: 'Mess Dining',
    lastActive: 'Today, 09:35 AM',
  },
  {
    id: '3',
    name: 'Sneha Deshmukh',
    phone: '9765432109',
    plan: 'Monthly 60-Meal',
    balance: 4, // < 5 tiffins -> Very Low Balance
    status: CUSTOMER_STATUSES.VERY_LOW_BALANCE,
    location: 'Campus Gate 1',
    lastActive: 'Today, 08:45 AM',
  },
  {
    id: '4',
    name: 'Vikram Joshi',
    phone: '9422001122',
    plan: 'Monthly 60-Meal',
    balance: 0, // 0 tiffins -> Payment Pending / Suspended
    status: CUSTOMER_STATUSES.PAYMENT_SUSPENDED,
    location: 'Mess Dining',
    lastActive: '2 days ago',
  },
  {
    id: '5',
    name: 'Pooja Kulkarni',
    phone: '9890112233',
    plan: 'Dinner Only 30-Meal',
    balance: 22,
    status: CUSTOMER_STATUSES.SERVICE_SUSPENDED,
    suspension: {
      startDate: '28 Sep 2026',
      endDate: '05 Oct 2026',
      reason: 'Home visit request',
    },
    location: 'Mess Dining',
    lastActive: '28 Sep 2026',
  },
  {
    id: '6',
    name: 'Rohan Mehra',
    phone: '9811223344',
    plan: 'Monthly 60-Meal',
    balance: 38,
    status: CUSTOMER_STATUSES.ACTIVE,
    location: 'Campus Gate 2',
    lastActive: 'Today, 09:15 AM',
  },
];
