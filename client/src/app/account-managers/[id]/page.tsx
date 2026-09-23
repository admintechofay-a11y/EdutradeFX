'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Star,
  ExternalLink,
  Mail,
  TrendingUp,
  Percent,
  ArrowDownRight,
  Activity,
  Award,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  Send,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { MOCK_ACCOUNT_MANAGERS } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';

export default function AccountManagerDetailPage({ params }: { params: { id: string } }) {
  const manager = MOCK_ACCOUNT_MANAGERS.find((m) => m._id === params.id) || MOCK_ACCOUNT_MANAGERS[0];
  const { isAuthenticated, user } = useAuth();

  const [reviews, setReviews] = useState(manager?.reviews || []);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!manager) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Account Manager Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">The requested manager profile does not exist.</p>
        <Link
          href="/account-managers"
          className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500 text-brand-darkest text-xs font-bold"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    const newReview = {
      _id: 'rv-' + Date.now(),
      userName: user ? user.name : 'Verified Trader',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
      rating,
      title,
      comment,
      createdAt: 'Just now',
    };

    setReviews([newReview, ...reviews]);
    setTitle('');
    setComment('');
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link
        href="/account-managers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Account Managers
      </Link>

      {/* Profile Header */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={manager.profileImage}
                alt={manager.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-emerald-500/50 shadow-glow-green"
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-brand-darkest rounded-full p-1 shadow-md"
                title="Audited Institutional Manager"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-regulation text-xs">{manager.tradingStyle}</span>
                <span className="badge-green text-xs">{manager.experience} Experience</span>
                {manager.isFeatured && <span className="badge-gold text-xs">Featured Strategy</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {manager.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 font-medium">{manager.company}</p>

              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white text-sm">{manager.rating}</span>
                <span className="text-slate-500 font-normal">
                  ({manager.reviewsCount} verified reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {manager.website && (
              <a
                href={manager.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-brand-surface hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Website
              </a>
            )}
            <a
              href={`mailto:${manager.contactEmail}`}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 text-brand-darkest font-bold text-xs flex items-center gap-1.5 shadow-glow-gold hover:opacity-90 transition-all"
            >
              <Mail className="w-4 h-4" />
              Request Allocation
            </a>
          </div>
        </div>

        {/* Audited Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-8">
          <div className="bg-brand-surface/70 rounded-2xl p-4 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Win Rate
            </span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {manager.historicalPerformance.winRate}%
            </span>
          </div>

          <div className="bg-brand-surface/70 rounded-2xl p-4 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Monthly ROI
            </span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              +{manager.historicalPerformance.monthlyRoi}%
            </span>
          </div>

          <div className="bg-brand-surface/70 rounded-2xl p-4 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              Max Drawdown
            </span>
            <span className="text-xl font-black text-slate-200 mt-1 block">
              {manager.historicalPerformance.maxDrawdown}%
            </span>
          </div>

          <div className="bg-brand-surface/70 rounded-2xl p-4 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Total Pips
            </span>
            <span className="text-xl font-black text-cyan-400 mt-1 block">
              +{manager.historicalPerformance.totalPips.toLocaleString()}
            </span>
          </div>

          <div className="bg-brand-surface/70 rounded-2xl p-4 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              Profit Factor
            </span>
            <span className="text-xl font-black text-purple-400 mt-1 block">
              {manager.historicalPerformance.profitFactor}
            </span>
          </div>

          <div className="bg-brand-surface/70 rounded-2xl p-4 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Min Investment
            </span>
            <span className="text-xl font-black text-white mt-1 block">
              ${manager.minInvestment.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Details: Strategy & Risk Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Investment Strategy & Methodology</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {manager.description}
            </p>
            <div className="rounded-xl bg-brand-surface/80 border border-slate-800 p-4 mt-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Core Execution Mechanics
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{manager.strategy}</p>
            </div>
          </div>

          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Risk Management Architecture
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{manager.riskInfo}</p>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">{manager.disclaimer}</p>
              </div>
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Client Reviews & Feedback
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verified reviews from investors currently allocated to this manager
                </p>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No reviews yet. Be the first to review this manager.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="rounded-xl bg-brand-surface/60 border border-slate-800/80 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                          alt={rev.userName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <span className="text-xs font-bold text-white">{rev.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200">{rev.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">{rev.createdAt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Review Submission Form */}
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3">Write a Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {submitted && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
                      Thank you. Your review has been recorded.
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Review Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Consistent returns and tight risk control"
                      className="w-full px-3.5 py-2 rounded-xl bg-brand-surface border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Detailed Experience
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Describe your experience with this manager’s execution and communication..."
                      className="w-full px-3.5 py-2 rounded-xl bg-brand-surface border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-gold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="rounded-xl bg-brand-surface/80 border border-slate-800 p-5 text-center space-y-2">
                  <Lock className="w-5 h-5 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">
                    You must be logged in to submit a verified manager review.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block mt-2 px-4 py-1.5 rounded-lg bg-amber-500 text-brand-darkest text-xs font-bold"
                  >
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Allocation Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total AUM</span>
                <span className="font-bold text-white">{manager.historicalPerformance.totalAum}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Monthly Avg Trades</span>
                <span className="font-bold text-white">
                  {manager.historicalPerformance.avgTradesPerMonth} trades
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Trading Style</span>
                <span className="font-bold text-amber-400">{manager.tradingStyle}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-400 capitalize">{manager.status}</span>
              </div>
            </div>

            <a
              href={`mailto:${manager.contactEmail}`}
              className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-darkest font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-green"
            >
              <Mail className="w-4 h-4" />
              Contact Manager
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
