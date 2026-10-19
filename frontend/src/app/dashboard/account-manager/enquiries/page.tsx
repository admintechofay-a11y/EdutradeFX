'use client';

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/common/Skeleton';
import toast from 'react-hot-toast';

export default function AccountManagerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const loadEnquiries = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/account-managers/my/enquiries?page=${pageNum}&limit=10`);
      setEnquiries(res.data?.data || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
      setTotalCount(res.data?.meta?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Failed to load enquiries', err);
      toast.error(err.response?.data?.message || 'Failed to load investor enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries(1);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/account-managers/my/enquiries/${id}/read`);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isRead: true, status: 'CONTACTED' } : e))
      );
      toast.success('Marked as read');
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.userName?.toLowerCase().includes(q) ||
      e.userEmail?.toLowerCase().includes(q) ||
      e.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-heading">Investor Enquiries</h1>
          <p className="text-xs text-text-muted mt-1">
            Review inbound inquiries from interested investors and capital allocators ({totalCount} total).
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex items-center gap-3">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          placeholder="Search by investor name, email, or message contents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-text-heading placeholder-text-muted focus:outline-none"
        />
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-border shadow-soft">
          <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-heading mb-1">No Inbound Enquiries Yet</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            When potential clients submit enquiries on your public profile, they will appear here with their contact
            details and message.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-soft ${
                enquiry.isRead || enquiry.status === 'CONTACTED' || enquiry.status === 'RESOLVED'
                  ? 'border-border'
                  : 'border-blue-200 bg-blue-50/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint border border-blue-100 flex items-center justify-center font-bold text-blue shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-heading">
                        {enquiry.userName || 'Prospective Investor'}
                      </span>
                      {(!enquiry.isRead && enquiry.status === 'NEW') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                      {enquiry.userEmail && (
                        <a
                          href={`mailto:${enquiry.userEmail}`}
                          className="flex items-center gap-1 hover:text-blue transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{enquiry.userEmail}</span>
                        </a>
                      )}
                      {enquiry.userPhone && (
                        <a
                          href={`tel:${enquiry.userPhone}`}
                          className="flex items-center gap-1 hover:text-blue transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{enquiry.userPhone}</span>
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(enquiry.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!enquiry.isRead && enquiry.status === 'NEW' && (
                  <button
                    onClick={() => markAsRead(enquiry.id)}
                    className="self-start px-3 py-1.5 bg-surface-tint border border-border hover:bg-blue-50 text-blue font-bold text-xs rounded-lg transition shrink-0"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              {/* Message content */}
              <div className="mt-4 p-3.5 rounded-xl bg-surface-tint border border-border text-xs text-text-heading whitespace-pre-wrap leading-relaxed">
                {enquiry.message}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={page <= 1}
                onClick={() => loadEnquiries(page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-muted hover:text-text-heading disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => loadEnquiries(page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-muted hover:text-text-heading disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
