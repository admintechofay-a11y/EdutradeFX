'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
  Search,
  ExternalLink,
} from 'lucide-react';
import { MOCK_MANAGERS } from '@/lib/mockData';

export default function AdminManagersPage() {
  const [managers, setManagers] = useState(MOCK_MANAGERS);

  const toggleVerification = (id: string) => {
    setManagers(
      managers.map((m) =>
        m._id === id ? { ...m, verified: !m.verified } : m
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Panel
      </Link>

      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          Provider Verifications
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Account Managers & Signal Providers Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review trader track record submissions, verify external audit feeds, and approve verified badges.
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-surface/50 text-slate-400 uppercase text-[10px]">
                <th className="p-4 font-bold">Provider</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Style</th>
                <th className="p-4 font-bold">Win Rate</th>
                <th className="p-4 font-bold">Monthly ROI</th>
                <th className="p-4 font-bold">Max DD</th>
                <th className="p-4 font-bold">Verification</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {managers.map((m) => (
                <tr key={m._id} className="hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-white block">{m.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{m.title}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="badge-regulation text-[10px]">{m.category}</span>
                  </td>
                  <td className="p-4 text-amber-400 font-semibold">{m.tradingStyle}</td>
                  <td className="p-4 font-extrabold text-emerald-400">{m.winRate}%</td>
                  <td className="p-4 font-bold text-amber-400">+{m.monthlyRoi}%</td>
                  <td className="p-4 font-bold text-slate-300">{m.maxDrawdown}%</td>
                  <td className="p-4">
                    {m.verified ? (
                      <span className="badge-green text-[10px] flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="badge-regulation text-[10px] text-slate-500">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleVerification(m._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          m.verified
                            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        }`}
                      >
                        {m.verified ? 'Revoke Badge' : 'Approve & Verify'}
                      </button>
                      <Link
                        href={`/managers/${m._id}`}
                        className="p-1.5 rounded-lg bg-brand-surface border border-slate-700 text-slate-400 hover:text-white"
                        title="View Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
