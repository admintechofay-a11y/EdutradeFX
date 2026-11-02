'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  Layers,
  Users,
  ShieldCheck,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import ClaimBadge from '../../../../components/forms/ClaimBadge';

export default function ProviderPreviewPage() {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api
      .get('/solutions-providers/preview/me')
      .then((res) => {
        if (res.data?.success) setPreview(res.data.data);
      })
      .catch((err) => {
        console.error('Preview error, falling back to /service-providers/me', err);
        api
          .get('/service-providers/me')
          .then((res) => {
            if (res.data?.success) setPreview(res.data.data);
          })
          .catch((e) => console.error(e));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-200 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  const p = preview || {};
  const categories = p.categorySelections || p.categories || [];
  const products = p.products || [];
  const team = p.teamMembers || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Preview Banner */}
      <div className="sticky top-0 z-40 bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>PREVIEW MODE — DRAFT SIMULATION. Only approved information appears on your live public profile.</span>
      </div>

      <PageContainer>
        {/* Hero Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs mt-4">
          {/* Cover */}
          <div className="h-36 sm:h-52 bg-gradient-to-r from-slate-800 to-blue-900 relative">
            {p.coverImage && (
              <img src={p.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60" />
            )}
          </div>

          {/* Profile Header */}
          <div className="px-6 pb-6 pt-0 sm:pt-0 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-16">
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
                    {p.brandName || p.legalName || 'Solutions Provider'}
                  </h1>
                  {p.isFeatured && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      Featured
                    </span>
                  )}
                  <ClaimBadge isVerified={p.verificationStatus === 'VERIFIED'} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  {p.tagline || 'Enterprise FX Solutions Provider'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  {p.registeredAddress?.countryName && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {p.registeredAddress.countryName}
                    </span>
                  )}
                  {p.yearEstablished && (
                    <span>Est. {p.yearEstablished}</span>
                  )}
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Button variant="primary" size="sm" className="shrink-0 self-start sm:self-end">
              <Mail className="w-4 h-4 mr-1.5" />
              Request Enterprise Quote
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 px-6 border-t border-slate-100 overflow-x-auto text-xs font-bold text-slate-500">
            {['overview', 'categories', 'products', 'team'].map((tab) => (
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
                  <h2 className="text-base font-bold text-slate-900">Executive Summary</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {p.overview || 'No detailed overview has been provided yet.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900">Supported Categories</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((c: any) => {
                      const cat = c.category || c;
                      return (
                        <div key={cat.id || cat.number} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">
                            Cat {cat.number}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 mt-0.5">{cat.name}</h3>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Commercial Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Onboarding Timeframe:</span>
                      <p className="font-semibold text-slate-800">{p.onboardingTimeframe || '2-4 weeks'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Support SLA:</span>
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

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c: any) => {
                const cat = c.category || c;
                return (
                  <div key={cat.id || cat.number} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-blue-600 uppercase">Category {cat.number}</span>
                    <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{cat.shortDescription || cat.fullDescription}</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((prod: any) => (
                <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {prod.type}
                    </span>
                    <span className="text-xs text-slate-400">{prod.deliveryModel}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{prod.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{prod.summary}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pricing: {prod.pricing?.model || 'Custom'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {team.map((m: any) => (
                <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{m.name[0]}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{m.roleTitle}</p>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{m.bio}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

