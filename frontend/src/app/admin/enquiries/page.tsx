'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Search,
  Check,
  X,
  Clock,
  Trash2,
  MessageSquare,
  AlertCircle,
  Phone,
  Tag,
  Building2,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../lib/api';
import type { ContactEnquiry, ContactEnquiryStatus } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

interface BrokerLeadRecord {
  id: string;
  brokerId: string;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  experience?: string | null;
  depositBudget?: string | null;
  message?: string | null;
  isRead: boolean;
  createdAt: string;
  broker?: {
    id: string;
    companyName: string;
    slug: string;
    logo?: string | null;
  } | null;
}

export default function AdminEnquiriesPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'broker-leads'>('general');

  // General Enquiries State
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Broker Inquiries State
  const [brokerLeads, setBrokerLeads] = useState<BrokerLeadRecord[]>([]);
  const [brokerLeadsLoading, setBrokerLeadsLoading] = useState(false);
  const [brokerLeadsTotal, setBrokerLeadsTotal] = useState(0);
  const [brokerLeadsPage, setBrokerLeadsPage] = useState(1);
  const [brokerLeadsTotalPages, setBrokerLeadsTotalPages] = useState(1);
  const [brokerSearch, setBrokerSearch] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedBrokerLead, setSelectedBrokerLead] = useState<BrokerLeadRecord | null>(null);

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

  const fetchBrokerLeads = async () => {
    setBrokerLeadsLoading(true);
    try {
      const params = new URLSearchParams({
        page: brokerLeadsPage.toString(),
        limit: '20',
        ...(brokerSearch && { search: brokerSearch }),
        ...(isReadFilter !== 'ALL' && { isRead: isReadFilter }),
        ...(startDateFilter && { startDate: startDateFilter }),
        ...(endDateFilter && { endDate: endDateFilter }),
      });
      const res = await api.get(`/admin/broker-leads?${params.toString()}`);
      const data = res.data?.data;
      if (data) {
        setBrokerLeads(data.leads || []);
        setBrokerLeadsTotal(data.total || 0);
        setBrokerLeadsTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load broker leads', err);
    } finally {
      setBrokerLeadsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    if (activeTab === 'broker-leads') {
      fetchBrokerLeads();
    }
  }, [activeTab, brokerLeadsPage, isReadFilter, startDateFilter, endDateFilter]);

  const updateStatus = async (id: string, status: ContactEnquiryStatus, notes?: string) => {
    try {
      await api.patch(`/contact/${id}`, { status, adminNotes: notes !== undefined ? notes : adminNotes });
      setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status, adminNotes: notes ?? e.adminNotes } : e)));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status, adminNotes: notes ?? selectedEnquiry.adminNotes });
      }
      toast.success('Inquiry status updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setEnquiries(enquiries.filter((e) => e.id !== id));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      toast.success('Inquiry deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const markLeadAsRead = async (id: string) => {
    try {
      await api.patch(`/admin/broker-leads/${id}/read`);
      setBrokerLeads((prev) => prev.map((l) => (l.id === id ? { ...l, isRead: true } : l)));
      if (selectedBrokerLead?.id === id) {
        setSelectedBrokerLead({ ...selectedBrokerLead, isRead: true });
      }
      toast.success('Lead marked as read');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broker lead record?')) return;
    try {
      await api.delete(`/admin/broker-leads/${id}`);
      setBrokerLeads((prev) => prev.filter((l) => l.id !== id));
      setBrokerLeadsTotal((prev) => Math.max(0, prev - 1));
      if (selectedBrokerLead?.id === id) setSelectedBrokerLead(null);
      toast.success('Broker lead deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete broker lead');
    }
  };

  const exportBrokerLeadsCSV = () => {
    if (brokerLeads.length === 0) return;
    const headers = ['Trader Name', 'Email', 'Phone', 'Country', 'Deposit Budget', 'Experience', 'Target Broker', 'Status', 'Date'];
    const rows = brokerLeads.map((l) => [
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.country || ''}"`,
      `"${l.depositBudget || ''}"`,
      `"${l.experience || ''}"`,
      `"${l.broker?.companyName || 'Unknown'}"`,
      `"${l.isRead ? 'Read' : 'Unread'}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `broker_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.subject?.toLowerCase().includes(search.toLowerCase()) ||
      e.message?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">Communications & Inquiries</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review general website contact submissions, partner advertising, and institutional broker inquiries.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 text-xs font-bold transition relative ${
            activeTab === 'general' ? 'text-blue' : 'text-text-muted hover:text-navy'
          }`}
        >
          Contact & Advertising ({enquiries.length})
          {activeTab === 'general' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('broker-leads')}
          className={`pb-3 px-4 text-xs font-bold transition relative ${
            activeTab === 'broker-leads' ? 'text-blue' : 'text-text-muted hover:text-navy'
          }`}
        >
          Broker Trader Leads ({brokerLeadsTotal})
          {activeTab === 'broker-leads' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full" />
          )}
        </button>
      </div>

      {/* ── TAB 1: GENERAL & ADVERTISING ─────────────────────── */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-3xl bg-white border border-border shadow-soft">
            <div className="sm:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by sender, email, subject, or message body..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue transition"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue transition bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Response</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved / Contacted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Main Grid: Table (Left) + Detail Drawer (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`${selectedEnquiry ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              {loading ? (
                <Skeleton className="h-96 rounded-3xl bg-border/40" />
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
                  <table className="w-full min-w-[600px] text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                        <th className="p-4">Sender Info</th>
                        <th className="p-4">Category & Subject</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEnquiries.length > 0 ? (
                        filteredEnquiries.map((enq) => (
                          <tr
                            key={enq.id}
                            onClick={() => {
                              setSelectedEnquiry(enq);
                              setAdminNotes(enq.adminNotes || '');
                            }}
                            className={`cursor-pointer transition ${
                              selectedEnquiry?.id === enq.id ? 'bg-blue/10' : 'hover:bg-surface-tint/60'
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-bold text-navy">{enq.name}</div>
                              <div className="text-text-muted text-xs">{enq.email}</div>
                              {enq.phone && <div className="text-[11px] text-text-muted">{enq.phone}</div>}
                            </td>
                            <td className="p-4 max-w-xs">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue/10 text-blue font-bold border border-blue/20">
                                {enq.category}
                              </span>
                              <div className="text-text-heading font-medium truncate mt-1">{enq.subject}</div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  enq.status === 'RESOLVED'
                                    ? 'bg-green/10 text-green border border-green/20'
                                    : enq.status === 'IN_PROGRESS'
                                    ? 'bg-blue/10 text-blue border border-blue/20'
                                    : enq.status === 'PENDING'
                                    ? 'bg-orange/10 text-orange border border-orange/20'
                                    : 'bg-surface-tint text-text-muted border border-border'
                                }`}
                              >
                                {enq.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-text-muted">
                              {new Date(enq.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEnquiry(enq.id);
                                }}
                                className="p-1.5 rounded-full bg-surface-tint border border-border text-text-muted hover:text-red-500 transition"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-text-muted text-xs">
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
              <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-border space-y-4 shadow-soft">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue" />
                    <span>Inquiry Details</span>
                  </h3>
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="text-text-muted hover:text-navy text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-text-muted">Sender: </span>
                    <strong className="text-navy">{selectedEnquiry.name}</strong> ({selectedEnquiry.email})
                  </div>
                  {selectedEnquiry.phone && (
                    <div>
                      <span className="text-text-muted">Phone: </span>
                      <strong className="text-navy font-mono">{selectedEnquiry.phone}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-text-muted">Category: </span>
                    <span className="font-bold text-blue">{selectedEnquiry.category}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Subject: </span>
                    <span className="text-text-heading font-semibold">{selectedEnquiry.subject}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs text-text-body whitespace-pre-wrap leading-relaxed">
                  {selectedEnquiry.message}
                </div>

                {/* Status Update & Notes */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-text-heading">
                    Compliance & Admin Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Log follow-up communication, call notes, or media kit dispatch details..."
                    className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(selectedEnquiry.id, 'IN_PROGRESS', adminNotes)}
                      className="px-3.5 py-1.5 rounded-full bg-blue/10 text-blue border border-blue/20 text-xs font-semibold hover:bg-blue/20 transition"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(selectedEnquiry.id, 'RESOLVED', adminNotes)}
                      className="px-3.5 py-1.5 rounded-full bg-green/10 text-green border border-green/20 text-xs font-semibold hover:bg-green/20 transition"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => updateStatus(selectedEnquiry.id, 'CLOSED', adminNotes)}
                      className="px-3.5 py-1.5 rounded-full bg-surface-tint text-text-body border border-border text-xs font-semibold hover:bg-border/60 transition"
                    >
                      Close Inquiry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: BROKER INQUIRIES & LEADS ──────────────────── */}
      {activeTab === 'broker-leads' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-3xl bg-white border border-border shadow-soft space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={brokerSearch}
                  onChange={(e) => setBrokerSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchBrokerLeads()}
                  placeholder="Search by trader name, email, phone, or broker..."
                  className="w-full pl-10 pr-4 py-2 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={isReadFilter}
                  onChange={(e) => setIsReadFilter(e.target.value)}
                  className="px-3 py-2 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue bg-white"
                >
                  <option value="ALL">All Read/Unread</option>
                  <option value="false">Unread Only</option>
                  <option value="true">Read Only</option>
                </select>

                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="px-2.5 py-2 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  title="From date"
                />

                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="px-2.5 py-2 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue"
                  title="To date"
                />

                <button
                  onClick={fetchBrokerLeads}
                  className="px-4 py-2 bg-blue hover:bg-blue-hover text-white text-xs font-bold rounded-xl transition"
                >
                  Filter
                </button>

                <button
                  onClick={exportBrokerLeadsCSV}
                  disabled={brokerLeads.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border hover:bg-surface-tint text-navy text-xs font-bold rounded-xl transition disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Broker Leads Table + Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`${selectedBrokerLead ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              {brokerLeadsLoading ? (
                <Skeleton className="h-96 rounded-3xl bg-border/40" />
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
                  <table className="w-full min-w-[640px] text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                        <th className="p-4">Trader Info</th>
                        <th className="p-4">Target Broker</th>
                        <th className="p-4">Deposit / Level</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {brokerLeads.length > 0 ? (
                        brokerLeads.map((lead) => (
                          <tr
                            key={lead.id}
                            onClick={() => setSelectedBrokerLead(lead)}
                            className={`cursor-pointer transition ${
                              selectedBrokerLead?.id === lead.id ? 'bg-blue/10' : 'hover:bg-surface-tint/60'
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-bold text-navy flex items-center gap-2">
                                <span>{lead.name}</span>
                                {!lead.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue shrink-0" title="Unread" />
                                )}
                              </div>
                              <div className="text-text-muted text-xs">{lead.email}</div>
                              {lead.phone && <div className="text-[11px] text-text-muted font-mono">{lead.phone}</div>}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-navy flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue" />
                                <span>{lead.broker?.companyName || 'Unknown Broker'}</span>
                              </div>
                              {lead.country && (
                                <div className="text-[11px] text-text-muted">Origin: {lead.country}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-orange text-xs block">
                                {lead.depositBudget || 'Standard'}
                              </span>
                              <span className="text-[10px] text-text-muted">{lead.experience || 'BEGINNER'}</span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  lead.isRead
                                    ? 'bg-surface-tint text-text-muted border border-border'
                                    : 'bg-blue/10 text-blue border border-blue/20'
                                }`}
                              >
                                {lead.isRead ? 'READ' : 'NEW'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-text-muted">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {!lead.isRead && (
                                  <button
                                    onClick={() => markLeadAsRead(lead.id)}
                                    className="p-1.5 rounded-full bg-surface-tint hover:bg-blue/10 text-blue transition"
                                    title="Mark as Read"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteLead(lead.id)}
                                  className="p-1.5 rounded-full bg-surface-tint hover:bg-red-50 text-text-muted hover:text-red-600 transition"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-text-muted text-xs">
                            No broker trader leads recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {brokerLeadsTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 text-xs">
                  <div className="text-text-muted">
                    Page {brokerLeadsPage} of {brokerLeadsTotalPages} ({brokerLeadsTotal} total leads)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrokerLeadsPage((p) => Math.max(1, p - 1))}
                      disabled={brokerLeadsPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setBrokerLeadsPage((p) => Math.min(brokerLeadsTotalPages, p + 1))}
                      disabled={brokerLeadsPage === brokerLeadsTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Broker Lead Detail Panel */}
            {selectedBrokerLead && (
              <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-border space-y-4 shadow-soft">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue" />
                    <span>Broker Lead Dossier</span>
                  </h3>
                  <button
                    onClick={() => setSelectedBrokerLead(null)}
                    className="text-text-muted hover:text-navy text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-surface-tint border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-muted uppercase">Target Broker:</span>
                    <span className="font-black text-navy">{selectedBrokerLead.broker?.companyName || 'Unknown'}</span>
                  </div>
                  {selectedBrokerLead.broker?.slug && (
                    <div className="flex justify-end">
                      <Link
                        href={`/brokers/${selectedBrokerLead.broker.slug}`}
                        target="_blank"
                        className="text-[11px] font-bold text-blue hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Public Profile
                      </Link>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Trader Name:</span>
                    <strong className="text-navy">{selectedBrokerLead.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Email Address:</span>
                    <a href={`mailto:${selectedBrokerLead.email}`} className="font-bold text-blue hover:underline">
                      {selectedBrokerLead.email}
                    </a>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Phone / WhatsApp:</span>
                    <span className="font-mono font-bold text-navy">{selectedBrokerLead.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Country of Origin:</span>
                    <span className="font-bold text-navy">{selectedBrokerLead.country || 'Global'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Deposit Budget:</span>
                    <span className="font-bold text-orange">{selectedBrokerLead.depositBudget || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Experience Level:</span>
                    <span className="font-bold text-navy">{selectedBrokerLead.experience || 'BEGINNER'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-text-muted">Received Date:</span>
                    <span className="text-navy">{new Date(selectedBrokerLead.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {selectedBrokerLead.message && (
                  <div className="p-4 rounded-2xl bg-surface-tint border border-border text-xs text-text-body whitespace-pre-wrap leading-relaxed">
                    <div className="font-bold text-navy text-[11px] mb-1">Trader Notes / Request:</div>
                    {selectedBrokerLead.message}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {!selectedBrokerLead.isRead ? (
                    <button
                      onClick={() => markLeadAsRead(selectedBrokerLead.id)}
                      className="px-4 py-2 rounded-full bg-blue text-white text-xs font-bold hover:bg-blue-hover transition"
                    >
                      Mark as Read
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Marked as Read
                    </span>
                  )}

                  <button
                    onClick={() => deleteLead(selectedBrokerLead.id)}
                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition"
                    title="Delete lead record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
