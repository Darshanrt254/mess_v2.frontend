/**
 * Mock Tokens Data Layer
 * 
 * Note: Tokens are generated EXCLUSIVELY by the backend.
 * The frontend does NOT generate token IDs.
 * These format examples match the backend contract (e.g. 27-09-01-R-001).
 */

export const mockCustomerTokens = {
  activeToken: {
    tokenId: '27-09-01-C-001',
    tokenDisplayNumber: '#42',
    mealType: 'LUNCH',
    targetLocation: 'Campus Gate 2 (College Delivery)',
    date: '30 Sep 2026',
    status: 'ACTIVE', // ACTIVE, REDEEMED, EXPIRED, CANCELLED
    customerName: 'Rahul Sharma',
    planType: 'Standard Vegetarian Thali',
    issuedAt: '2026-09-30T09:42:00Z',
  },
  history: [
    {
      tokenId: '26-09-02-R-045',
      mealType: 'DINNER',
      date: '29 Sep 2026',
      targetLocation: 'Swayamsiddha Dining Hall',
      status: 'REDEEMED',
      redeemedAt: '08:15 PM',
    },
    {
      tokenId: '26-09-01-C-032',
      mealType: 'LUNCH',
      date: '29 Sep 2026',
      targetLocation: 'Campus Gate 2',
      status: 'REDEEMED',
      redeemedAt: '12:55 PM',
    },
    {
      tokenId: '25-09-02-R-019',
      mealType: 'DINNER',
      date: '28 Sep 2026',
      targetLocation: 'Swayamsiddha Dining Hall',
      status: 'REDEEMED',
      redeemedAt: '08:02 PM',
    },
  ],
};

export const mockOwnerTokenScans = [
  { tokenId: '27-09-01-C-001', name: 'Rahul Sharma', meal: 'Lunch', location: 'Gate 2', time: '12:45 PM', status: 'VALID' },
  { tokenId: '27-09-01-R-008', name: 'Amit Patil', meal: 'Lunch', location: 'Mess Dining', time: '12:50 PM', status: 'VALID' },
  { tokenId: '27-09-01-C-014', name: 'Rohan Mehra', meal: 'Lunch', location: 'Gate 1', time: '01:05 PM', status: 'VALID' },
];
