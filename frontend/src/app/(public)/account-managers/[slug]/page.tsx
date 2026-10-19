'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  X,
  MessageSquare,
  AlertCircle,
  Shield,
  Clock,
  Layers,
  Award,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { AccountManager, AccountManagerReview } from '../../../../types';
import { StarRating } from '../../../../components/common/StarRating';
import { Skeleton } from '../../../../components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

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

  // Review Form
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

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
      await api.post(`/account-managers/${am.id}/enquiry`, enquiryForm);
      setSuccess(true);
      toast.success('Your enquiry was sent directly to this manager.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setEnquiryForm({ name: '', email: '', phone: '', investmentBudget: '5,000 - 20,000 USD', message: '' });
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!am) return;
    setSubmittingReview(true);
    try {
      await api.post(`/account-managers/${am.id}/reviews`, reviewForm);
      toast.success('Review submitted for moderation!');
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-white rounded-full text-xs font-bold shadow-soft hover:bg-blue-600 transition"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const approvedCertificates = (am.documents || []).filter(
    (d: any) => d.docType === 'CERTIFICATE' && (d.isPublic || d.reviewStatus === 'APPROVED')
  );
  const approvedScreenshots = (am.documents || []).filter(
    (d: any) => d.docType === 'PAST_RESULT_SCREENSHOT' && (d.isPublic || d.reviewStatus === 'APPROVED')
  );

  const locationLabel = [am.city, am.stateRegion, am.country].filter(Boolean).join(', ') || 'Global';

  return (
    <div className="min-h-screen py-10 bg-white text-text-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-blue transition">Home</Link>
          <span>/</span>
          <Link href="/account-managers" className="hover:text-blue transition">Account Managers</Link>
          <span>/</span>
          <span className="text-text-heading font-semibold">{am.fullName}</span>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-surface-tint border-2 border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {am.photo ? (
                <img src={am.photo} alt={am.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold font-mono text-blue">
                  {am.fullName ? am.fullName[0].toUpperCase() : 'M'}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-text-heading">{am.fullName}</h1>
                {am.regulatoryVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Regulated Verified
                  </span>
                )}
                {am.entityType && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-tint text-text-muted border border-border">
                    {am.entityType}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-text-muted">
                {am.tagline || am.speciality || 'Audited Forex & Derivatives Portfolio Specialist'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue" />
                  {locationLabel}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-orange" />
                  {am.yearsExperience != null ? `${am.yearsExperience} Years Market Experience` : 'Verified Exp'}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <StarRating rating={am.avgRating || 5.0} />
                  <span className="font-bold text-text-heading ml-1">{(am.avgRating || 5.0).toFixed(1)}</span>
                  <span className="text-text-muted">({am.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Call to Action */}
          <div className="w-full md:w-auto flex flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-8 py-3.5 bg-blue hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-soft hover:shadow-lift transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Contact Account Manager</span>
            </button>
            <div className="text-[11px] text-center text-text-muted font-medium">
              Private contact inquiry • Direct to manager
            </div>
          </div>
        </div>

        {/* Speciality Highlight Banner */}
        {am.speciality && (
          <div className="p-6 rounded-3xl bg-blue-50/40 border border-blue-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-blue uppercase tracking-wider mb-1">Trading Speciality & Edge</h3>
              <p className="text-xs sm:text-sm font-semibold text-text-heading leading-relaxed">
                {am.speciality}
              </p>
            </div>
          </div>
        )}

        {/* Key Metrics Strip (Risk, Settlement, Share %, Accuracy) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-border shadow-soft">
            <div className="text-[11px] font-semibold text-text-muted uppercase">Risk Tolerance</div>
            <div className="text-base font-black text-text-heading mt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  am.riskTolerance === 'LOW'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : am.riskTolerance === 'MODERATE'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {am.riskTolerance || 'MODERATE'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-border shadow-soft">
            <div className="text-[11px] font-semibold text-text-muted uppercase">Risk / Reward Ratio</div>
            <div className="text-base font-black text-text-heading mt-1">
              {am.riskRewardRatio || '1:2'}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-border shadow-soft">
            <div className="text-[11px] font-semibold text-text-muted uppercase">Settlement Cycle</div>
            <div className="text-base font-black text-text-heading mt-1">
              {am.settlementCycle ? am.settlementCycle.replace('LY', '') : 'Monthly'}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-border shadow-soft">
            <div className="text-[11px] font-semibold text-text-muted uppercase">Manager Profit Share</div>
            <div className="text-base font-black text-green-700 mt-1">
              {am.profitSharingPercent != null ? `${am.profitSharingPercent}%` : '20%'}
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About & Bio */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h2 className="text-base font-black text-text-heading">About the Manager</h2>
              <p className="text-xs sm:text-sm text-text-body leading-relaxed whitespace-pre-wrap">
                {am.bio || 'Verified account manager with transparent parameters on EdutradeFX.'}
              </p>
            </div>

            {/* Trading Style & Platforms */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
              <h2 className="text-base font-black text-text-heading">Trading Style & Platforms</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-text-muted mb-2">Trading Styles</div>
                  <div className="flex flex-wrap gap-1.5">
                    {am.tradingStyles && am.tradingStyles.length > 0 ? (
                      am.tradingStyles.map((st) => (
                        <span
                          key={st}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue border border-blue-200"
                        >
                          {st.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted">Discretionary</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted mb-2">Supported Platforms</div>
                  <div className="flex flex-wrap gap-1.5">
                    {am.preferredPlatforms && am.preferredPlatforms.length > 0 ? (
                      am.preferredPlatforms.map((plat) => (
                        <span
                          key={plat}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-surface-tint text-text-heading border border-border"
                        >
                          {plat === 'OTHER' && am.otherPlatformName ? am.otherPlatformName : plat}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted">MT4 / MT5</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted mb-2">Preferred Broker Types</div>
                  <div className="flex flex-wrap gap-1.5">
                    {am.preferredBrokerTypes && am.preferredBrokerTypes.length > 0 ? (
                      am.preferredBrokerTypes.map((bt) => (
                        <span
                          key={bt}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-50 text-gray-800 border border-gray-200"
                        >
                          {bt.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted">ECN / STP</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted mb-2">Self-Reported Accuracy</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-text-heading">
                      {am.accuracyLevel != null ? `${am.accuracyLevel}%` : '—'}
                    </span>
                    {am.accuracyPeriodNote && (
                      <span className="text-xs text-text-muted font-medium">({am.accuracyPeriodNote})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferred Trading Instruments */}
              {am.preferredInstruments && am.preferredInstruments.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs font-bold text-text-muted mb-2">Preferred Instruments / Scripts</div>
                  <div className="flex flex-wrap gap-1.5">
                    {am.preferredInstruments.map((inst) => (
                      <span
                        key={inst}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-tint text-text-heading border border-border"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trading Strategy Elements */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h2 className="text-base font-black text-text-heading">Technical & Strategy Methodology</h2>

              {am.technical && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted mb-1">Technical Setup</h3>
                  <p className="text-xs sm:text-sm text-text-heading leading-relaxed">{am.technical}</p>
                </div>
              )}

              {am.indicators && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted mb-1">Indicators & Confluence</h3>
                  <p className="text-xs sm:text-sm text-text-heading leading-relaxed">{am.indicators}</p>
                </div>
              )}

              {am.signals && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted mb-1">Entry Triggers / Signals</h3>
                  <p className="text-xs sm:text-sm text-text-heading leading-relaxed">{am.signals}</p>
                </div>
              )}

              {am.fundamentals && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted mb-1">Macro / Fundamental Drivers</h3>
                  <p className="text-xs sm:text-sm text-text-heading leading-relaxed">{am.fundamentals}</p>
                </div>
              )}
            </div>

            {/* Approved Past Result Screenshots */}
            {approvedScreenshots.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
                <h2 className="text-base font-black text-text-heading">Verified Account Screenshots</h2>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed italic">
                  Self-reported results. Screenshots can be edited. Past performance is not indicative of future results.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {approvedScreenshots.map((shot: any) => (
                    <div key={shot.id} className="rounded-2xl border border-border overflow-hidden bg-surface-tint">
                      <img src={shot.fileUrl} alt={shot.caption || 'Trade statement'} className="w-full h-48 object-cover" />
                      {shot.caption && (
                        <div className="p-3 text-xs font-semibold text-text-heading truncate">
                          {shot.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Certificates */}
            {approvedCertificates.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-4">
                <h2 className="text-base font-black text-text-heading">Certificates & Credentials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {approvedCertificates.map((cert: any) => (
                    <div key={cert.id} className="p-4 rounded-2xl bg-surface-tint border border-border flex items-center gap-3">
                      <Award className="w-6 h-6 text-orange shrink-0" />
                      <span className="text-xs font-bold text-text-heading truncate">{cert.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Risk Disclaimer Block */}
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
              <span className="font-bold">Risk Disclaimer: </span>
              Self-reported. Not verified by EdutradeFX unless an official verification badge is shown. Past
              performance doesn't guarantee future results. Trading leveraged derivatives involves substantial risk of
              loss and is not suitable for all investors. Capital is at risk.
            </div>

            {/* Reviews Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-black text-text-heading">Investor Reviews & Feedback</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Reviews from verified capital allocators and investors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-orange text-orange" />
                  <span className="text-lg font-black text-text-heading">{(am.avgRating || 5.0).toFixed(1)}</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No public reviews yet for this account manager.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-surface-tint border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-heading">
                          {rev.user?.name || 'Verified Investor'}
                        </span>
                        <div className="flex items-center text-orange gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.round(rev.rating) ? 'fill-orange' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-text-heading leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Review Form */}
              <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-border space-y-3">
                <h3 className="text-xs font-bold text-text-heading">Leave a Client Review</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Your Rating:</span>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                    className="px-2 py-1 rounded-lg border border-border text-xs bg-white"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Below Expectation)</option>
                    <option value={1}>1 Star (Poor)</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your verified experience regarding discipline, drawdown, and communication..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column (1 Col Sidebar) */}
          <div className="space-y-6">
            {/* Risk Discipline Box */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">
                Risk Management Rules
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Loss per trade ratio:</span>
                  <span className="font-bold text-text-heading">
                    {am.lossPerTradePercent != null ? `${am.lossPerTradePercent}%` : '1%'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Daily Trades (1000 USD):</span>
                  <span className="font-bold text-text-heading">
                    {am.dailyTrades != null ? `${am.dailyTrades} trades` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Daily Lots (1000 USD):</span>
                  <span className="font-bold text-text-heading">
                    {am.dailyLots != null ? `${am.dailyLots} lots` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Daily Stop Loss:</span>
                  <span className="font-bold text-text-heading">
                    {am.dailyStopLossPoints != null ? `${am.dailyStopLossPoints} pts` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Daily Take Profit:</span>
                  <span className="font-bold text-text-heading">
                    {am.dailyTakeProfitPoints != null ? `${am.dailyTakeProfitPoints} pts` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Favourite Timeframe:</span>
                  <span className="font-bold text-text-heading">{am.favouriteTimeframe || 'H1'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-muted">Trading Window:</span>
                  <span className="font-bold text-text-heading">
                    {am.tradingTimeFrom && am.tradingTimeTo
                      ? `${am.tradingTimeFrom}–${am.tradingTimeTo} IST`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sharing & Settlements Box */}
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-4">
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">
                Sharing & Settlements
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Settlement Cycle:</span>
                  <span className="font-bold text-text-heading">
                    {am.settlementCycle ? am.settlementCycle.replace('LY', '') : 'Monthly'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-text-muted">Manager Profit Share:</span>
                  <span className="font-bold text-green-700">
                    {am.profitSharingPercent != null ? `${am.profitSharingPercent}%` : '20%'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-muted">Manager Loss Share:</span>
                  <span className="font-bold text-text-heading">
                    {am.lossSharingPercent != null ? `${am.lossSharingPercent}%` : '0%'}
                  </span>
                </div>
              </div>

              {am.clientFundSecurity && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[11px] font-bold text-text-muted mb-1">Fund Protection Protocol:</div>
                  <p className="text-xs text-text-heading leading-relaxed bg-surface-tint p-3 rounded-xl border border-border">
                    {am.clientFundSecurity}
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Broker */}
            {am.recommendsBroker && (
              <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-3">
                <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">
                  Recommended Broker
                </h3>
                <div className="p-4 rounded-2xl bg-surface-tint border border-blue-100">
                  <div className="text-xs font-bold text-text-heading">
                    {am.recommendedBrokerName || 'Partner Broker'}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Recommended Platform: {am.recommendedBrokerPlatform || 'MT5'}
                  </div>
                  {am.recommendedBrokerId && (
                    <Link
                      href={`/brokers`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue hover:underline mt-2"
                    >
                      View Broker Review <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Public Social Links (if opted in) */}
            {am.socialLinksPublic && am.socialLinks && Object.keys(am.socialLinks).length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-3">
                <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider">Public Channels</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(am.socialLinks).map(([k, v]) => {
                    if (!v) return null;
                    const isUrl = String(v).startsWith('http');
                    return (
                      <a
                        key={k}
                        href={isUrl ? String(v) : `https://${k}.com/${v}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-border bg-surface-tint text-text-heading font-semibold hover:border-blue transition flex items-center gap-1.5"
                      >
                        <span className="capitalize">{k}</span>
                        <ExternalLink className="w-3 h-3 text-text-muted" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Enquiry Sticky Card */}
            <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-200 text-center space-y-3">
              <h3 className="text-sm font-bold text-text-heading">Interested in Capital Allocation?</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Send an inquiry directly to {am.fullName}. In compliance with EdutradeFX investor protection, no direct
                contact information is exposed.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 bg-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-soft transition"
              >
                Send Client Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Inquire with ${am.fullName}`}>
        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green mx-auto" />
            <h3 className="text-base font-bold text-text-heading">Inquiry Sent Successfully</h3>
            <p className="text-xs text-text-muted">
              {am.fullName} has received your inquiry notification and will respond through the platform.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-4 p-2 text-xs">
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={enquiryForm.name}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Your Email</label>
              <input
                type="email"
                required
                value={enquiryForm.email}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Your Phone (Optional)</label>
              <input
                type="tel"
                value={enquiryForm.phone}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                placeholder="+1 555 0192"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Intended Investment Budget</label>
              <select
                value={enquiryForm.investmentBudget}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, investmentBudget: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs bg-white focus:ring-2 focus:ring-blue focus:outline-none"
              >
                <option value="1,000 - 5,000 USD">1,000 - 5,000 USD</option>
                <option value="5,000 - 20,000 USD">5,000 - 20,000 USD</option>
                <option value="20,000 - 100,000 USD">20,000 - 100,000 USD</option>
                <option value="100,000+ USD">100,000+ USD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Message / Requirements</label>
              <textarea
                required
                rows={4}
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                placeholder="Share your investment timeline, broker preference, or risk inquiries..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft transition"
            >
              {submitting ? 'Sending...' : 'Send Inquiry to Manager'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
