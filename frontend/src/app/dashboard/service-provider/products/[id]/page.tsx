'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Layers,
  Cpu,
  Share2,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../../../../lib/api';
import PageContainer from '../../../../../components/ui/PageContainer';
import Button from '../../../../../components/ui/Button';
import FileDropzone from '../../../../../components/forms/FileDropzone';

const PRODUCT_TABS = [
  { id: 'master', label: '1. Master Info (Form 3)', icon: Package },
  { id: 'specs', label: '2. Tech Specs (Form 4)', icon: Cpu },
  { id: 'integrations', label: '3. Integrations (Form 5)', icon: Share2 },
  { id: 'pricing', label: '4. Pricing (Form 7)', icon: DollarSign },
];

export default function ProductEditorPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('master');

  const [product, setProduct] = useState<any>({
    name: '',
    version: '',
    type: 'SOFTWARE',
    targetMarket: 'INSTITUTIONAL',
    deliveryModel: 'SAAS_CLOUD',
    summary: '',
    description: '',
    demoUrl: '',
    specs: {
      hostingType: 'CLOUD_MULTI_TENANT',
      cloudProviders: [],
      latencyMs: '',
      throughputTps: '',
      uptimeSlaPercent: '99.9',
      disasterRecovery: true,
      dataResidency: [],
    },
    integrations: {
      supportedPlatforms: [],
      customApiSupport: true,
      apiProtocols: ['REST', 'WEBSOCKET'],
      fixProtocolVersion: 'FIX 4.4',
      crmIntegrations: [],
    },
    pricing: {
      model: 'MONTHLY_SUBSCRIPTION',
      setupFeeAmount: '',
      setupFeeCurrency: 'USD',
      licenseFeeAmount: '',
      licenseFeeCurrency: 'USD',
      licenseFeePeriod: 'MONTHLY',
      freeTrialAvailable: false,
      trialDurationDays: '',
    },
  });

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const res = await api.get(`/service-providers/me/products/${productId}`);
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setProduct({
          name: d.name || '',
          version: d.version || '',
          type: d.type || 'SOFTWARE',
          targetMarket: d.targetMarket || 'INSTITUTIONAL',
          deliveryModel: d.deliveryModel || 'SAAS_CLOUD',
          summary: d.summary || '',
          description: d.description || '',
          demoUrl: d.demoUrl || '',
          specs: d.specs || {
            hostingType: 'CLOUD_MULTI_TENANT',
            cloudProviders: [],
            latencyMs: '',
            throughputTps: '',
            uptimeSlaPercent: '99.9',
            disasterRecovery: true,
            dataResidency: [],
          },
          integrations: d.integrations || {
            supportedPlatforms: [],
            customApiSupport: true,
            apiProtocols: ['REST', 'WEBSOCKET'],
            fixProtocolVersion: 'FIX 4.4',
            crmIntegrations: [],
          },
          pricing: d.pricing || {
            model: 'MONTHLY_SUBSCRIPTION',
            setupFeeAmount: '',
            setupFeeCurrency: 'USD',
            licenseFeeAmount: '',
            licenseFeeCurrency: 'USD',
            licenseFeePeriod: 'MONTHLY',
            freeTrialAvailable: false,
            trialDurationDays: '',
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.put(`/service-providers/me/products/${productId}`, {
        name: product.name,
        version: product.version,
        type: product.type,
        targetMarket: product.targetMarket,
        deliveryModel: product.deliveryModel,
        summary: product.summary,
        description: product.description,
        demoUrl: product.demoUrl,
      });

      // Save sub-specs
      await Promise.all([
        api.put(`/service-providers/me/products/${productId}/specs`, product.specs),
        api.put(`/service-providers/me/products/${productId}/integrations`, product.integrations),
        api.put(`/service-providers/me/products/${productId}/pricing`, product.pricing),
      ]);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save product details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/service-provider/products"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {product.name || 'Edit Product'}
              </h1>
              <p className="text-xs text-slate-500">Configure technical, operational, and commercial parameters</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => handleSave()}
            variant="primary"
            size="sm"
            disabled={saving}
            className="flex items-center gap-1.5 self-start"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Product'}</span>
          </Button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Product specifications saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          {PRODUCT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Master Details */}
        {activeTab === 'master' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product / Solution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="e.g. Omnibridge Aggregator"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Version / Release</label>
                <input
                  type="text"
                  value={product.version}
                  onChange={(e) => setProduct({ ...product, version: e.target.value })}
                  placeholder="e.g. 4.2.0"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Type</label>
                <select
                  value={product.type}
                  onChange={(e) => setProduct({ ...product, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SOFTWARE">Software / Application</option>
                  <option value="SERVICE">Professional Service / Consulting</option>
                  <option value="DATA_FEED">Market Data / Feed</option>
                  <option value="INFRASTRUCTURE">Hosting / Infrastructure</option>
                  <option value="HYBRID">Hybrid Solution</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Model</label>
                <select
                  value={product.deliveryModel}
                  onChange={(e) => setProduct({ ...product, deliveryModel: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SAAS_CLOUD">SaaS / Hosted Cloud</option>
                  <option value="ON_PREMISE">On-Premises Deployment</option>
                  <option value="HYBRID">Hybrid (Cloud + Edge)</option>
                  <option value="MANAGED_SERVICE">Fully Managed Service</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">One-Line Summary</label>
              <input
                type="text"
                value={product.summary}
                onChange={(e) => setProduct({ ...product, summary: e.target.value })}
                placeholder="High-speed multi-asset liquidity aggregator with smart order routing"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Comprehensive Description</label>
              <textarea
                rows={4}
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                placeholder="Detail core architectural strengths, supported order types, and risk management modules..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Demo URL</label>
              <input
                type="url"
                value={product.demoUrl}
                onChange={(e) => setProduct({ ...product, demoUrl: e.target.value })}
                placeholder="https://demo.company.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Technical Specs (Form 4) */}
        {activeTab === 'specs' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Technical & Architecture Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hosting Architecture</label>
                <select
                  value={product.specs.hostingType}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      specs: { ...product.specs, hostingType: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CLOUD_MULTI_TENANT">Multi-Tenant Cloud</option>
                  <option value="CLOUD_SINGLE_TENANT">Dedicated Single-Tenant Cloud</option>
                  <option value="ON_PREM_BARE_METAL">Bare Metal / Equinix Cross-Connect</option>
                  <option value="HYBRID">Hybrid Cloud / Dedicated Bridge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uptime SLA Commitment (%)
                </label>
                <input
                  type="text"
                  value={product.specs.uptimeSlaPercent}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      specs: { ...product.specs, uptimeSlaPercent: e.target.value },
                    })
                  }
                  placeholder="99.95"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Execution Latency (ms or µs)
                </label>
                <input
                  type="text"
                  value={product.specs.latencyMs}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      specs: { ...product.specs, latencyMs: e.target.value },
                    })
                  }
                  placeholder="e.g. < 50 microseconds"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Throughput Capacity (TPS)
                </label>
                <input
                  type="text"
                  value={product.specs.throughputTps}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      specs: { ...product.specs, throughputTps: e.target.value },
                    })
                  }
                  placeholder="e.g. 50,000 orders/sec"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Integrations (Form 5) */}
        {activeTab === 'integrations' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Trading Platforms & Protocols Supported
            </h2>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Supported Platforms</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'DXtrade', 'Match-Trader', 'TradingView', 'ActTrader', 'VertexFX'].map(
                  (plat) => {
                    const isChecked = (product.integrations.supportedPlatforms || []).includes(plat);
                    return (
                      <label key={plat} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = product.integrations.supportedPlatforms || [];
                            const updated = e.target.checked ? [...cur, plat] : cur.filter((p: string) => p !== plat);
                            setProduct({
                              ...product,
                              integrations: { ...product.integrations, supportedPlatforms: updated },
                            });
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>{plat}</span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">FIX Protocol Versions</label>
              <input
                type="text"
                value={product.integrations.fixProtocolVersion || ''}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    integrations: { ...product.integrations, fixProtocolVersion: e.target.value },
                  })
                }
                placeholder="e.g. FIX 4.2, FIX 4.4, FAST"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Pricing (Form 7) */}
        {activeTab === 'pricing' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Commercial Pricing Structure
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Model</label>
                <select
                  value={product.pricing.model}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      pricing: { ...product.pricing, model: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MONTHLY_SUBSCRIPTION">Monthly Subscription</option>
                  <option value="ANNUAL_LICENSE">Annual Enterprise License</option>
                  <option value="VOLUME_BASED">Volume / Turnover Tiered</option>
                  <option value="PER_SEAT">Per User / Seat</option>
                  <option value="CUSTOM_QUOTE">Custom Quote Upon Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">One-Time Setup Fee ($)</label>
                <input
                  type="number"
                  value={product.pricing.setupFeeAmount}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      pricing: { ...product.pricing, setupFeeAmount: e.target.value },
                    })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recurring License Amount ($)</label>
                <input
                  type="number"
                  value={product.pricing.licenseFeeAmount}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      pricing: { ...product.pricing, licenseFeeAmount: e.target.value },
                    })
                  }
                  placeholder="2500"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.pricing.freeTrialAvailable}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        pricing: { ...product.pricing, freeTrialAvailable: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Free Trial / Demo Sandbox Available</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
