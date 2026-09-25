const isBrowser = typeof window !== 'undefined';
const isRemoteHost = isBrowser && !['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isRemoteHost ? '/api' : 'http://localhost:5000/api');
export const SITE_NAME = 'EdutradeFX';

export const NAV_LINKS = [
  { label: 'Brokers', href: '/brokers' },
  { label: 'Compare', href: '/compare' },
  { label: 'Account Managers', href: '/account-managers' },
  { label: 'Signals', href: '/signal-providers' },
  { label: 'Courses', href: '/courses' },
  { label: 'Complaint Box', href: '/complaint-box' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Trader / Student',
  BROKER: 'Brokerage Firm',
  ACCOUNT_MANAGER: 'Account Manager',
  SIGNAL_PROVIDER: 'Signal Provider',
  TUTOR: 'Instructor / Tutor',
  ADMIN: 'Compliance Admin',
};
