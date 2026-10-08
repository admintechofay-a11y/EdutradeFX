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
        <h1 className="text-2xl font-black text-navy flex items-center gap-2">
          <Users className="w-6 h-6 text-blue" />
          Investor & Subscriber Inquiries
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Direct messages and onboarding requests from retail traders and VIP signal subscribers.
        </p>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by name, email, or message keyword..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue min-h-[42px]"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-soft">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy">No Inquiries Found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Prospective subscribers and investors who message you through your signal provider profile will appear here.
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white border border-border hover:border-blue/30 rounded-3xl p-5 sm:p-6 shadow-soft hover:shadow-card transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue/10 text-blue font-bold flex items-center justify-center text-xs shrink-0">
                    {enq.name?.[0] || 'I'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-heading truncate">{enq.name}</h3>
                    <div className="text-[11px] text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <span className="flex items-center gap-1 font-mono break-all">
                        <Mail className="w-3 h-3 text-text-muted shrink-0" />
                        {enq.email}
                      </span>
                      {enq.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-text-muted shrink-0" />
                          {enq.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-text-muted font-mono flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3 h-3 shrink-0" />
                    {new Date(enq.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-tint/60 border border-border text-xs text-text-body leading-relaxed">
                {enq.message}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1">
                <a
                  href={`mailto:${enq.email}?subject=RE: Signal Subscription Inquiry`}
                  className="px-4 py-2 rounded-full bg-blue/10 hover:bg-blue/20 text-blue border border-blue/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition w-full sm:w-auto min-h-[40px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
                {enq.phone && (
                  <a
                    href={`tel:${enq.phone}`}
                    className="px-4 py-2 rounded-full bg-green/10 hover:bg-green/20 text-green border border-green/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition w-full sm:w-auto min-h-[40px]"
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
