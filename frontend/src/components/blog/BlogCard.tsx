'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { BlogPost } from '../../types';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <div className="group rounded-2xl bg-brand-navy-card border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg overflow-hidden flex flex-col justify-between">
      <div>
        <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
              <BookOpen className="w-12 h-12" />
            </div>
          )}
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-brand-navy/90 text-brand-blue text-xs font-bold border border-slate-700 backdrop-blur-sm">
            {post.category || 'Forex Analysis'}
          </span>
        </div>

        <div className="p-5 space-y-2.5">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {post.readTime || 5} min read
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-brand-blue transition line-clamp-2 leading-snug">
            {post.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {post.excerpt || post.content.substring(0, 120) + '...'}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-blue-400 transition"
        >
          <span>Read Full Article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
