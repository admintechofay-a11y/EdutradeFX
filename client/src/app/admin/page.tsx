'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  GraduationCap,
  AlertTriangle,
  Users,
  Briefcase,
  Radio,
  Mail,
  Settings,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  MOCK_BROKERS,
  MOCK_ACCOUNT_MANAGERS,
  MOCK_SIGNAL_PROVIDERS,
  MOCK_COURSES,
  MOCK_COMPLAINTS,
} from '@/lib/mockData';
import StatCard from '@/components/shared/StatCard';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = React.useState<any>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await api.getAdminStats();
        if (isMounted && res) {
          setStatsData(res);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: 'Total Brokers',
      value: statsData?.brokers?.total ?? MOCK_BROKERS.length,
      icon: Scale,
      accentColor: '#C9A84C',
      trend: { value: '+8%', isPositive: true },
      subtitle: '↑ 2 audited this month',
      href: '/admin/brokers',
    },
    {
      label: 'Account Managers',
      value: statsData?.accountManagers?.total ?? MOCK_ACCOUNT_MANAGERS.length,
      icon: Briefcase,
      accentColor: '#0D9488',
      trend: { value: '+14%', isPositive: true },
      subtitle: 'Audited PAMM portfolios',
      href: '/admin/account-managers',
    },
    {
      label: 'Signal Providers',
      value: statsData?.signalProviders?.total ?? MOCK_SIGNAL_PROVIDERS.length,
      icon: Radio,
      accentColor: '#0284C7',
      trend: { value: '+5%', isPositive: true },
      subtitle: 'Live verified signal feeds',
      href: '/admin/signal-providers',
    },
    {
      label: 'LMS Courses',
      value: statsData?.courses?.total ?? MOCK_COURSES.length,
      icon: GraduationCap,
      accentColor: '#7C3AED',
      trend: { value: '+25%', isPositive: true },
      subtitle: 'Academy curriculum modules',
      href: '/admin/courses',
    },
    {
      label: 'Tutor Accounts',
      value: statsData?.users?.tutors ?? 3,
      icon: Users,
      accentColor: '#4F46E5',
      subtitle: 'Certified faculty members',
      href: '/admin/tutors',
    },
    {
      label: 'Dispute Cases',
      value: statsData?.complaints?.total ?? MOCK_COMPLAINTS.length,
      icon: AlertTriangle,
      accentColor: '#DC2626',
      trend: { value: '-4%', isPositive: false },
      subtitle: 'Active mediation claims',
      href: '/admin/complaints',
    },
    {
      label: 'Contact Enquiries',
      value: 12,
      icon: Mail,
      accentColor: '#D97706',
      subtitle: 'Unread partner inquiries',
      href: '/admin/enquiries',
    },
    {
      label: 'Platform Users',
      value: statsData?.users?.total ? statsData.users.total.toLocaleString() : '1,450',
      icon: Users,
      accentColor: '#0D9488',
      trend: { value: '+18%', isPositive: true },
      subtitle: 'Registered retail traders',
      href: '/admin/users',
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Stats Grid using Admin StatCard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[18px] font-bold text-text-primary">
            Platform Metrics Overview
          </h2>
          <div className="flex items-center gap-2">
            <Link href="/admin/brokers">
              <button
                type="button"
                className="h-[36px] px-4 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Broker
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="block transition-transform hover:-translate-y-0.5">
              <StatCard
                title={s.label}
                value={s.value}
                icon={s.icon}
                accentColor={s.accentColor}
                trend={s.trend}
                subtitle={s.subtitle}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Disputes & Complaints Data Table (Matching Admin Data Table Spec) */}
      <div className="bg-white rounded-md shadow-card border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="font-sans text-[16px] font-bold text-text-primary">
              Recent Dispute Dockets
            </h3>
            <p className="font-sans text-[13px] text-text-secondary mt-0.5">
              Latest mediation claims logged against brokers awaiting compliance officer action.
            </p>
          </div>
          <Link
            href="/admin/complaints"
            className="text-[13px] font-bold text-gold-primary hover:underline flex items-center gap-1"
          >
            View All Disputes
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header row: bg #F8FAFC, Inter 12px weight 600 --color-text-secondary uppercase tracking-wide */}
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Docket ID
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Complainant
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Broker / Entity
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Category
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Data rows: Inter 14px --color-text-primary, height 52px, Row hover: bg #FAFAFA */}
            <tbody className="divide-y divide-[#E2E8F0] font-sans text-[14px] text-text-primary">
              {[
                { id: 'ETF-2026-8941', name: 'Marcus S.', broker: 'ApexFX Global', cat: 'Withdrawal Delay', amount: '$12,400', status: 'pending' },
                { id: 'ETF-2026-7732', name: 'Sarah L.', broker: 'NovaMarkets', cat: 'Slippage Spike', amount: '$3,850', status: 'reviewing' },
                { id: 'ETF-2026-6519', name: 'Tariq A.', broker: 'VanguardFX', cat: 'Account Freeze', amount: '$24,000', status: 'resolved' },
                { id: 'ETF-2026-5104', name: 'Elena V.', broker: 'PrimeTrade Ltd', cat: 'Bonus Trapping', amount: '$1,500', status: 'closed' },
              ].map((row) => (
                <tr key={row.id} className="h-[52px] hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 font-mono text-[13px] font-bold text-text-primary">
                    {row.id}
                  </td>
                  <td className="px-5 font-medium">{row.name}</td>
                  <td className="px-5 font-semibold text-text-primary">{row.broker}</td>
                  <td className="px-5 text-text-secondary">{row.cat}</td>
                  <td className="px-5 font-bold text-text-primary">{row.amount}</td>
                  <td className="px-5">
                    {row.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                        Pending
                      </span>
                    )}
                    {row.status === 'reviewing' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                        Reviewing
                      </span>
                    )}
                    {row.status === 'resolved' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                        Resolved
                      </span>
                    )}
                    {row.status === 'closed' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                        Closed
                      </span>
                    )}
                  </td>
                  {/* Actions column: icon buttons (edit ✏️, delete 🗑️, view 👁️) */}
                  <td className="px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-[#F1F5F9] transition-colors"
                        title="View Docket"
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded text-text-secondary hover:text-gold-primary hover:bg-[#F1F5F9] transition-colors"
                        title="Edit Docket"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded text-text-secondary hover:text-danger hover:bg-[#FEE2E2] transition-colors"
                        title="Archive Docket"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination at bottom right: prev/next + page numbers */}
        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="font-sans text-[13px] text-text-secondary">
            Showing 1-4 of 18 dispute dockets
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="h-[32px] px-2.5 rounded border border-[#E2E8F0] bg-white text-[12px] font-medium text-text-secondary hover:text-text-primary disabled:opacity-40"
              disabled
            >
              Prev
            </button>
            <button
              type="button"
              className="h-[32px] w-[32px] rounded bg-gold-primary text-navy-deepest text-[12px] font-bold"
            >
              1
            </button>
            <button
              type="button"
              className="h-[32px] w-[32px] rounded border border-[#E2E8F0] bg-white text-text-primary hover:bg-[#F8FAFC] text-[12px] font-medium"
            >
              2
            </button>
            <button
              type="button"
              className="h-[32px] px-2.5 rounded border border-[#E2E8F0] bg-white text-[12px] font-medium text-text-secondary hover:text-text-primary"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panel */}
      <div className="rounded-md bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-card">
        <h2 className="font-sans text-[18px] font-bold text-text-primary">
          Administrative Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <Link
            href="/admin/brokers"
            className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-gold-primary/50 transition-colors flex items-center justify-between"
          >
            <div>
              <strong className="block text-text-primary font-bold text-[14px] mb-0.5">Brokers Management</strong>
              <span className="text-text-secondary text-[12px]">Add, edit, feature, and audit broker listings</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>

          <Link
            href="/admin/account-managers"
            className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-gold-primary/50 transition-colors flex items-center justify-between"
          >
            <div>
              <strong className="block text-text-primary font-bold text-[14px] mb-0.5">Account Managers</strong>
              <span className="text-text-secondary text-[12px]">Manage PAMM/MAM manager profiles</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>

          <Link
            href="/admin/signal-providers"
            className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-gold-primary/50 transition-colors flex items-center justify-between"
          >
            <div>
              <strong className="block text-text-primary font-bold text-[14px] mb-0.5">Signal Providers</strong>
              <span className="text-text-secondary text-[12px]">Manage signal feeds and telegram channels</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>

          <Link
            href="/admin/courses"
            className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-gold-primary/50 transition-colors flex items-center justify-between"
          >
            <div>
              <strong className="block text-text-primary font-bold text-[14px] mb-0.5">Academy Courses</strong>
              <span className="text-text-secondary text-[12px]">Review all LMS curriculum & lessons</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>

          <Link
            href="/admin/tutors"
            className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-gold-primary/50 transition-colors flex items-center justify-between"
          >
            <div>
              <strong className="block text-text-primary font-bold text-[14px] mb-0.5">Tutor Accounts</strong>
              <span className="text-text-secondary text-[12px]">Manage instructor roles and verification</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>

          <Link
            href="/admin/complaints"
            className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] hover:border-danger/50 transition-colors flex items-center justify-between"
          >
            <div>
              <strong className="block text-text-primary font-bold text-[14px] mb-0.5">Mediation Desk</strong>
              <span className="text-text-secondary text-[12px]">Manage dispute status & internal compliance notes</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
