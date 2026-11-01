'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Save, Loader2, CheckCircle, FileText } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import FileDropzone from '../../../../components/forms/FileDropzone';

const COMMERCIAL_MODELS = [
  'Fixed Monthly Subscription',
  'Annual License / Contract',
  'Per-User / Per-Seat Fee',
  'Volume / Turnover Based (per million traded)',
  'Revenue / Profit Sharing',
  'Setup / Onboarding Fee + Recurring',
  'One-Time Perpetual License',
  'Custom Enterprise Quote',
];

export default function CommercialTermsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    commercialModels: [] as string[],
    pricingDescription: '',
    onboardingTimeframe: '2-4 weeks',
    supportSlaTiers: 'Standard Business Hours (Email + Slack)',
    minimumContractLength: '12 months',
    publicBrochureUrl: null,
  });

  useEffect(() => {
    api
      .get('/service-providers/me')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          setFormData({
            commercialModels: Array.isArray(d.commercialModels) ? d.commercialModels : [],
            pricingDescription: d.pricingDescription || '',
            onboardingTimeframe: d.onboardingTimeframe || '2-4 weeks',
            supportSlaTiers: d.supportSlaTiers || 'Standard Business Hours (Email + Slack)',
            minimumContractLength: d.minimumContractLength || '12 months',
            publicBrochureUrl: d.publicBrochureUrl || null,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.put('/service-providers/me/commercial', formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save commercial terms');
    } finally {
      setSaving(false);
    }
  };

  const handleBrochureUpload = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/service-providers/me/media/presentation', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setFormData((prev: any) => ({ ...prev, publicBrochureUrl: res.data.data.url }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
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
      <form onSubmit={handleSave} className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Commercial & Engagement</h1>
            <p className="text-sm text-slate-500 mt-0.5">Form 6: Pricing structures, contract duration, and client SLAs</p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
            className="flex items-center gap-1.5 self-start"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Commercial Terms'}</span>
          </Button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Commercial terms saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Commercial Models Offered
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMERCIAL_MODELS.map((model) => {
              const isChecked = formData.commercialModels.includes(model);
              return (
                <label
                  key={model}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer text-xs sm:text-sm text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          commercialModels: [...formData.commercialModels, model],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          commercialModels: formData.commercialModels.filter((m: string) => m !== model),
                        });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>{model}</span>
                </label>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pricing Structure Overview & Typical Ranges
            </label>
            <textarea
              rows={3}
              value={formData.pricingDescription}
              onChange={(e) => setFormData({ ...formData, pricingDescription: e.target.value })}
              placeholder="e.g. Starting from $2,500/month for standard liquidity bridge, with custom tiered volume discounts..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Delivery & Engagement Terms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Typical Onboarding Timeframe
              </label>
              <select
                value={formData.onboardingTimeframe}
                onChange={(e) => setFormData({ ...formData, onboardingTimeframe: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Same Day (Instant)">Same Day (Instant)</option>
                <option value="1-3 business days">1-3 business days</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="1-3 months (Enterprise)">1-3 months (Enterprise)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Contract Commitment
              </label>
              <select
                value={formData.minimumContractLength}
                onChange={(e) => setFormData({ ...formData, minimumContractLength: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="No Minimum (Monthly Rolling)">No Minimum (Monthly Rolling)</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
                <option value="24 months">24 months</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support & SLA Tiers
              </label>
              <input
                type="text"
                value={formData.supportSlaTiers}
                onChange={(e) => setFormData({ ...formData, supportSlaTiers: e.target.value })}
                placeholder="e.g. 24/7 Phone + Slack Dedicated Channel"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Public Pricing Sheet / Enterprise Brochure (PDF)
            </label>
            <FileDropzone
              accept=".pdf"
              label=""
              helpText="PDF format (max 15MB) - visible on public profile"
              value={formData.publicBrochureUrl}
              onFileSelect={handleBrochureUpload}
              onRemove={() => setFormData({ ...formData, publicBrochureUrl: null })}
            />
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
