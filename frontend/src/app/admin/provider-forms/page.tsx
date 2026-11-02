'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Settings,
  Plus,
  Edit,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import PageContainer from '@/components/ui/PageContainer';
import Button from '@/components/ui/Button';

export default function AdminProviderFormBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCatNumber, setActiveCatNumber] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<any>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeCatNumber) {
      loadCategoryDetail(activeCatNumber);
    }
  }, [activeCatNumber]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/provider-forms/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryDetail = async (num: number) => {
    try {
      const res = await api.get(`/provider-forms/categories/${num}`);
      if (res.data?.success) {
        setActiveCategory(res.data.data);
      }
    } catch (err) {
      console.error(err);
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

  const sections = activeCategory?.sections || [];

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Provider Form Builder</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Admin-managed questions, field definitions, option lists, and verifiable claim badges.
            </p>
          </div>
          <Link href="/admin/service-providers">
            <Button variant="outline" size="sm">
              <span>Back to Provider Review</span>
            </Button>
          </Link>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {categories.map((cat) => {
            const isSelected = activeCatNumber === cat.number;
            return (
              <button
                key={cat.id || cat.number}
                type="button"
                onClick={() => setActiveCatNumber(cat.number)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Cat {cat.number}:</span>
                <span className="truncate max-w-[120px]">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Header */}
        {activeCategory && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase">
                Category {activeCategory.number}
              </span>
              <span className="text-xs text-slate-400">Code: {activeCategory.code}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{activeCategory.name}</h2>
            <p className="text-xs text-slate-500">{activeCategory.shortDescription || activeCategory.fullDescription}</p>
          </div>
        )}

        {/* Sections and Questions */}
        <div className="space-y-6">
          {sections.map((sec: any) => (
            <div key={sec.id || sec.letter} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {sec.letter}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{sec.name}</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {sec.fields?.length || 0} fields
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {(sec.fields || []).map((f: any) => (
                  <div key={f.id || f.key} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{f.label}</span>
                        {f.required && <span className="text-xs font-bold text-red-500">*</span>}
                        {f.claim === 'VERIFIABLE' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                            VERIFIABLE CLAIM
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">DECLARED</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Key: {f.key} • Type: {f.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {f.visibility === 'ADMIN_ONLY' ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

