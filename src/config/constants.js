/**
 * Application Constants
 * Swayamsiddha Mess Management System
 */

export const SUPPORT_CONTACT = '+91 91655 35902';

export const PAYMENT_SUSPENSION_MESSAGE =
  `Your tiffin balance is 0. Please contact ${SUPPORT_CONTACT} for payment and resuming your services.`;

export const ATTENDANCE_CONFIRMATION_NOTICE =
  'You will not be able to change this attendance choice after confirmation.';

export const ATTENDANCE_STATUS = {
  UNMARKED: 'UNMARKED',
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
};

export const MEAL_TYPES = {
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
};

export const MEAL_LOCATIONS = {
  COLLEGE: 'COLLEGE',
  RESTAURANT: 'RESTAURANT',
};

export const POLL_OPTIONS = [
  { id: 'COLLEGE', label: 'College Delivery', description: 'Delivered to designated college spot' },
  { id: 'RESTAURANT', label: 'Restaurant / Mess Dining', description: 'Dine-in at Swayamsiddha Mess' },
];
