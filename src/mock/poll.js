/**
 * Mock Lunch Poll Data Layer
 */

export const POLL_OPTIONS = {
  COLLEGE: 'COLLEGE',
  RESTAURANT: 'RESTAURANT',
};

export const mockOwnerPollResults = {
  totalEligible: 132, // Marked Present for Lunch today
  votesCast: 126,
  votesPending: 6,
  collegeCount: 84,
  restaurantCount: 48,
  percentageCollege: 66.7,
  percentageRestaurant: 33.3,
  recentVoters: [
    { name: 'Rahul Sharma', location: 'College Delivery (Gate 2)', time: '09:42 AM' },
    { name: 'Amit Patil', location: 'Mess Dining Hall', time: '09:35 AM' },
    { name: 'Rohan Mehra', location: 'College Delivery (Gate 1)', time: '09:28 AM' },
    { name: 'Sneha Deshmukh', location: 'Pending Vote (Marked Present)', time: '09:20 AM' },
  ],
};
