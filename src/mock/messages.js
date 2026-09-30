/**
 * Mock Messages Data Layer
 */

export const mockCustomerMessages = [
  {
    id: 1,
    sender: 'KITCHEN',
    text: 'Noted, extra chapatis have been packed for your tiffin today!',
    time: '28 Sep, 11:15 AM',
  },
  {
    id: 2,
    sender: 'CUSTOMER',
    text: 'Can I please get 2 extra chapatis for lunch today?',
    time: '28 Sep, 09:30 AM',
  },
];

export const mockOwnerMessages = [
  {
    id: 1,
    customer: 'Rahul Sharma',
    phone: '9876543210',
    text: 'Can I please get 2 extra chapatis for lunch today?',
    time: 'Today, 09:30 AM',
    status: 'Replied',
  },
  {
    id: 2,
    customer: 'Sneha Deshmukh',
    phone: '9765432109',
    text: 'I will be traveling from Thursday to Sunday. Please pause my dinner.',
    time: 'Today, 08:45 AM',
    status: 'Unread',
  },
  {
    id: 3,
    customer: 'Amit Patil',
    phone: '9822334455',
    text: 'Sabzi was slightly salty yesterday. Please check with kitchen cook.',
    time: 'Yesterday, 02:15 PM',
    status: 'Reviewed',
  },
];
