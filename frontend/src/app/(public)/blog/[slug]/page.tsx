'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Share2, Tag, BookOpen, Eye } from 'lucide-react';
import { api } from '../../../../lib/api';
import { BlogPost } from '../../../../types';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/blog/${slug}`);
        setPost(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load blog post', err);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-text-heading mb-2">Article Not Found</h2>
        <p className="text-text-muted mb-6">The requested market analysis article does not exist or has been removed.</p>
        <Link
          href="/blog"
          className="px-6 py-2.5 bg-blue text-white rounded-full text-sm font-semibold hover:bg-blue-hover transition"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen py-12 text-text-body bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-blue transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Articles</span>
        </Link>

        {/* Category & Title */}
        <div className="space-y-4 mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue text-xs font-bold border border-blue-200">
            {post.category}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-text-heading leading-tight">
            {post.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-text-muted flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue border border-blue-200 flex items-center justify-center font-bold">
                {post.author?.name ? post.author.name[0].toUpperCase() : 'E'}
              </div>
              <div>
                <span className="font-semibold text-text-heading">{post.author?.name || 'EdutradeFX Research'}</span>
                <div className="text-[11px] text-text-muted">Forex Analyst</div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime || 5} min read
              </span>
              {(post.viewCount || post.views || 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.viewCount || post.views} views
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-video bg-surface-tint mb-8 sm:mb-10 shadow-soft border border-border">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="prose max-w-none text-text-body text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line space-y-6 break-words">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-text-muted" />
            {post.tags.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-surface-tint text-text-body text-xs border border-border"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
