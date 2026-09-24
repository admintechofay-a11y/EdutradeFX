'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Check, X, Clock, Trash2, MessageSquare, AlertCircle, Phone, Tag } from 'lucide-react';
import { api } from '../../../lib/api';
import type { ContactEnquiry, ContactEnquiryStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact');
      setEnquiries(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, status: ContactEnquiryStatus, notes?: string) => {
    try {
      await api.patch(`/contact/${id}`, { status, adminNotes: notes !== undefined ? notes : adminNotes });
      setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status, adminNotes: notes ?? e.adminNotes } : e)));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status, adminNotes: notes ?? selectedEnquiry.adminNotes });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setEnquiries(enquiries.filter((e) => e.id !== id));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.subject?.toLowerCase().includes(search.toLowerCase()) ||
      e.message?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Contact & Advertising Enquiries</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review incoming general communications, advertising proposals, partnership inquiries, and academy applications.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Total Inquiries: <span className="text-white font-mono">{enquiries.length}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender, email, subject, or message body..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Response</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved / Contacted</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Table (Left 8 cols) + Detail Drawer (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`${selectedEnquiry ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {loading ? (
            <Skeleton className="h-96 rounded-3xl" />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 text-xs uppercase font-bold">
                    <th className="p-4">Sender Info</th>
                    <th className="p-4">Category & Subject</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filtered.length > 0 ? (
                    filtered.map((enq) => (
                      <tr
                        key={enq.id}
                        onClick={() => {
                          setSelectedEnquiry(enq);
                          setAdminNotes(enq.adminNotes || '');
                        }}
                        className={`cursor-pointer transition ${
                          selectedEnquiry?.id === enq.id ? 'bg-brand-blue/10' : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-bold text-white">{enq.name}</div>
                          <div className="text-slate-400 text-xs">{enq.email}</div>
                          {enq.phone && <div className="text-[11px] text-slate-500">{enq.phone}</div>}
                        </td>
                        <td className="p-4 max-w-xs">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-brand-blue font-bold border border-slate-700">
                            {enq.category}
                          </span>
                          <div className="text-slate-200 font-medium truncate mt-1">{enq.subject}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              enq.status === 'RESOLVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : enq.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : enq.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {new Date(enq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEnquiry(enq.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                        No contact inquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedEnquiry && (
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue" />
                <span>Inquiry Details</span>
              </h3>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Sender: </span>
                <strong className="text-white">{selectedEnquiry.name}</strong> ({selectedEnquiry.email})
              </div>
              {selectedEnquiry.phone && (
                <div>
                  <span className="text-slate-400">Phone: </span>
                  <strong className="text-white font-mono">{selectedEnquiry.phone}</strong>
                </div>
              )}
              <div>
                <span className="text-slate-400">Category: </span>
                <span className="font-bold text-brand-blue">{selectedEnquiry.category}</span>
              </div>
              <div>
                <span className="text-slate-400">Subject: </span>
                <span className="text-white font-semibold">{selectedEnquiry.subject}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedEnquiry.message}
            </div>

            {/* Status Update & Notes */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Compliance & Admin Notes:
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log follow-up communication, call notes, or media kit dispatch details..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-blue"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(selectedEnquiry.id, 'IN_PROGRESS', adminNotes)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => updateStatus(selectedEnquiry.id, 'RESOLVED', adminNotes)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateStatus(selectedEnquiry.id, 'CLOSED', adminNotes)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Close Inquiry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
