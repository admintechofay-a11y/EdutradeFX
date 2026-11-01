'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Download,
  Loader2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api';
import PageContainer from '@/components/ui/PageContainer';
import Button from '@/components/ui/Button';

export default function AdminProviderDossierPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) loadDossier();
  }, [providerId]);

  const loadDossier = async () => {
    try {
      const res = await api.get(`/admin/service-providers/${providerId}`);
      if (res.data?.success) setProvider(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setProcessing(true);
    try {
      await api.patch(`/admin/service-providers/${providerId}/status`, {
        status: newStatus,
        note: note.trim() || undefined,
      });
      setActionModal(null);
      setNote('');
      await loadDossier();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleVerifiedBadge = async () => {
    const isCurrentlyVerified = provider.verificationStatus === 'VERIFIED';
    try {
      await api.post(`/admin/service-providers/${providerId}/verify-badge`, {
        isVerified: !isCurrentlyVerified,
      });
      await loadDossier();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle verification badge');
    }
  };

  const handleCategoryStatus = async (selectionId: string, catStatus: string) => {
    try {
      await api.patch(`/admin/service-providers/categories/${selectionId}/status`, {
        status: catStatus,
      });
      await loadDossier();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update category status');
    }
  };

  const handleProductStatus = async (productId: string, prodStatus: string) => {
    try {
      await api.patch(`/admin/service-providers/products/${productId}/status`, {
        status: prodStatus,
      });
      await loadDossier();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update product status');
    }
  };

  const handleDownloadDoc = async (docId: string) => {
    setDownloadingDocId(docId);
    try {
      const res = await api.get(`/admin/service-providers/documents/${docId}/signed-url`);
      if (res.data?.success && res.data.data?.url) {
        window.open(res.data.data.url, '_blank');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate signed document URL');
    } finally {
      setDownloadingDocId(null);
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

  if (!provider) {
    return (
      <PageContainer>
        <div className="text-center py-12">Provider not found</div>
      </PageContainer>
    );
  }

  const p = provider;
  const categories = p.categorySelections || [];
  const products = p.products || [];
  const docs = p.documents || [];

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/service-providers"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {p.providerCode || 'PENDING'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {p.applicationRef || 'DRAFT'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                {p.brandName || p.legalName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVerifiedBadge}
              className={`flex items-center gap-1.5 ${
                p.verificationStatus === 'VERIFIED' ? 'text-emerald-700 border-emerald-300' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{p.verificationStatus === 'VERIFIED' ? 'Verified Badge (Active)' : 'Grant Verified Badge'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionModal('CHANGES_REQUESTED')}
              className="text-amber-700 border-amber-300"
            >
              Request Changes
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange('APPROVED')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Approve Provider
            </Button>
          </div>
        </div>

        {/* Company Identity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Company Identity & Registration
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Legal Entity:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{p.legalName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400">Registration Number:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{p.registrationNumber || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400">Authority:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{p.registrationAuthority || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400">Established:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{p.yearEstablished || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Categories Granular Review */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Categories Review ({categories.length})
          </h2>
          <div className="space-y-3">
            {categories.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase">
                      Cat {c.category?.number}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{c.category?.name}</h3>
                    {c.isPrimary && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Status: <strong>{c.status}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryStatus(c.id, 'APPROVED')}
                    className="text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    Approve Cat
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryStatus(c.id, 'CHANGES_REQUESTED')}
                    className="text-xs text-amber-700 hover:bg-amber-50"
                  >
                    Request Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Granular Review */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Products Review ({products.length})
          </h2>
          <div className="space-y-3">
            {products.map((prod: any) => (
              <div
                key={prod.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{prod.name}</h3>
                  <p className="text-xs text-slate-500">{prod.type} • Delivery: {prod.deliveryModel}</p>
                  <span className="text-xs text-slate-400">Status: <strong>{prod.status}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleProductStatus(prod.id, 'APPROVED')}
                    className="text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    Approve Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleProductStatus(prod.id, 'CHANGES_REQUESTED')}
                    className="text-xs text-amber-700 hover:bg-amber-50"
                  >
                    Request Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Documents Vault (Signed URLs) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Verification Documents Vault ({docs.length})
          </h2>
          <div className="space-y-3">
            {docs.map((d: any) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{d.docType}</h4>
                    <p className="text-xs text-slate-400">{d.fileName}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDoc(d.id)}
                  disabled={downloadingDocId === d.id}
                  className="flex items-center gap-1.5 text-xs text-blue-700"
                >
                  {downloadingDocId === d.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Signed Audit URL (≤ 5m)</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Modal */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {actionModal === 'CHANGES_REQUESTED' ? 'Request Compliance Changes' : 'Action Reason'}
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer Note / Feedback (will be emailed to provider) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Specify which sections or documents require update..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActionModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange(actionModal)}
                  disabled={processing || !note.trim()}
                >
                  {processing ? 'Submitting...' : 'Submit Decision'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
