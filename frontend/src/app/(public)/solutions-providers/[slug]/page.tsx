'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Package,
  Layers,
  Users,
  ShieldCheck,
  ExternalLink,
  Mail,
  MapPin,
  Star,
  FileText,
  ChevronRight,
  Globe,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import ClaimBadge from '../../../../components/forms/ClaimBadge';

export default function PublicProviderProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Enquiry Modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enqSending, setEnqSending] = useState(false);
  const [enqSuccess, setEnqSuccess] = useState(false);
  const [enqForm, setEnqForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    roleTitle: '',
    message: '',
    budgetRange: '$1,000 - $5,000 / month',
  });

  useEffect(() => {
    if (slug) {
      api
        .get(`/solutions-providers/${slug}`)
        .then((res) => {
          if (res.data?.success) setProvider(res.data.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnqSending(true);
    try {
      await api.post(`/solutions-providers/${slug}/enquiries`, enqForm);
      setEnqSuccess(true);
      setTimeout(() => {
        setEnqSuccess(false);
        setEnquiryModalOpen(false);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setEnqSending(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-48 bg-slate-200 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  if (!provider) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Solutions Provider Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            This profile does not exist or has not been approved for public listing.
          </p>
          <div className="mt-4">
            <Link href="/solutions-providers">
              <Button variant="primary" size="sm">
                Return to Directory
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const p = provider || {};
  const categories = Array.isArray(p.categories) ? p.categories : [];
  const products = Array.isArray(p.products) ? p.products : [];
  const team = Array.isArray(p.team) ? p.team : [];
  const reviews = Array.isArray(p.reviews) ? p.reviews : [];
  const isVerified = Boolean(p.verified || p.verificationStatus === 'VERIFIED');
  const rawRating = p.ratingAvg ?? p.avgRating;
  const reviewCount = p.ratingCount ?? p.totalReviews ?? 0;
  const rating =
    rawRating && !isNaN(Number(rawRating)) && Number(rawRating) > 0
      ? Number(rawRating).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageContainer>
        {/* Hero Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs mt-6">
          <div className="h-40 sm:h-56 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 relative">
            {p.coverImage && (
              <img src={p.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50" />
            )}
          </div>

          <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                {p.logo ? (
                  <img src={p.logo} alt={p.brandName} className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-12 h-12 text-slate-300" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {p.brandName || p.name}
                  </h1>
                  <ClaimBadge isVerified={isVerified} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  {p.tagline || 'Enterprise Trading Infrastructure & Financial Software'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  {p.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {p.country}
                    </span>
                  )}
                  {rating && (
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{rating}</span>
                    </span>
                  )}
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Site</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setEnquiryModalOpen(true)}
              className="shrink-0 self-start sm:self-end flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Provider</span>
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 px-6 border-t border-slate-100 overflow-x-auto text-xs font-bold text-slate-500">
            {['overview', 'products', 'categories', 'team', 'reviews'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 border-b-2 uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h2 className="text-base font-bold text-slate-900">About {p.brandName || p.name}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {p.overview || 'Enterprise solutions and bridge technology provider.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900">Featured Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.slice(0, 4).map((prod: any) => (
                      <Link
                        key={prod.id || prod.slug}
                        href={`/solutions-providers/${slug}/products/${prod.slug || prod.id}`}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors block group"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold">{prod.type || 'SOFTWARE'}</span>
                          <span className="text-[10px]">{prod.deliveryModel}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.summary}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Engagement Profile
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Onboarding Timeframe:</span>
                      <p className="font-semibold text-slate-800">{p.onboardingTimeframe || '2-4 weeks'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Support Tiers:</span>
                      <p className="font-semibold text-slate-800">{p.supportSlaTiers || 'Standard Support'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Minimum Contract:</span>
                      <p className="font-semibold text-slate-800">{p.minimumContractLength || '12 months'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((prod: any) => (
                <div key={prod.id || prod.slug} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {prod.type}
                    </span>
                    <span className="text-xs text-slate-400">{prod.deliveryModel}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{prod.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{prod.summary}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Pricing: {typeof prod.pricing === 'object' ? prod.pricing?.model || 'Custom' : prod.pricing || 'Custom'}
                    </span>
                    <Link
                      href={`/solutions-providers/${slug}/products/${prod.slug || prod.id}`}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>View Specifications</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c: any) => (
                <div key={c.categoryNumber || c.number} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-blue-600 uppercase">Category {c.categoryNumber || c.number}</span>
                  <h3 className="text-base font-bold text-slate-900">{c.categoryName || c.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.shortDescription}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {team.map((m: any) => (
                <div key={m.id || m.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.name || 'Member'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(m.name || 'M').charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{m.roleTitle}</p>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{m.bio}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Verified Client Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No public reviews submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{r.authorName || 'Institutional Trader'}</span>
                        <div className="flex text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="ml-1 font-bold">{r.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{r.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inquire Modal */}
        {enquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Request Quote from {p.brandName || p.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {enqSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">Inquiry Sent Successfully</h4>
                  <p className="text-xs text-slate-500">
                    Your request has been dispatched directly to the provider's corporate representative.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendEnquiry} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={enqForm.name}
                      onChange={(e) => setEnqForm({ ...enqForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email *</label>
                      <input
                        type="email"
                        required
                        value={enqForm.email}
                        onChange={(e) => setEnqForm({ ...enqForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Broker Name</label>
                      <input
                        type="text"
                        value={enqForm.companyName}
                        onChange={(e) => setEnqForm({ ...enqForm, companyName: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry / Project Scope *</label>
                    <textarea
                      rows={3}
                      required
                      value={enqForm.message}
                      onChange={(e) => setEnqForm({ ...enqForm, message: e.target.value })}
                      placeholder="Please specify which solutions, capacity requirements, or integrations you require..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEnquiryModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={enqSending}>
                      {enqSending ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}

