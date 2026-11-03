'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Users,
  Radio,
  Cpu,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Lock,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Layers,
  ChevronRight,
} from 'lucide-react';
import PageContainer from '../../../components/ui/PageContainer';
import Button from '../../../components/ui/Button';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';

interface DemoRoleInfo {
  key: string;
  role: string;
  name: string;
  label: string;
  email: string;
  targetPath: string;
  badgeColor: string;
  accentBg: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  features: string[];
}

const DEMO_ROLES: DemoRoleInfo[] = [
  {
    key: 'admin',
    role: 'ADMIN',
    name: 'Compliance Administrator',
    label: 'Platform Admin',
    email: 'admin@edutradefx.com',
    targetPath: '/admin',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    accentBg: 'from-red-500/10 to-rose-500/10',
    icon: ShieldCheck,
    tagline: 'Platform Governance & Compliance Moderation',
    description:
      'Manage compliance audits, approve institutional brokers, review solutions provider applications, and moderate course curricula.',
    features: [
      'Solutions provider pending approval queue (solutions-pending@edutradefx.com)',
      'Broker firm compliance status & document verification',
      'Course video curriculum moderation & complaint desk resolution',
      'System audit logs & live platform status telemetry',
    ],
  },
  {
    key: 'solutions',
    role: 'SERVICE_PROVIDER',
    name: 'Demo Solutions Ltd (Provider)',
    label: 'Solutions Provider',
    email: 'solutions@edutradefx.com',
    targetPath: '/dashboard/service-provider',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentBg: 'from-indigo-500/10 to-blue-500/10',
    icon: Cpu,
    tagline: 'Enterprise FX Technology & Bridge Infrastructure',
    description:
      'Explore the provider portal for Demo Solutions Ltd with published software bridges, CRM modules, category answers, and B2B inquiries.',
    features: [
      'Verified corporate profile with 3 active categories (Bridge, CRM, Hosting)',
      '2 Approved products: Bridge Pro and Demo CRM Suite',
      '10-Category verification form builder with live validation',
      'B2B Quote inquiries desk, client reviews & compliance media',
    ],
  },
  {
    key: 'broker',
    role: 'BROKER',
    name: 'Pepperstone Markets Representative',
    label: 'Institutional Broker',
    email: 'broker@edutradefx.com',
    targetPath: '/dashboard/broker',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentBg: 'from-blue-500/10 to-cyan-500/10',
    icon: Building2,
    tagline: 'Broker Corporate Command Center',
    description:
      'Manage institutional trading disclosures, account spreads, tier-1 regulatory filings, and investor leads.',
    features: [
      'Corporate broker command center & spread schedules',
      'Tier-1 regulatory compliance badges (FCA, ASIC, CySEC)',
      'Direct trader inquiry & lead management pipeline',
      'Client review responses & profile settings',
    ],
  },
  {
    key: 'accountmanager',
    role: 'ACCOUNT_MANAGER',
    name: 'Apex Wealth Management Representative',
    label: 'PAMM / MAM Manager',
    email: 'accountmanager@edutradefx.com',
    targetPath: '/dashboard/account-manager',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentBg: 'from-purple-500/10 to-fuchsia-500/10',
    icon: Users,
    tagline: 'Institutional AUM & Strategy Performance Hub',
    description:
      'Review verified trading track records, investor allocations, strategy risk profiles, and investor inquiry funnels.',
    features: [
      'Audited PAMM/MAM performance metrics & maximum drawdown',
      'Trading style parameters & minimum deposit thresholds',
      'Investor allocation inquiry pipeline',
      'Direct KYC & strategy disclosure management',
    ],
  },
  {
    key: 'signals',
    role: 'SIGNAL_PROVIDER',
    name: 'Alpha Trades FX Representative',
    label: 'Signal Provider',
    email: 'signals@edutradefx.com',
    targetPath: '/dashboard/signal-provider',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentBg: 'from-amber-500/10 to-orange-500/10',
    icon: Radio,
    tagline: 'Live Trade Signals & Quantitative Performance',
    description:
      'Manage live trading signals, subscription tiers, published win rates, and subscriber inquiry channels.',
    features: [
      'Live trade signal dispatch (Take Profit, Stop Loss, Risk ratios)',
      'Verified 78.4% historical win rate metrics & instrument coverage',
      'Subscription channel tiers (VIP, Swing, Scalping)',
      'Subscriber inquiry & broadcast management',
    ],
  },
  {
    key: 'tutor',
    role: 'TUTOR',
    name: 'Senior FX Academy Instructor',
    label: 'Course Instructor',
    email: 'tutor@edutradefx.com',
    targetPath: '/dashboard/tutor',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    accentBg: 'from-teal-500/10 to-emerald-500/10',
    icon: GraduationCap,
    tagline: 'Academy Studio & Revenue Hub',
    description:
      'Author interactive forex video curricula, organize modules, review enrolled students, and track net sales payouts.',
    features: [
      'Forex video course authoring studio & curriculum manager',
      'Student enrollments & completion progress analytics',
      'Course pricing, net revenue calculation & withdrawal requests',
      'Interactive quiz authoring & student reviews',
    ],
  },
  {
    key: 'trader',
    role: 'STUDENT',
    name: 'Active Retail Trader',
    label: 'Trader / Student',
    email: 'trader@edutradefx.com',
    targetPath: '/dashboard',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentBg: 'from-emerald-500/10 to-green-500/10',
    icon: TrendingUp,
    tagline: 'Trader Learning & Portfolio Center',
    description:
      'Access enrolled trading courses, inspect saved broker side-by-side comparisons, review bookmarks, and track progress.',
    features: [
      'Distraction-free academy learning room with video progress tracking',
      'Saved broker comparisons & regulatory bookmarks',
      'Course completion certificates & dispute inquiries history',
      'Direct account settings & verified reviews',
    ],
  },
];

export default function DemoShowcasePage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoPassword = 'Demo@1234!';

  const handleLaunchDemo = async (roleInfo: DemoRoleInfo) => {
    setLoadingKey(roleInfo.key);
    setErrorMessage(null);

    try {
      const res = await api.post('/auth/login', {
        identifier: roleInfo.email,
        password: demoPassword,
      });

      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      router.push(roleInfo.targetPath);
    } catch (err: any) {
      console.error('Demo login error:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to sign in to demo account. Please verify backend connection or use manual quick-fill on /login.'
      );
      setLoadingKey(null);
    }
  };

  const handleCopyCredentials = (email: string, key: string) => {
    navigator.clipboard.writeText(`${email}\n${demoPassword}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <PageContainer>
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EduTradeFX Live Demo Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Explore All 7 Platform Personas in 1 Click
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Test drive every role in the EduTradeFX institutional ecosystem with fully seeded real data,
            verified directories, live dashboards, and review queues. No manual registration needed.
          </p>

          {/* Credentials quick pill */}
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs text-xs">
            <span className="font-semibold text-slate-500">Universal Demo Password:</span>
            <code className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Demo@1234!
            </code>
            <Link
              href="/login"
              className="text-blue-600 font-bold hover:text-blue-800 transition inline-flex items-center gap-1 ml-2"
            >
              <span>Go to Login</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold">Login Notice</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
              <Link href="/login" className="text-xs font-bold underline mt-1 inline-block">
                Open Standard Login Page →
              </Link>
            </div>
          </div>
        )}

        {/* Demo Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_ROLES.map((role) => {
            const IconComponent = role.icon;
            const isLoading = loadingKey === role.key;
            const isCopied = copiedKey === role.key;

            return (
              <div
                key={role.key}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon & Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>

                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${role.badgeColor}`}
                    >
                      {role.label}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {role.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {role.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      What you can test:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {role.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                    <span className="font-mono truncate">{role.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(role.email, role.key)}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 shrink-0 ml-2"
                      title="Copy email and password"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLaunchDemo(role)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Launching Dashboard...</span>
                      </>
                    ) : (
                      <>
                        <span>1-Click Launch Dashboard</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="mt-12 text-center p-6 bg-white border border-slate-200 rounded-3xl max-w-2xl mx-auto space-y-2">
          <h4 className="text-sm font-bold text-slate-800">Need to reset demo changes?</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All demo users are isolated from real clients. Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">npm run demo:reset</code> in the backend to restore all 7 demo accounts to fresh defaults at any time.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
