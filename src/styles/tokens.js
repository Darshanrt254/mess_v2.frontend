/**
 * Swayamsiddha Centralized Design Tokens
 * Single source of truth for brand colors, styling rules, and visual tokens.
 */

export const THEME_COLORS = {
  primaryYellow: '#FFD93D',
  darkGreen: '#1B5E20',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  greenPale: '#A5D6A7',
  orange: '#FF8C00',
  orangeLight: '#FFB347',
  cream: '#FFF8E1',
  creamLight: '#FFFDE7',
  mutedText: '#667085',
  borderOrange: '#FF8C00',
  borderGreen: '#2E7D32',
};

// Visual states for calendar
export const CALENDAR_STATES = {
  DARK: {
    label: 'Both Absent',
    bg: '#1B5E20',
    color: '#FFD93D',
    borderColor: '#FF8C00',
    classNames: 'bg-brand-darkGreen text-brand-yellow border-brand-orange shadow-xs',
    dotClass: 'bg-brand-darkGreen border border-brand-orange',
  },
  LIGHT: {
    label: 'One Present',
    bg: '#4CAF50',
    color: '#FFFFFF',
    borderColor: '#2E7D32',
    classNames: 'bg-brand-greenLight text-white border-brand-green',
    dotClass: 'bg-brand-greenLight border border-brand-green',
  },
  FAINT: {
    label: 'Both Present',
    bg: '#C8E6C9',
    color: '#1B5E20',
    borderColor: '#81C784',
    classNames: 'bg-[#C8E6C9] text-brand-darkGreen border-[#81C784]',
    dotClass: 'bg-[#C8E6C9] border border-[#81C784]',
  },
  TODAY: {
    label: 'Today (Pending)',
    bg: '#E0F2FE',
    color: '#0369A1',
    borderColor: '#38BDF8',
    classNames: 'bg-sky-100 text-sky-800 border-sky-400 ring-2 ring-sky-300 font-black',
    dotClass: 'bg-sky-100 border border-sky-400',
  },
  NEUTRAL: {
    label: 'Unmarked',
    bg: '#F1F5F9',
    color: '#94A3B8',
    borderColor: '#CBD5E1',
    classNames: 'bg-slate-100 text-slate-400 border-slate-200',
    dotClass: 'bg-slate-100 border border-slate-200',
  },
};

// Poll choices and statuses
export const POLL_OPTIONS = {
  COLLEGE: 'COLLEGE',
  RESTAURANT: 'RESTAURANT',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  PENDING: 'PENDING',
};

// UI Variant tokens for buttons, badges, and cards
export const UI_VARIANTS = {
  buttons: {
    primary: 'bg-brand-orange hover:bg-[#e67e00] text-white border-2 border-brand-orange font-bold shadow-brand active:scale-[0.98]',
    yellow: 'bg-brand-yellow hover:bg-[#f5ce2e] text-brand-darkGreen border-2 border-brand-orange font-extrabold shadow-brand active:scale-[0.98]',
    green: 'bg-brand-darkGreen hover:bg-brand-green text-brand-yellow border-2 border-brand-green font-bold shadow-brand-green active:scale-[0.98]',
    outline: 'bg-brand-card hover:bg-white text-brand-darkGreen border-2 border-brand-orange font-bold shadow-sm',
    ghost: 'bg-transparent hover:bg-brand-yellow/20 text-brand-darkGreen font-semibold',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700 shadow-sm active:scale-[0.98]',
  },
  badges: {
    brand: 'bg-brand-yellow text-brand-darkGreen border border-brand-orange',
    success: 'bg-[#E8F5E9] text-brand-darkGreen border border-brand-greenLight',
    warning: 'bg-[#FFF3E0] text-brand-orange border border-brand-orangeLight',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
  },
  cards: {
    default: 'bg-brand-card rounded-brand border-2.5 border-brand-orange shadow-brand p-5',
    green: 'bg-brand-darkGreen text-brand-creamLight rounded-brand border-2.5 border-brand-orange shadow-brand p-5',
    subtle: 'bg-brand-creamLight rounded-brand-sm border border-brand-orange/40 shadow-subtle p-4',
  }
};
