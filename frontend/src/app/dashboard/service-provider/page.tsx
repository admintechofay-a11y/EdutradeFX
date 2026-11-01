'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileText,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../../lib/api';
import PageContainer from '../../../components/ui/PageContainer';
import Button from '../../../components/ui/Button';

export default function ProviderOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    api
      .get('/service-providers/me')
      .then((res) => {
        if (res.data?.success) {
          setProvider(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-slate-200 rounded-xl"></div>
            <div className="h-24 bg-slate-200 rounded-xl"></div>
            <div className="h-24 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const status = provider?.status || 'DRAFT';
  const completion = provider?.completionScore || 0;
  const categories = provider?.categorySelections || [];
  const products = provider?.products || [];
  const team = provider?.teamMembers || [];
  const documents = provider?.documents || [];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {provider?.providerCode || 'ETP-PENDING'}
              </span>
              <span className="text-xs text-slate-400">
                Ref: {provider?.applicationRef || 'Draft'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {provider?.brandName || provider?.legalName || 'Solutions Provider Hub'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your company profile, enterprise categories, software products, and verification audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/service-provider/preview">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4" />
                <span>Live Preview</span>
              </Button>
            </Link>
            {status === 'DRAFT' && (
              <Link href="/dashboard/service-provider/submit">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit for Audit</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Status Alert Banner */}
        {status === 'CHANGES_REQUESTED' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Action Required: Compliance Changes Requested</h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-1">{provider.changesRequestedNote}</p>
              <div className="mt-3">
                <Link href="/dashboard/service-provider/profile">
                  <span className="text-xs font-bold text-amber-900 hover:underline inline-flex items-center gap-1">
                    Update profile sections <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {status === 'SUBMITTED' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">Application Under Compliance Audit</h3>
              <p className="text-xs sm:text-sm text-blue-800 mt-1">
                Your company dossier has been submitted. Our compliance team audits credentials, licenses, and technical claims within 2–3 business days.
              </p>
            </div>
          </div>
        )}

        {status === 'APPROVED' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Profile Published & Active</h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                Your Solutions Provider profile and approved categories are live in the EdutradeFX directory.
              </p>
            </div>
          </div>
        )}

        {/* Completion Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Onboarding Completion</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {completion}% Completed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Complete all mandatory sections and upload required verification documents before final submission.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/dashboard/service-provider/categories"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Categories</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{categories.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Selected of 10</p>
          </Link>

          <Link
            href="/dashboard/service-provider/products"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Products</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{products.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Listed Solutions</p>
          </Link>

          <Link
            href="/dashboard/service-provider/team"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Team Members</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{team.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Key Personnel</p>
          </Link>

          <Link
            href="/dashboard/service-provider/documents"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Audit Vault</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{documents.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Uploaded Docs</p>
          </Link>
        </div>

        {/* Action Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Onboarding Milestones</h2>

          <div className="divide-y divide-slate-100">
            <Link
              href="/dashboard/service-provider/profile"
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">1. Company Profile (Form 2)</p>
                  <p className="text-xs text-slate-500">Legal entity, registration, headquarters, brand identity</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/service-provider/commercial"
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">2. Commercial Terms (Form 6)</p>
                  <p className="text-xs text-slate-500">Commercial model, engagement terms, client brochures</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/service-provider/categories"
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">3. Select Categories (Form 2 C)</p>
                  <p className="text-xs text-slate-500">Choose between 1 and 10 enterprise categories</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/service-provider/products"
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">4. Products & Technical Specs (Forms 3, 4, 5, 7)</p>
                  <p className="text-xs text-slate-500">Configure products, integrations, and pricing models</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/service-provider/documents"
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">5. Verification Documents Vault</p>
                  <p className="text-xs text-slate-500">Certificate of incorporation, tax proof, SOC/ISO audits</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
