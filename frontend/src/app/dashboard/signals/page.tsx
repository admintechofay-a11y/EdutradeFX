'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Plus, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, X, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { Signal, SignalDirection } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function SPSignalsTerminalPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Signal Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    instrument: 'EURUSD',
    direction: 'BUY' as SignalDirection,
    entryPrice: '',
    takeProfit: '',
    stopLoss: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Close Signal Modal
  const [closingSignal, setClosingSignal] = useState<Signal | null>(null);
  const [closeForm, setCloseForm] = useState({
    closedPrice: '',
    pipsGained: '',
  });
  const [closing, setClosing] = useState(false);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/signal-providers/my/signals');
      setSignals(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load signals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const title = newForm.title?.trim() || `${newForm.direction} ${newForm.instrument.toUpperCase()} Signal`;
      await api.post('/signal-providers/my/signals', {
        title,
        instrument: newForm.instrument.toUpperCase(),
        direction: newForm.direction,
        entryPrice: newForm.entryPrice ? parseFloat(newForm.entryPrice) : undefined,
        takeProfit: newForm.takeProfit ? parseFloat(newForm.takeProfit) : undefined,
        stopLoss: newForm.stopLoss ? parseFloat(newForm.stopLoss) : undefined,
        description: newForm.description?.trim() || undefined,
      });
      setIsNewModalOpen(false);
      setNewForm({
        title: '',
        instrument: 'EURUSD',
        direction: 'BUY',
        entryPrice: '',
        takeProfit: '',
        stopLoss: '',
        description: '',
      });
      fetchSignals();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to broadcast signal.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingSignal) return;
    setClosing(true);
    try {
      await api.patch(`/signal-providers/my/signals/${closingSignal.id}/close`, {
        closedPrice: parseFloat(closeForm.closedPrice),
        pipsGained: parseFloat(closeForm.pipsGained),
      });
      setClosingSignal(null);
      setCloseForm({ closedPrice: '', pipsGained: '' });
      fetchSignals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close signal.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">Signals Terminal</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Publish real-time trade signals with audited parameters and track your pips record.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover text-white font-bold text-xs rounded-full shadow-sm transition min-h-[42px]"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast New Signal</span>
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : signals.length > 0 ? (
        <div className="overflow-x-auto -mx-2 sm:mx-0 rounded-2xl sm:rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full min-w-[650px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint/60 text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Instrument / Type</th>
                <th className="p-4">Entry</th>
                <th className="p-4">Stop Loss</th>
                <th className="p-4">Take Profit</th>
                <th className="p-4">Status</th>
                <th className="p-4">Result</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {signals.map((sig) => {
                const isBuy = sig.direction === 'BUY';
                return (
                  <tr key={sig.id} className="hover:bg-surface-tint/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-text-heading">{sig.instrument}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 ${
                            isBuy
                              ? 'bg-green/10 text-green border border-green/20'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {sig.direction}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-text-heading">{sig.entryPrice || 'Market'}</td>
                    <td className="p-4 font-mono text-rose-500">{sig.stopLoss || 'N/A'}</td>
                    <td className="p-4 font-mono text-green">{sig.takeProfit || 'N/A'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          sig.status === 'ACTIVE'
                            ? 'bg-blue/10 text-blue'
                            : 'bg-surface-tint text-text-muted border border-border'
                        }`}
                      >
                        {sig.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      {sig.pipsGained !== null && sig.pipsGained !== undefined ? (
                        <span className={sig.pipsGained >= 0 ? 'text-green' : 'text-rose-500'}>
                          {sig.pipsGained >= 0 ? `+${sig.pipsGained}` : sig.pipsGained} Pips
                        </span>
                      ) : (
                        <span className="text-text-muted">Live</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {sig.status === 'ACTIVE' ? (
                        <button
                          onClick={() => {
                            setClosingSignal(sig);
                            setCloseForm({ closedPrice: sig.entryPrice?.toString() || '', pipsGained: '0' });
                          }}
                          className="px-3 py-1.5 rounded-full bg-surface-tint hover:bg-border/60 text-navy text-xs font-semibold transition"
                        >
                          Close Position
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Signals Broadcasted Yet"
          description="Send your first trade signal to your subscribers with automated Telegram alerts."
          actionLabel="Broadcast Signal"
          onAction={() => setIsNewModalOpen(true)}
        />
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        maxWidth="lg"
        title="Broadcast New Trade Signal"
        subtitle="Parameters will be audited and broadcast instantly."
      >
        <form onSubmit={handleCreateSignal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1">
              Setup Title <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              placeholder={`e.g. ${newForm.direction} ${newForm.instrument} Breakout Setup`}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Instrument</label>
              <input
                type="text"
                required
                value={newForm.instrument}
                onChange={(e) => setNewForm({ ...newForm, instrument: e.target.value.toUpperCase() })}
                placeholder="e.g. XAUUSD"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-heading placeholder-text-muted uppercase transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Direction</label>
              <select
                value={newForm.direction}
                onChange={(e) => setNewForm({ ...newForm, direction: e.target.value as SignalDirection })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-heading transition"
              >
                <option value="BUY">BUY / LONG</option>
                <option value="SELL">SELL / SHORT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                required
                value={newForm.entryPrice}
                onChange={(e) => setNewForm({ ...newForm, entryPrice: e.target.value })}
                placeholder="1.0850"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-500 mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                required
                value={newForm.stopLoss}
                onChange={(e) => setNewForm({ ...newForm, stopLoss: e.target.value })}
                placeholder="1.0820"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-green mb-1">Take Profit</label>
              <input
                type="number"
                step="any"
                required
                value={newForm.takeProfit}
                onChange={(e) => setNewForm({ ...newForm, takeProfit: e.target.value })}
                placeholder="1.0920"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1">Rationale / Note</label>
            <textarea
              rows={2}
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="e.g. 15m Liquidity grab of Asian session low with Bullish BOS..."
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted resize-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-full transition shadow-sm"
          >
            {submitting ? 'Broadcasting...' : 'Publish Live Signal'}
          </button>
        </form>
      </Modal>

      {/* Close Signal Modal */}
      <Modal
        isOpen={Boolean(closingSignal)}
        onClose={() => setClosingSignal(null)}
        maxWidth="md"
        title={closingSignal ? `Close ${closingSignal.instrument} Trade` : undefined}
        subtitle="Record exit price and net pips for audited win rate."
      >
        {closingSignal && (
          <form onSubmit={handleCloseSignal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                required
                value={closeForm.closedPrice}
                onChange={(e) => setCloseForm({ ...closeForm, closedPrice: e.target.value })}
                placeholder="e.g. 1.0890"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">Pips Gained (or Lost)</label>
              <input
                type="number"
                step="any"
                required
                value={closeForm.pipsGained}
                onChange={(e) => setCloseForm({ ...closeForm, pipsGained: e.target.value })}
                placeholder="e.g. 45 or -20"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>

            <button
              type="submit"
              disabled={closing}
              className="w-full py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-full transition shadow-sm"
            >
              {closing ? 'Settling...' : 'Confirm Trade Settlement'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
