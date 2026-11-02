import { Role } from '@prisma/client';

export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@1234!';

export interface DemoAccountConfig {
  key: string;
  role: Role;
  email: string;
  name: string;
  label: string;
  hint: string;
  badgeColor: string;
  caption: string;
  aliases?: string[];
}

export const DEMO_ACCOUNTS: DemoAccountConfig[] = [
  {
    key: 'admin',
    role: Role.ADMIN,
    email: 'admin@edutradefx.com',
    name: 'EdutradeFX Administrator',
    label: 'Admin',
    hint: 'admin',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    caption: 'Compliance moderation queue, user management, and provider approvals.',
  },
  {
    key: 'broker',
    role: Role.BROKER,
    email: 'broker@edutradefx.com',
    name: 'Pepperstone Markets Representative',
    label: 'Broker',
    hint: 'broker',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    caption: 'Broker profile, account groups, spreads, and trading regulations.',
    aliases: ['broker@pepperstone-demo.com'],
  },
  {
    key: 'accountmanager',
    role: Role.ACCOUNT_MANAGER,
    email: 'accountmanager@edutradefx.com',
    name: 'Apex Wealth Management Representative',
    label: 'Account Mgr',
    hint: 'accountmanager',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    caption: 'AUM management, investor allocations, strategies, and performance.',
    aliases: ['accountmanager@demo.com'],
  },
  {
    key: 'signals',
    role: Role.SIGNAL_PROVIDER,
    email: 'signals@edutradefx.com',
    name: 'Alpha Trades FX Representative',
    label: 'Signal Provider',
    hint: 'signals',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    caption: 'Live trade signals, win rates, strategy specs, and subscriber metrics.',
    aliases: ['signals@alphatrades.com'],
  },
  {
    key: 'solutions',
    role: Role.SERVICE_PROVIDER,
    email: 'solutions@edutradefx.com',
    name: 'Demo Solutions Representative',
    label: 'Solutions Provider',
    hint: 'solutions',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    caption: 'Explore company profile, 3 categories, products, enquiries and analytics.',
    aliases: ['provider@solutionsdemo.com'],
  },
  {
    key: 'tutor',
    role: Role.TUTOR,
    email: 'tutor@edutradefx.com',
    name: 'Senior FX Instructor',
    label: 'Tutor',
    hint: 'tutor',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    caption: 'Trading courses, curricula, enrolled students, and lesson content.',
  },
  {
    key: 'trader',
    role: Role.STUDENT,
    email: 'trader@edutradefx.com',
    name: 'Active Retail Trader',
    label: 'Trader',
    hint: 'trader',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    caption: 'Course progress, reviews, bookmarks, and saved broker comparisons.',
    aliases: ['student@edutradefx.com'],
  },
];

export const ALL_DEMO_EMAILS: Set<string> = new Set([
  ...DEMO_ACCOUNTS.map((a) => a.email.toLowerCase()),
  ...DEMO_ACCOUNTS.flatMap((a) => (a.aliases || []).map((x) => x.toLowerCase())),
  'solutions-pending@edutradefx.com',
]);

export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  return ALL_DEMO_EMAILS.has(email.trim().toLowerCase());
}

export function isDemoLoginEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DEMO_LOGIN_ENABLED === 'true';
  }
  return process.env.DEMO_LOGIN_ENABLED !== 'false';
}

export function isDemoAdminAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DEMO_ALLOW_ADMIN === 'true';
  }
  return true;
}

export function getPublicDemoAccounts() {
  if (!isDemoLoginEnabled()) {
    return { enabled: false, accounts: [] };
  }

  const allowAdmin = isDemoAdminAllowed();
  const filtered = DEMO_ACCOUNTS.filter((acc) => {
    if (acc.role === Role.ADMIN && !allowAdmin) return false;
    return true;
  }).map((acc) => ({
    key: acc.key,
    role: acc.role,
    label: acc.label,
    email: acc.email,
    hint: acc.hint,
    badgeColor: acc.badgeColor,
    caption: acc.caption,
  }));

  return {
    enabled: true,
    password: DEMO_PASSWORD,
    accounts: filtered,
  };
}

