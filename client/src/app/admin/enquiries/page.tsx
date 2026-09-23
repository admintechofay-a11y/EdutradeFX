'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([
    {
      _id: 'enq-1',
      name: 'Alexander Sterling',
      email: 'alex.sterling@hedgequant.com',
      phone: '+44 20 7946 0912',
      subject: 'broker_audit',
      message: 'We are a Cyprus-registered institutional CFD broker looking to initiate a comprehensive spread audit and listing on EduTradeFX.',
      status: 'new' as 'new' | 'in_progress' | 'resolved' | 'closed',
      createdAt: '2 hours ago',
    },
    {
      _id: 'enq-2',
      name: 'Clara Oswald',
      email: 'clara@globaltrader.de',
      phone: '+49 30 2312 994',
      subject: 'advertising',
      message: 'Requesting current media kit and CPM rates for desktop banner placements on your /brokers and /compare directory pages.',
      status: 'in_progress' as 'new' | 'in_progress' | 'resolved' | 'closed',
      createdAt: '1 day ago',
    },
    {
      _id: 'enq-3',
      name: 'Dr. Marcus Vance',
      email: 'marcus@algotrade.io',
      phone: '+1 555 319 8812',
      subject: 'academy',
      message: 'I have developed a 6-hour institutional curriculum on high-frequency algorithmic liquidity detection and would like to apply as an academy tutor.',
      status: 'resolved' as 'new' | 'in_progress' | 'resolved' | 'closed',
      createdAt: '3 days ago',
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateStatus = (id: string, newStatus: 'new' | 'in_progress' | 'resolved' | 'closed') => {
    setEnquiries(
      enquiries.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this inquiry?')) {
      setEnquiries(enquiries.filter((e) => e._id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Panel
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Contact Enquiries & Inbound Leads</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review inquiries submitted through the public contact form, audit requests, and advertising leads.
          </p>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-surface/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Sender Info</th>
                <th className="p-4">Inquiry Category</th>
                <th className="p-4">Message Excerpt</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {enquiries.map((e) => (
                <React.Fragment key={e._id}>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <h4 className="font-bold text-white">{e.name}</h4>
                        <span className="text-[11px] text-slate-400 block">{e.email}</span>
                        {e.phone && <span className="text-[10px] text-slate-500">{e.phone}</span>}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="badge-regulation text-[10px] uppercase font-bold">
                        {e.subject.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="text-slate-300 line-clamp-1 leading-relaxed">
                        {e.message}
                      </p>
                    </td>

                    <td className="p-4 text-slate-400">{e.createdAt}</td>

                    <td className="p-4">
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e._id, ev.target.value as any)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border bg-brand-surface focus:outline-none ${
                          e.status === 'new'
                            ? 'border-amber-500/40 text-amber-400'
                            : e.status === 'in_progress'
                            ? 'border-cyan-500/40 text-cyan-400'
                            : e.status === 'resolved'
                            ? 'border-emerald-500/40 text-emerald-400'
                            : 'border-slate-700 text-slate-500'
                        }`}
                      >
                        <option value="new">NEW</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="resolved">RESOLVED</option>
                        <option value="closed">CLOSED</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpandedId(expandedId === e._id ? null : e._id)}
                          className="p-2 rounded-lg bg-brand-surface border border-slate-700 text-slate-300 hover:text-white"
                          title="View Message"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              expandedId === e._id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="p-2 rounded-lg bg-brand-surface border border-slate-700 text-rose-400 hover:border-rose-500/50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === e._id && (
                    <tr className="bg-brand-surface/30">
                      <td colSpan={6} className="p-6 space-y-3">
                        <div className="rounded-2xl bg-brand-card border border-slate-800 p-4 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                            Full Message Content:
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                            {e.message}
                          </p>
                          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                            <a
                              href={`mailto:${e.email}`}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 text-brand-darkest text-xs font-bold"
                            >
                              Reply via Email
                            </a>
                            {e.phone && (
                              <a
                                href={`tel:${e.phone}`}
                                className="px-3 py-1.5 rounded-lg bg-brand-surface border border-slate-700 text-slate-200 text-xs font-bold"
                              >
                                Call Contact
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
