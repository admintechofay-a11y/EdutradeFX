'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function BrokerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await api.getBrokerReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleReplyReview = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.replyBrokerReview(reviewId, replyText);
      if (res.success) {
        setSuccessMsg('Official broker reply posted successfully.');
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? { ...r, reply: { comment: replyText, repliedAt: new Date(), authorRole: 'broker' } }
              : r
          )
        );
        setReplyingId(null);
        setReplyText('');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/broker"
          className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-white">Verified Trader Reviews & Responses</h1>
        <p className="text-xs text-text-muted-dark mt-1">
          Monitor your customer reputation, view feedback from active account holders, and publish official corporate replies.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-text-muted-dark text-sm">
          Loading client reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-navy-surface border border-navy-border rounded-2xl space-y-3">
          <Star className="w-10 h-10 text-amber-400/50 mx-auto" />
          <h3 className="font-bold text-sm text-white">No Public Reviews Yet</h3>
          <p className="text-xs text-text-muted-dark max-w-sm mx-auto">
            When verified traders submit reviews on your public listing, they will appear here for audit and reply.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 rounded-2xl bg-navy-surface border border-navy-border space-y-3"
            >
              <div className="flex items-center justify-between border-b border-navy-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm text-white">{rev.user?.name || 'Verified Trader'}</div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-text-muted-dark">
                  {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              {rev.title && <div className="font-bold text-xs text-gold-primary">{rev.title}</div>}
              <div className="text-xs text-slate-300 leading-relaxed">{rev.comment}</div>

              {rev.reply ? (
                <div className="p-3.5 rounded-xl bg-gold-primary/5 border border-gold-primary/20 text-xs space-y-1">
                  <div className="flex items-center justify-between text-gold-primary font-bold text-[10px] uppercase tracking-wider">
                    <span>Official Broker Response</span>
                    <span className="font-normal text-text-muted-dark">
                      {new Date(rev.reply.repliedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{rev.reply.comment}</p>
                </div>
              ) : replyingId === rev._id ? (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write an official response on behalf of your brokerage..."
                    className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-white focus:outline-none focus:border-gold-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 rounded-md text-xs text-text-muted-dark hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplyReview(rev._id)}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-gold-primary text-navy-deepest font-bold text-xs hover:bg-gold-light transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submitting ? 'Publishing...' : 'Publish Official Reply'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setReplyingId(rev._id);
                      setReplyText('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-navy-deepest border border-navy-border text-xs text-gold-primary hover:border-gold-primary/50 transition-colors"
                  >
                    Post Official Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
