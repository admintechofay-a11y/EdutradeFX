'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CornerDownRight,
  Send,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Clock,
  Building2,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function BrokerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [broker, setBroker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get('/brokers/my/profile');
      if (profileRes.data?.success && profileRes.data?.data) {
        const b = profileRes.data.data;
        setBroker(b);
        const reviewsRes = await api.get(`/brokers/${b.slug}/reviews`);
        if (reviewsRes.data?.success) {
          setReviews(reviewsRes.data.data?.reviews || reviewsRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const res = await api.post(`/brokers/reviews/${reviewId}/reply`, {
        reply: replyText.trim(),
      });
      if (res.data?.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, brokerResponse: replyText.trim() } : r
          )
        );
        setReplyingId(null);
        setReplyText('');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit review response.');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          Reviews & Institutional Reputation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor verified trader feedback, ratings, and maintain brand trust with official corporate responses.
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-3xl font-black text-amber-400 font-mono">
              {broker?.avgRating?.toFixed(1) || '4.8'}
            </div>
            <div className="flex items-center gap-1 justify-center mt-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Public Rating</div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Trust & Sentiment Metrics</h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Ratings are submitted by verified KYC account holders and vetted for regulatory accuracy.
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold text-white font-mono">{reviews.length}</div>
          <div className="text-xs text-slate-400">Total Community Reviews</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl bg-slate-800/40" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Reviews Published Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Trader reviews will appear here once verified users evaluate your spreads and execution speed.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-brand-navy-card border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-blue/20 text-brand-blue font-bold flex items-center justify-center text-xs">
                    {r.user?.name?.[0] || 'T'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {r.user?.name || 'Verified Trader'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{r.comment || r.content}</p>

              {/* Broker Response */}
              {r.brokerResponse ? (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs mt-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-[11px] mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Official Response from {broker?.companyName || 'Broker'}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{r.brokerResponse}</p>
                </div>
              ) : (
                <div className="pt-2">
                  {replyingId === r.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a formal corporate reply to this trader..."
                        className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(r.id)}
                          disabled={submittingReply}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>{submittingReply ? 'Submitting...' : 'Post Official Reply'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingId(r.id);
                        setReplyText('');
                      }}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Respond to Trader Feedback</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
