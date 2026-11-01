'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Check, Save, Loader2, Star, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import { ProviderCategoryItem } from '../../../../types';

export default function CategorySelectionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableCategories, setAvailableCategories] = useState<ProviderCategoryItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    Array<{
      categoryId: string;
      isPrimary: boolean;
      subcategoryId?: string;
    }>
  >([]);

  useEffect(() => {
    Promise.all([api.get('/provider-forms/categories'), api.get('/service-providers/me')])
      .then(([catsRes, meRes]) => {
        if (catsRes.data?.success) {
          setAvailableCategories(catsRes.data.data);
        }
        if (meRes.data?.success && meRes.data.data?.categorySelections) {
          const current = meRes.data.data.categorySelections.map((sel: any) => ({
            categoryId: sel.categoryId,
            isPrimary: !!sel.isPrimary,
            subcategoryId: sel.subcategoryId,
          }));
          setSelectedCategories(current);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const isSelected = (catId: string) => selectedCategories.some((s) => s.categoryId === catId);
  const isPrimary = (catId: string) =>
    selectedCategories.some((s) => s.categoryId === catId && s.isPrimary);

  const toggleCategory = (catId: string) => {
    if (isSelected(catId)) {
      if (selectedCategories.length <= 1) {
        setError('You must maintain at least 1 active category selection.');
        return;
      }
      const filtered = selectedCategories.filter((s) => s.categoryId !== catId);
      // If we removed primary, designate the first remaining as primary
      if (isPrimary(catId) && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      setSelectedCategories(filtered);
    } else {
      if (selectedCategories.length >= 10) {
        setError('You cannot select more than 10 categories.');
        return;
      }
      const makePrimary = selectedCategories.length === 0;
      setSelectedCategories([
        ...selectedCategories,
        { categoryId: catId, isPrimary: makePrimary },
      ]);
    }
  };

  const setPrimary = (catId: string) => {
    setSelectedCategories(
      selectedCategories.map((s) => ({
        ...s,
        isPrimary: s.categoryId === catId,
      }))
    );
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedCategories.length === 0) {
      setError('Please select at least 1 category.');
      return;
    }
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.put('/service-providers/me/categories', {
        categories: selectedCategories,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update category selections');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-200 rounded-2xl"></div>
            <div className="h-40 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Category Selection</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Form 2 C: Select between 1 and 10 categories representing your solutions suite.
            </p>
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
            <span>{saving ? 'Saving...' : 'Save Categories'}</span>
          </Button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Category selections saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableCategories.map((cat) => {
            const checked = isSelected(cat.id);
            const primary = isPrimary(cat.id);

            return (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl border transition-all ${
                  checked
                    ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        checked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        Category {cat.number}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{cat.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {cat.shortDescription || cat.fullDescription}
                      </p>
                    </div>
                  </div>

                  {checked && (
                    <button
                      type="button"
                      onClick={() => setPrimary(cat.id)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                        primary
                          ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title={primary ? 'Primary Category' : 'Click to make primary category'}
                    >
                      <Star className={`w-3.5 h-3.5 ${primary ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{primary ? 'Primary' : 'Make Primary'}</span>
                    </button>
                  )}
                </div>

                {checked && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Sections: {cat.sections?.length || 0} form sections
                    </span>
                    <Link
                      href={`/dashboard/service-provider/category-forms?cat=${cat.number}`}
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Edit Category Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
