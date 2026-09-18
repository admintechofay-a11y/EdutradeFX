'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { api } from '../../../lib/api';
import { BlogPost } from '../../../types';
import { BlogCard } from '../../../components/blog/BlogCard';
import { Pagination } from '../../../components/common/Pagination';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function BlogDirectoryPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
  });

  const categories = [
    'Market Analysis',
    'Broker Reviews & Scams',
    'Trading Psychology',
    'Technical Indicators',
    'Macroeconomics & Central Banks',
    'Crypto & Commodities',
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
      });

      const res = await api.get(`/blog?${params.toString()}`);
      setPosts(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, filters.category]);

  return (
    <div className="min-h-screen py-10 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-navy-light border border-slate-700 text-xs font-semibold text-brand-blue mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Market Intelligence & Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Forex Insights & Education
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Institutional macro analysis, regulatory updates, broker security exposés, and risk mitigation tutorials.
          </p>
        </div>

        {/* Filter bar */}
        <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                placeholder="Search market insights, brokers, or technical guides..."
                className="w-full pl-10 pr-4 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="No Articles Found"
            description="Try changing your search keywords or filter."
            actionLabel="Reset Search"
            onAction={() => {
              setFilters({ search: '', category: '' });
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
