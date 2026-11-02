'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';

export default function ProductsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/service-providers/me/products');
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/service-providers/me/products', {
        name: 'New Solution / Product',
        type: 'SOFTWARE',
        targetMarket: 'INSTITUTIONAL',
        deliveryModel: 'SAAS_CLOUD',
        summary: 'Brief overview of this enterprise product or service.',
      });
      if (res.data?.success && res.data.data) {
        router.push(`/dashboard/service-provider/products/${res.data.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDuplicate = async (productId: string) => {
    setCloningId(productId);
    try {
      const res = await api.post(`/service-providers/me/products/${productId}/duplicate`);
      if (res.data?.success) {
        await loadProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to duplicate product');
    } finally {
      setCloningId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    setDeletingId(productId);
    try {
      await api.delete(`/service-providers/me/products/${productId}`);
      await loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Products & Solutions Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage multi-product enterprise offerings, technical specs, platform integrations, and pricing.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCreateNew}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No Products Listed Yet</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Add your software platforms, trading bridges, CRM modules, or custom enterprise solutions.
            </p>
            <div className="mt-4">
              <Button type="button" variant="primary" size="sm" onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Product
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod) => {
              const isApproved = prod.status === 'APPROVED';
              const isDraft = prod.status === 'DRAFT';
              const isReview = prod.status === 'UNDER_REVIEW' || prod.status === 'SUBMITTED';

              return (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {prod.type}
                        </span>
                        {isApproved && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved
                          </span>
                        )}
                        {isDraft && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Draft
                          </span>
                        )}
                        {isReview && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                            Under Review
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(prod.id)}
                          disabled={cloningId === prod.id}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Duplicate this product"
                        >
                          {cloningId === prod.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod.id)}
                          disabled={deletingId === prod.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete product"
                        >
                          {deletingId === prod.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-2">{prod.name}</h3>
                    {prod.version && (
                      <span className="text-xs text-slate-400">v{prod.version}</span>
                    )}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {prod.summary || 'No summary provided.'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span>Delivery: <strong>{prod.deliveryModel || 'SaaS'}</strong></span>
                      <span>Target: <strong>{prod.targetMarket || 'Institutional'}</strong></span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Pricing: {prod.pricing?.model || 'Custom Quote'}
                    </span>
                    <Link
                      href={`/dashboard/service-provider/products/${prod.id}`}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Specifications</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

