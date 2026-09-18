export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SITE_NAME = 'EdutradeFX';

export const NAV_LINKS = [
  { label: 'Brokers', href: '/brokers' },
  { label: 'Account Managers', href: '/account-managers' },
  { label: 'Signal Providers', href: '/signal-providers' },
  { label: 'Courses', href: '/courses' },
  { label: 'Blog', href: '/blog' },
];

export const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Trader / Student',
  BROKER: 'Brokerage Firm',
  ACCOUNT_MANAGER: 'Account Manager',
  SIGNAL_PROVIDER: 'Signal Provider',
  TUTOR: 'Instructor / Tutor',
  ADMIN: 'Compliance Admin',
};
