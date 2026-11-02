'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Building2,
  Cpu,
  Share2,
  DollarSign,
  ArrowLeft,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  X,
} from 'lucide-react';
import { api } from '../../../../../../lib/api';
import PageContainer from '../../../../../../components/ui/PageContainer';
import Button from '../../../../../../components/ui/Button';
import ClaimBadge from '../../../../../../components/forms/ClaimBadge';

export default function PublicProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [enqModal, setEnqModal] = useState(false);
  const [enqSending, setEnqSending] = useState(false);
  const [enqDone, setEnqDone] = useState(false);
  const [enqForm, setEnqForm] = useState({
    name: '',
    email: '',
    companyName: '',
    message: '',
  });

  useEffect(() => {
    if (slug && productSlug) {
      api
        .get(`/solutions-providers/${slug}/products/${productSlug}`)
        .then((res) => {
          if (res.data?.success) setProduct(res.data.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug, productSlug]);

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnqSending(true);
    try {
      await api.post(`/solutions-providers/${slug}/enquiries`, {
        ...enqForm,
        message: `[Product: ${product?.name}] ${enqForm.message}`,
      });
      setEnqDone(true);
      setTimeout(() => {
        setEnqDone(false);
        setEnqModal(false);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit quote request');
    } finally {
      setEnqSending(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            This product does not exist or has not been approved for publication.
          </p>
          <div className="mt-4">
            <Link href={`/solutions-providers/${slug}`}>
              <Button variant="primary" size="sm">
                Return to Provider Profile
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const p = product;
  const specs = p.specs || {};
  const integrations = p.integrations || {};
  const pricing = p.pricing || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20">
      <PageContainer>
        <div className="space-y-6">
          {/* Back link */}
          <Link
            href={`/solutions-providers/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Provider Profile</span>
          </Link>

          {/* Product Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {p.type || 'SOFTWARE'}
                </span>
                <span className="text-xs text-slate-400">
                  Delivery: <strong>{p.deliveryModel || 'Cloud SaaS'}</strong>
                </span>
                {p.version && <span className="text-xs text-slate-400">v{p.version}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{p.name}</h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{p.summary}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              {p.demoUrl && (
                <a href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Sandbox</span>
                  </Button>
                </a>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEnqModal(true)}
                className="flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Request Custom Quote</span>
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <h2 className="text-base font-bold text-slate-900">Functional Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {p.description || p.summary || 'Enterprise execution and bridge module.'}
                </p>
              </div>

              {/* Technical Specifications (Form 4) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <span>Technical & Performance Specifications</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Hosting Architecture</span>
                    <p className="text-sm font-bold text-slate-800">{specs.hostingType || 'Cloud Multi-Tenant'}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Uptime SLA</span>
                      <ClaimBadge isVerified={specs.uptimeSlaVerified} size="sm" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{specs.uptimeSlaPercent || '99.9'}%</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Latency Benchmark</span>
                      <ClaimBadge isVerified={specs.latencyVerified} size="sm" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{specs.latencyMs || 'Sub-millisecond'}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Throughput Capacity</span>
                      <ClaimBadge isVerified={specs.throughputVerified} size="sm" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{specs.throughputTps || 'High Throughput'}</p>
                  </div>
                </div>
              </div>

              {/* Supported Platforms (Form 5) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <span>Platform & API Integrations</span>
                </h2>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-500">Supported Platforms:</span>
                  <div className="flex flex-wrap gap-2">
                    {(integrations.supportedPlatforms || ['MT4', 'MT5', 'cTrader', 'TradingView']).map(
                      (plat: string) => (
                        <span
                          key={plat}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200"
                        >
                          {plat}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {integrations.fixProtocolVersion && (
                  <div className="pt-2 text-xs">
                    <span className="text-slate-400">FIX Protocol Version:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{integrations.fixProtocolVersion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Pricing & Action */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Commercial Structure
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-400">Pricing Model:</span>
                    <p className="text-base font-bold text-slate-900">{pricing.model || 'Enterprise Subscription'}</p>
                  </div>

                  {pricing.licenseFeeAmount && (
                    <div>
                      <span className="text-xs text-slate-400">Indicative License:</span>
                      <p className="text-xl font-extrabold text-blue-600">
                        ${pricing.licenseFeeAmount} <span className="text-xs font-normal text-slate-500">/ mo</span>
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setEnqModal(true)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Request Quote</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Modal */}
        {enqModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Request Quote: {p.name}</h3>
                <button type="button" onClick={() => setEnqModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {enqDone ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">Quote Request Submitted</h4>
                  <p className="text-xs text-slate-500">The provider has been notified and will reach out with detailed pricing.</p>
                </div>
              ) : (
                <form onSubmit={handleSendQuote} className="space-y-3">
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Requirements</label>
                    <textarea
                      rows={3}
                      value={enqForm.message}
                      onChange={(e) => setEnqForm({ ...enqForm, message: e.target.value })}
                      placeholder="e.g. Expected monthly turnover, number of server instances..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEnqModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={enqSending}>
                      {enqSending ? 'Submitting...' : 'Send Request'}
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

