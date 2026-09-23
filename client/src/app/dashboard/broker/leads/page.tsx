'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Mail, Phone, Calendar, Send, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function BrokerLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await api.getBrokerLeads();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const handleSendReply = async (leadId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.replyBrokerLead(leadId, replyText);
      if (res.success) {
        setSuccessMsg('Reply recorded and queued for transmission to trader.');
        setLeads((prev) =>
          prev.map((l) =>
            l._id === leadId
              ? { ...l, status: 'responded', reply: { message: replyText, repliedAt: new Date() } }
              : l
          )
        );
        setReplyingId(null);
        setReplyText('');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/broker"
          className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-white">Inbound Trader Leads & Enquiries</h1>
        <p className="text-xs text-text-muted-dark mt-1">
          Respond directly to qualified retail and institutional traders interested in opening live accounts with your brokerage.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-text-muted-dark text-sm">
          Loading inbound enquiries...
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center bg-navy-surface border border-navy-border rounded-2xl space-y-3">
          <MessageSquare className="w-10 h-10 text-text-muted-dark mx-auto" />
          <h3 className="font-bold text-sm text-white">No New Enquiries</h3>
          <p className="text-xs text-text-muted-dark max-w-sm mx-auto">
            Once your brokerage profile is approved by compliance, traders on EduTradeFX will be able to initiate direct inquiries here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead._id}
              className="p-5 rounded-2xl bg-navy-surface border border-navy-border space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-border pb-3">
                <div>
                  <div className="font-bold text-sm text-white">{lead.name}</div>
                  <div className="text-xs text-text-muted-dark flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gold-primary" />
                      {lead.email}
                    </span>
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-400" />
                        {lead.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      lead.status === 'responded'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {lead.status || 'New'}
                  </span>
                  <span className="text-[11px] text-text-muted-dark flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-navy-deepest p-3 rounded-lg border border-navy-border/60">
                "{lead.message}"
              </div>

              {lead.reply ? (
                <div className="p-3 rounded-lg bg-gold-primary/5 border border-gold-primary/20 text-xs">
                  <div className="text-[10px] uppercase font-bold text-gold-primary tracking-wider mb-1">
                    Your Official Response
                  </div>
                  <p className="text-slate-300">{lead.reply.message}</p>
                </div>
              ) : replyingId === lead._id ? (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your official response to this trader..."
                    className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-white focus:outline-none focus:border-gold-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 rounded-md text-xs text-text-muted-dark hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReply(lead._id)}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-gold-primary text-navy-deepest font-bold text-xs hover:bg-gold-light transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submitting ? 'Sending...' : 'Send Response'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setReplyingId(lead._id);
                      setReplyText('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-navy-deepest border border-navy-border text-xs text-gold-primary hover:border-gold-primary/50 transition-colors"
                  >
                    Reply to Trader
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
