'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layers, Save, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import DynamicForm from '../../../../components/forms/DynamicForm';
import { ProviderCategoryItem } from '../../../../types';

function CategoryFormsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCatNum = searchParams.get('cat') ? Number(searchParams.get('cat')) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userCategories, setUserCategories] = useState<any[]>([]);
  const [activeSelection, setActiveSelection] = useState<any>(null);
  const [activeCategoryDefinition, setActiveCategoryDefinition] = useState<ProviderCategoryItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    loadUserCategories();
  }, []);

  const loadUserCategories = async () => {
    try {
      const res = await api.get('/service-providers/me');
      if (res.data?.success && res.data.data) {
        const selections = res.data.data.categorySelections || [];
        setUserCategories(selections);

        if (selections.length > 0) {
          const target = initialCatNum
            ? selections.find((s: any) => s.category?.number === initialCatNum) || selections[0]
            : selections[0];
          loadCategoryDetail(target);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadCategoryDetail = async (selection: any) => {
    setLoading(true);
    setActiveSelection(selection);
    setAnswers(selection.answers || {});

    try {
      const catNum = selection.category?.number || 1;
      const res = await api.get(`/provider-forms/categories/${catNum}`);
      if (res.data?.success) {
        setActiveCategoryDefinition(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (key: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleOtherChange = (key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    if (!activeSelection) return;
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.put(`/service-providers/me/categories/${activeSelection.id}`, {
        answers,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save answers');
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

  if (userCategories.length === 0) {
    return (
      <PageContainer>
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">No Categories Selected</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You must select at least 1 category before filling out technical specifications.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => router.push('/dashboard/service-provider/categories')}
            >
              Select Categories Now
            </Button>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Category Questionnaires
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Specific capability questions, platform support, and technical disclosures.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            variant="primary"
            size="sm"
            disabled={saving}
            className="flex items-center gap-1.5 self-start"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Category Answers'}</span>
          </Button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Answers saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {userCategories.map((sel) => {
            const cat = sel.category;
            const isCurrent = activeSelection?.id === sel.id;
            return (
              <button
                key={sel.id}
                type="button"
                onClick={() => loadCategoryDetail(sel)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Cat {cat?.number}: {cat?.name}</span>
                {sel.isPrimary && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    PRIMARY
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Form Sections */}
        {activeCategoryDefinition && (
          <DynamicForm
            sections={activeCategoryDefinition.sections || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onOtherChange={handleOtherChange}
            verifiedClaims={activeSelection?.verifiedClaims || []}
          />
        )}
      </div>
    </PageContainer>
  );
}

export default function CategoryFormsPage() {
  return (
    <React.Suspense
      fallback={
        <PageContainer>
          <div className="p-8 text-center text-slate-400">Loading category questionnaires...</div>
        </PageContainer>
      }
    >
      <CategoryFormsContent />
    </React.Suspense>
  );
}
