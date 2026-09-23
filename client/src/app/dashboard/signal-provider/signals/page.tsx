'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SignalManagementPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeForm, setCloseForm] = useState({ result: 'profit', resultPips: 30 });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Signal Form State
  const [newSignal, setNewSignal] = useState({
    pair: 'EUR/USD',
    type: 'BUY',
    timeframe: 'H1',
    entryPrice: 1.0850,
    stopLoss: 1.0810,
    takeProfit1: 1.0920,
    takeProfit2: 1.0980,
    notes: 'Liquidity sweep at Asian session low with confirmation fair value gap fill.',
  });

  const loadSignals = async () => {
    try {
      const data = await api.getMySignals();
      setSignals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, []);

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await api.createSignal(newSignal);
      if (res.success) {
        setFeedback({ type: 'success', text: `Signal ${newSignal.type} ${newSignal.pair} published live!` });
        setShowCreateModal(false);
        loadSignals();
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to post signal.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error posting signal.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSignal = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await api.updateSignal(id, {
        status: 'closed',
        result: closeForm.result,
        resultPips: Number(closeForm.resultPips),
        closedAt: new Date().toISOString(),
      });
      if (res.success) {
        setFeedback({ type: 'success', text: 'Trade position marked closed and recorded to track record.' });
        setClosingId(null);
        loadSignals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSignal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this signal?')) return;
    try {
      const res = await api.deleteSignal(id);
      if (res.success) {
        setSignals((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSignals = signals.filter((s) => {
    if (filter === 'active') return s.status === 'active';
    if (filter === 'closed') return s.status === 'closed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/signal-provider"
            className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-white">Trade Signal Operations</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Dispatch high-probability trading alerts with precision stop-loss and multiple profit targets.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-brand-darkest font-bold text-xs uppercase tracking-wider shadow-glow-green transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Signal</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-border pb-3">
        {(['all', 'active', 'closed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filter === tab
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-text-muted-dark hover:text-white'
            }`}
          >
            {tab} Signals ({signals.filter((s) => (tab === 'all' ? true : s.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Signals List */}
      {loading ? (
        <div className="p-12 text-center text-text-muted-dark text-sm">
          Loading signal stream...
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="p-12 text-center bg-navy-surface border border-navy-border rounded-2xl space-y-3">
          <Zap className="w-10 h-10 text-text-muted-dark mx-auto" />
          <h3 className="font-bold text-sm text-white">No Signals Found</h3>
          <p className="text-xs text-text-muted-dark max-w-sm mx-auto">
            Click "Post New Signal" to publish an order setup to your subscribers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSignals.map((sig) => (
            <div
              key={sig._id}
              className="p-5 rounded-2xl bg-navy-surface border border-navy-border space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-border pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      sig.type === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {sig.type}
                  </span>
                  <div>
                    <span className="font-bold text-base text-white font-mono mr-2">
                      {sig.pair}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-navy-deepest text-text-muted-dark border border-navy-border font-mono">
                      {sig.timeframe || 'H1'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      sig.status === 'active'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : sig.result === 'profit'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : sig.result === 'loss'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {sig.status === 'active' ? '● LIVE ORDER' : `CLOSED (${sig.result?.toUpperCase()})`}
                  </span>

                  {sig.resultPips !== undefined && sig.status === 'closed' && (
                    <span
                      className={`font-mono text-xs font-bold ${
                        sig.resultPips >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sig.resultPips >= 0 ? `+${sig.resultPips}` : sig.resultPips} Pips
                    </span>
                  )}

                  <span className="text-[11px] text-text-muted-dark">
                    {new Date(sig.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Price Targets Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-navy-deepest border border-navy-border/70">
                  <span className="text-[10px] text-text-muted-dark uppercase block">Entry</span>
                  <span className="font-mono font-bold text-white text-sm">{sig.entryPrice}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-deepest border border-navy-border/70">
                  <span className="text-[10px] text-rose-400 uppercase block">Stop Loss</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">{sig.stopLoss}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-deepest border border-navy-border/70">
                  <span className="text-[10px] text-emerald-400 uppercase block">Take Profit 1</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{sig.takeProfit1}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-deepest border border-navy-border/70">
                  <span className="text-[10px] text-emerald-400 uppercase block">Take Profit 2</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {sig.takeProfit2 || 'Open'}
                  </span>
                </div>
              </div>

              {sig.notes && (
                <div className="text-xs text-text-muted-dark bg-navy-deepest/50 p-2.5 rounded-lg border border-navy-border/40">
                  <strong className="text-white font-semibold">Setup Analysis:</strong> {sig.notes}
                </div>
              )}

              {/* Actions & Closing Modal Inline */}
              {closingId === sig._id ? (
                <div className="p-3.5 rounded-xl bg-navy-deepest border border-gold-primary/30 space-y-3">
                  <div className="text-xs font-bold text-gold-primary uppercase">
                    Close Position & Record Result
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-text-muted-dark mb-1">
                        Trade Outcome
                      </label>
                      <select
                        value={closeForm.result}
                        onChange={(e) => setCloseForm({ ...closeForm, result: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-navy-surface border border-navy-border text-xs text-white"
                      >
                        <option value="profit">Take Profit Reached (Profit)</option>
                        <option value="loss">Stop Loss Hit (Loss)</option>
                        <option value="breakeven">Breakeven / Neutral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-text-muted-dark mb-1">
                        Realized Pips (positive or negative)
                      </label>
                      <input
                        type="number"
                        value={closeForm.resultPips}
                        onChange={(e) => setCloseForm({ ...closeForm, resultPips: Number(e.target.value) })}
                        placeholder="+35"
                        className="w-full px-3 py-1.5 rounded-lg bg-navy-surface border border-navy-border text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setClosingId(null)}
                      className="px-3 py-1 rounded-md text-xs text-text-muted-dark hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCloseSignal(sig._id)}
                      disabled={submitting}
                      className="px-4 py-1.5 rounded-md bg-emerald-500 text-brand-darkest font-bold text-xs uppercase"
                    >
                      {submitting ? 'Updating...' : 'Confirm Close'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleDeleteSignal(sig._id)}
                    className="text-xs text-text-muted-dark hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  {sig.status === 'active' && (
                    <button
                      onClick={() => {
                        setClosingId(sig._id);
                        setCloseForm({ result: 'profit', resultPips: 25 });
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Close Trade Position
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Signal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-navy-surface border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Broadcast New Trade Signal
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted-dark hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSignal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                    Currency Pair / Asset
                  </label>
                  <select
                    value={newSignal.pair}
                    onChange={(e) => setNewSignal({ ...newSignal, pair: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-white"
                  >
                    <option value="EUR/USD">EUR/USD</option>
                    <option value="GBP/USD">GBP/USD</option>
                    <option value="USD/JPY">USD/JPY</option>
                    <option value="AUD/USD">AUD/USD</option>
                    <option value="USD/CAD">USD/CAD</option>
                    <option value="XAU/USD">XAU/USD (Gold)</option>
                    <option value="BTC/USD">BTC/USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                    Order Action
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewSignal({ ...newSignal, type: 'BUY' })}
                      className={`py-2 rounded-lg text-xs font-bold ${
                        newSignal.type === 'BUY'
                          ? 'bg-emerald-500 text-brand-darkest'
                          : 'bg-navy-deepest text-text-muted-dark border border-navy-border'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSignal({ ...newSignal, type: 'SELL' })}
                      className={`py-2 rounded-lg text-xs font-bold ${
                        newSignal.type === 'SELL'
                          ? 'bg-rose-500 text-white'
                          : 'bg-navy-deepest text-text-muted-dark border border-navy-border'
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-text-muted-dark mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newSignal.entryPrice}
                    onChange={(e) => setNewSignal({ ...newSignal, entryPrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-rose-400 mb-1">Stop Loss (SL)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newSignal.stopLoss}
                    onChange={(e) => setNewSignal({ ...newSignal, stopLoss: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-emerald-400 mb-1">Take Profit (TP1)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newSignal.takeProfit1}
                    onChange={(e) => setNewSignal({ ...newSignal, takeProfit1: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted-dark mb-1">
                  Setup Analysis & Invalidation Notes
                </label>
                <textarea
                  rows={3}
                  value={newSignal.notes}
                  onChange={(e) => setNewSignal({ ...newSignal, notes: e.target.value })}
                  placeholder="Explain confluence: Order block, liquidity grab, 4H break of structure..."
                  className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-text-muted-dark hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-brand-darkest font-bold text-xs uppercase shadow-glow-green disabled:opacity-50"
                >
                  {submitting ? 'Transmitting...' : 'Transmit Signal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
