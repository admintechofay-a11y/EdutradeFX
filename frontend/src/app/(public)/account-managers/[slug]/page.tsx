'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  Star,
  MapPin,
  Briefcase,
  Languages,
  CheckCircle,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  X,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { AccountManager, AccountManagerReview } from '../../../../types';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';

export default function AMDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [am, setAM] = useState<AccountManager | null>(null);
  const [reviews, setReviews] = useState<AccountManagerReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Enquiry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    investmentBudget: '5,000 - 20,000 USD',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadAM() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/account-managers/${slug}`);
        setAM(res.data?.data || null);
        if (res.data?.data?.id) {
          const revRes = await api.get(`/account-managers/${res.data.data.id}/reviews`);
          setReviews(revRes.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load AM', err);
      } finally {
        setLoading(false);
      }
    }

    loadAM();
  }, [slug]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!am) return;
    setSubmitting(true);
    try {
      await api.post(`/account-managers/${am.id}/enquiries`, enquiryForm);
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setEnquiryForm({ name: '', email: '', phone: '', investmentBudget: '5,000 - 20,000 USD', message: '' });
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!am) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-text-heading mb-2">Account Manager Not Found</h2>
        <p className="text-text-muted mb-6">This manager profile is unavailable or under review.</p>
        <Link
          href="/account-managers"
          className="px-6 py-2.5 bg-blue text-white rounded-full text-sm font-semibold hover:bg-blue-hover transition"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-text-body bg-white">
      {/* ─── Profile Header ──────────────────────────────────────── */}
      <div className="bg-surface-tint border-b border-border pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-soft">
                {am.photo ? (
                  <img src={am.photo} alt={am.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-blue">
                    {am.fullName[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">{am.fullName}</h1>
                  {am.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange text-xs font-bold border border-orange-200">
                      TOP PERFORMER
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green text-xs font-bold border border-green-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Manager
                  </span>
                </div>
                <p className="text-sm text-text-body mb-2">{am.tagline || 'PAMM Portfolio Specialist'}</p>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={am.avgRating} />
                    <span className="font-bold text-text-heading ml-1">{am.avgRating.toFixed(1)}</span>
                    <span>({am.totalReviews} reviews)</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    {am.city ? `${am.city}, ${am.country}` : am.country || 'Global'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-text-muted" />
                    {am.yearsExperience || 5}+ Years Experience
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-full bg-orange hover:bg-orange-hover text-white font-bold text-sm shadow-soft transition flex items-center gap-2 min-h-[44px]"
              >
                <Mail className="w-4 h-4" />
                <span>Request Allocation Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Profile Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Bio & Methodology */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft">
              <h3 className="text-lg font-bold text-text-heading mb-4">Trading Philosophy & Background</h3>
              <p className="text-sm sm:text-base text-text-body leading-relaxed whitespace-pre-line">
                {am.bio ||
                  `${am.fullName} focuses on capital preservation through institutional risk-adjusted return models. Utilizing proprietary algorithmic hedging and strict maximum daily drawdown limits, their PAMM portfolios are engineered for steady, low-volatility equity curves.`}
              </p>
            </div>

            {/* Services Offered */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft">
              <h3 className="text-lg font-bold text-text-heading mb-4">Offered Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {am.services && am.services.length > 0 ? (
                  am.services.map((srv, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-surface-tint border border-border text-xs font-semibold text-text-heading flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-green shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))
                ) : (
                  ['PAMM Account Management', 'MAM Institutional Pooling', 'Copy-Trading Feeds', 'Private Risk Consultation'].map(
                    (srv, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-surface-tint border border-border text-xs font-semibold text-text-heading flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green shrink-0" />
                        <span>{srv}</span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
              <h3 className="text-lg font-bold text-text-heading">Client Feedback ({reviews.length})</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-surface-tint border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-text-heading">{rev.user?.name || 'Investor'}</span>
                        <StarRating rating={rev.rating} />
                      </div>
                      <p className="text-xs text-text-body">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No client reviews submitted yet.</p>
              )}
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Profile Details
              </h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="text-text-muted">Languages</span>
                  <span className="font-semibold text-text-heading">
                    {am.languages && am.languages.length > 0 ? am.languages.join(', ') : 'English'}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border">
                  <span className="text-text-muted">Availability</span>
                  <span className="font-semibold text-green">{am.availability || 'Accepting New Capital'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Inquiries</span>
                  <span className="font-semibold text-text-heading">Verified</span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 py-3 bg-blue hover:bg-blue-hover text-white font-semibold text-xs rounded-full transition shadow-soft"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={!success && am ? `Contact ${am.fullName}` : undefined}
        subtitle={!success ? 'Inquire about portfolio conditions and minimum allocation.' : undefined}
      >
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-14 h-14 text-green mx-auto mb-3" />
            <h3 className="text-xl font-bold text-text-heading mb-2">Message Sent!</h3>
            <p className="text-xs text-text-body">
              {am?.fullName} has been notified and will reply to your registered email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-4">

                <div>
                  <label className="block text-xs font-semibold text-text-heading mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="e.g. David Miller"
                    className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:ring-1 focus:ring-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="david@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:ring-1 focus:ring-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">Phone</label>
                    <input
                      type="text"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="+1 555 928 111"
                      className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:ring-1 focus:ring-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-heading mb-1">Investment Target</label>
                  <select
                    value={enquiryForm.investmentBudget}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, investmentBudget: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:ring-1 focus:ring-blue"
                  >
                    <option value="1,000 - 5,000 USD">1,000 - 5,000 USD</option>
                    <option value="5,000 - 20,000 USD">5,000 - 20,000 USD</option>
                    <option value="20,000 - 50,000 USD">20,000 - 50,000 USD</option>
                    <option value="50,000+ USD VIP">50,000+ USD (Institutional Tier)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-heading mb-1">Your Message</label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Detail your risk appetite, target broker, and questions regarding profit split..."
                    className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:ring-1 focus:ring-blue resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-orange hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-xs rounded-full transition shadow-soft"
                >
                  {submitting ? 'Sending...' : 'Submit Allocation Inquiry'}
                </button>
              </form>
            )}
      </Modal>
    </div>
  );
}
