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
        <h1 className="text-2xl font-black text-navy flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange" />
          Reviews & Institutional Reputation
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Monitor verified trader feedback, ratings, and maintain brand trust with official corporate responses.
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="bg-white border border-border rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="text-center p-3.5 sm:p-4 rounded-2xl bg-orange/10 border border-orange/20 shrink-0">
            <div className="text-3xl font-black text-orange font-mono">
              {broker?.avgRating?.toFixed(1) || '4.8'}
            </div>
            <div className="flex items-center gap-1 justify-center mt-1 text-orange">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-orange" />
              ))}
            </div>
            <div className="text-[10px] text-text-muted mt-1">Public Rating</div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">Trust & Sentiment Metrics</h3>
            <p className="text-xs text-text-muted mt-0.5 max-w-md">
              Ratings are submitted by verified KYC account holders and vetted for regulatory accuracy.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
          <div className="text-xl font-bold text-navy font-mono">{reviews.length}</div>
          <div className="text-xs text-text-muted">Total Community Reviews</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl bg-border/40" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-soft">
            <MessageSquare className="w-12 h-12 text-border mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy">No Reviews Published Yet</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Trader reviews will appear here once verified users evaluate your spreads and execution speed.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-border rounded-3xl p-5 sm:p-6 shadow-soft space-y-3"
            >
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue/10 text-blue font-bold flex items-center justify-center text-xs shrink-0">
                    {r.user?.name?.[0] || 'T'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-heading">
                      {r.user?.name || 'Verified Trader'}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-orange">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-orange" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-text-body leading-relaxed">{r.comment || r.content}</p>

              {/* Broker Response */}
              {r.brokerResponse ? (
                <div className="p-3.5 rounded-2xl bg-surface-tint border border-blue/20 text-xs mt-2">
                  <div className="flex items-center gap-2 text-blue font-bold text-[11px] mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Official Response from {broker?.companyName || 'Broker'}</span>
                  </div>
                  <p className="text-text-body text-[11px]">{r.brokerResponse}</p>
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
                        className="w-full bg-white border border-border rounded-xl p-3 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
                      />
                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-surface-tint text-text-body hover:bg-border/60 rounded-full text-xs font-medium border border-border transition min-h-[40px] flex items-center justify-center"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(r.id)}
                          disabled={submittingReply}
                          className="w-full sm:w-auto px-5 py-2 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 min-h-[40px]"
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
                      className="text-xs font-bold text-blue hover:text-blue-hover flex items-center gap-1.5 transition min-h-[40px] py-1"
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
