'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Phone,
  Clock,
  Search,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function SignalProviderEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadEnquiries() {
      try {
        const res = await api.get('/signal-providers/my/enquiries');
        if (res.data?.success) {
          setEnquiries(res.data.data?.enquiries || res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load enquiries', err);
      } finally {
        setLoading(false);
      }
    }
    loadEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-blue" />
          Investor & Subscriber Inquiries
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct messages and onboarding requests from retail traders and VIP signal subscribers.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-brand-navy-card border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by name, email, or message keyword..."
            className="w-full pl-10 pr-4 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-3xl bg-slate-800/40" />
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Inquiries Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Prospective subscribers and investors who message you through your signal provider profile will appear here.
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-brand-navy-card border border-slate-800 hover:border-slate-750 rounded-3xl p-5 shadow-xl transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/20 text-brand-blue font-bold flex items-center justify-center text-xs">
                    {enq.name?.[0] || 'I'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{enq.name}</h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {enq.email}
                      </span>
                      {enq.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {enq.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(enq.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-navy-light/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                {enq.message}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <a
                  href={`mailto:${enq.email}?subject=RE: Signal Subscription Inquiry`}
                  className="px-3 py-1.5 rounded-xl bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
                {enq.phone && (
                  <a
                    href={`tel:${enq.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Trader</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
