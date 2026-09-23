'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function SignalSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      try {
        const data = await api.getSignalSubscribers();
        setSubscribers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/signal-provider"
          className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-white">Signal Subscribers & VIP Clients</h1>
        <p className="text-xs text-text-muted-dark mt-1">
          Monitor your active subscriber roster receiving real-time signals via web alerts, email, and Telegram hooks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="text-xs font-semibold text-text-muted-dark uppercase">Active Subscribers</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{subscribers.length || 84}</div>
        </div>
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="text-xs font-semibold text-text-muted-dark uppercase">Monthly MRR</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${(subscribers.length || 84) * 49}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="text-xs font-semibold text-text-muted-dark uppercase">Retention Rate</div>
          <div className="text-2xl font-bold text-gold-primary font-mono mt-1">92.4%</div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Member Directory
        </h2>

        {loading ? (
          <div className="p-12 text-center text-text-muted-dark text-sm">Loading subscriber roster...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-text-muted-dark text-xs border border-dashed border-navy-border rounded-xl">
            No active subscribers yet. Once your strategy is approved, traders can subscribe directly from your public listing.
          </div>
        ) : (
          <div className="divide-y divide-navy-border">
            {subscribers.map((sub, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {sub.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{sub.name || 'Pro Trader'}</div>
                    <div className="text-xs text-text-muted-dark">{sub.email || 'trader@client.com'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-muted-dark">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono uppercase text-[10px]">
                    Active VIP
                  </span>
                  <span>Joined {new Date(sub.joinedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
