'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Building2,
  ShieldCheck,
  Star,
  Layers,
  MapPin,
  ArrowRight,
  Filter,
  Package,
  Globe,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../../lib/api';
import PageContainer from '../../../components/ui/PageContainer';
import Button from '../../../components/ui/Button';
import ClaimBadge from '../../../components/forms/ClaimBadge';

export default function SolutionsProvidersDirectoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const loadDirectoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [provResult, catResult] = await Promise.allSettled([
        api.get('/solutions-providers'),
        api.get('/solutions-providers/categories').catch(() => api.get('/provider-forms/categories')),
      ]);

      if (provResult.status === 'fulfilled') {
        const rawProv = provResult.value?.data?.data;
        const provList = Array.isArray(rawProv)
          ? rawProv
          : Array.isArray(rawProv?.items)
          ? rawProv.items
          : Array.isArray(rawProv?.providers)
          ? rawProv.providers
          : [];
        setProviders(provList);
      } else {
        console.warn('Solutions providers fetch warning:', provResult.reason);
        setProviders([]);
      }

      if (catResult.status === 'fulfilled') {
        const rawCat = catResult.value?.data?.data;
        const catList = Array.isArray(rawCat)
          ? rawCat
          : Array.isArray(rawCat?.categories)
          ? rawCat.categories
          : Array.isArray(rawCat?.items)
          ? rawCat.items
          : [];
        setCategories(catList);
      } else {
        console.warn('Categories fetch warning:', catResult.reason);
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Error loading solutions directory:', err);
      setError('Unable to load directory at this time. Please try again.');
      setProviders([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectoryData();
  }, []);

  const safeCategories = useMemo(() => {
    if (Array.isArray(categories)) return categories;
    if (Array.isArray((categories as any)?.categories)) return (categories as any).categories;
    if (Array.isArray((categories as any)?.items)) return (categories as any).items;
    return [];
  }, [categories]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    safeCategories.forEach((c: any) => {
      if (c && typeof c.number === 'number' && c.name) {
        map.set(c.number, c.name);
      }
    });
    return map;
  }, [safeCategories]);

  const filteredProviders = useMemo(() => {
    const list = Array.isArray(providers)
      ? providers
      : Array.isArray((providers as any)?.items)
      ? (providers as any).items
      : Array.isArray((providers as any)?.providers)
      ? (providers as any).providers
      : [];

    return list.filter((p: any) => {
      if (!p) return false;
      const isVerified = Boolean(p.verified || p.verificationStatus === 'VERIFIED');
      if (verifiedOnly && !isVerified) return false;

      if (selectedCategory) {
        const catNum = Number(selectedCategory);
        const matchesCategoryNumbers =
          Array.isArray(p.categoryNumbers) && p.categoryNumbers.includes(catNum);
        const matchesCategories =
          Array.isArray(p.categories) &&
          p.categories.some(
            (c: any) => c?.categoryNumber === catNum || c?.number === catNum
          );
        if (!matchesCategoryNumbers && !matchesCategories) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const brand = (p.brandName || p.name || '').toLowerCase();
        const tagline = (p.tagline || p.summary || p.overview || '').toLowerCase();
        if (!brand.includes(q) && !tagline.includes(q)) return false;
      }

      return true;
    });
  }, [providers, verifiedOnly, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <PageContainer>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Institutional Solutions Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified Enterprise FX Solutions Providers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Discover audited software bridges, liquidity aggregators, risk management systems, CRM platforms, and compliance infrastructure for regulated brokers and prop firms.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search solutions providers by name, tool, or capability..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
              >
                <option value="">All 10 Categories</option>
                {safeCategories.map((c: any) => (
                  <option key={c.id || c.number} value={c.number}>
                    Cat {c.number}: {c.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 select-none shrink-0">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Verified Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Provider Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-slate-200 h-64"></div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Solutions Providers Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {error || 'No providers match your filter criteria at this time.'}
            </p>
            {error && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDirectoryData}
                  className="inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((prov: any, index: number) => {
              if (!prov) return null;

              let cats: { number: number; name: string }[] = [];
              if (Array.isArray(prov.categories) && prov.categories.length > 0) {
                cats = prov.categories.map((c: any) => ({
                  number: c?.categoryNumber || c?.number || 0,
                  name:
                    c?.categoryName ||
                    c?.name ||
                    categoryNameMap.get(c?.categoryNumber || c?.number) ||
                    `Category ${c?.categoryNumber || c?.number || ''}`,
                }));
              } else if (Array.isArray(prov.categoryNumbers) && prov.categoryNumbers.length > 0) {
                cats = prov.categoryNumbers.map((num: number) => ({
                  number: num,
                  name: categoryNameMap.get(num) || `Category ${num}`,
                }));
              }

              const isVerified = Boolean(prov.verified || prov.verificationStatus === 'VERIFIED');
              const rawRating = prov.ratingAvg ?? prov.avgRating;
              const reviewCount = prov.ratingCount ?? prov.totalReviews ?? 0;
              const rating =
                rawRating && !isNaN(Number(rawRating)) && Number(rawRating) > 0
                  ? Number(rawRating).toFixed(1)
                  : null;

              const brandName = prov.brandName || prov.name || 'Solutions Provider';
              const tagline = prov.tagline || prov.summary || prov.overview || 'Enterprise solutions provider.';
              const country = prov.headquartersCountryCode || prov.country || 'Global';
              const slug = prov.slug || prov.providerId || prov.id || '';
              const cardKey = prov.id || prov.providerId || prov.slug || `prov-${index}`;

              return (
                <div
                  key={cardKey}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                        {prov.logo ? (
                          <img src={prov.logo} alt={brandName} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {prov.isFeatured && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        <ClaimBadge isVerified={isVerified} size="sm" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {brandName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tagline}
                      </p>
                    </div>

                    {/* Category Tags */}
                    {cats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cats.slice(0, 3).map((c: any) => (
                          <span
                            key={c.number || c.name}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                          >
                            {c.name}
                          </span>
                        ))}
                        {cats.length > 3 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 text-slate-400">
                            +{cats.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      {rating ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{rating}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unrated</span>
                      )}
                      <span>•</span>
                      <span>{country}</span>
                    </div>

                    <Link
                      href={`/solutions-providers/${slug}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
