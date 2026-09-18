'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Plus, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, X, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { Signal, SignalDirection } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function SPSignalsTerminalPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Signal Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
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
      await api.post('/signal-providers/my/signals', {
        ...newForm,
        entryPrice: newForm.entryPrice ? parseFloat(newForm.entryPrice) : undefined,
        takeProfit: newForm.takeProfit ? parseFloat(newForm.takeProfit) : undefined,
        stopLoss: newForm.stopLoss ? parseFloat(newForm.stopLoss) : undefined,
      });
      setIsNewModalOpen(false);
      setNewForm({
        instrument: 'EURUSD',
        direction: 'BUY',
        entryPrice: '',
        takeProfit: '',
        stopLoss: '',
        description: '',
      });
      fetchSignals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to broadcast signal.');
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Signals Terminal</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish real-time trade signals with audited parameters and track your pips record.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast New Signal</span>
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : signals.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-brand-navy-card shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-navy-light/40 text-slate-400 text-xs uppercase font-bold">
                <th className="p-4">Instrument / Type</th>
                <th className="p-4">Entry</th>
                <th className="p-4">Stop Loss</th>
                <th className="p-4">Take Profit</th>
                <th className="p-4">Status</th>
                <th className="p-4">Result</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {signals.map((sig) => {
                const isBuy = sig.direction === 'BUY';
                return (
                  <tr key={sig.id} className="hover:bg-brand-navy-light/20 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">{sig.instrument}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 ${
                            isBuy
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {sig.direction}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-white">{sig.entryPrice || 'Market'}</td>
                    <td className="p-4 font-mono text-rose-400">{sig.stopLoss || 'N/A'}</td>
                    <td className="p-4 font-mono text-emerald-400">{sig.takeProfit || 'N/A'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          sig.status === 'ACTIVE'
                            ? 'bg-brand-blue/15 text-brand-blue'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sig.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      {sig.pipsGained !== null && sig.pipsGained !== undefined ? (
                        <span className={sig.pipsGained >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {sig.pipsGained >= 0 ? `+${sig.pipsGained}` : sig.pipsGained} Pips
                        </span>
                      ) : (
                        <span className="text-slate-500">Live</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {sig.status === 'ACTIVE' ? (
                        <button
                          onClick={() => {
                            setClosingSignal(sig);
                            setCloseForm({ closedPrice: sig.entryPrice?.toString() || '', pipsGained: '0' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          Close Position
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Settled</span>
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
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-brand-navy-card border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateSignal} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Broadcast New Trade Signal</h3>
                <p className="text-xs text-slate-400 mt-0.5">Parameters will be audited and broadcast instantly.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instrument</label>
                  <input
                    type="text"
                    required
                    value={newForm.instrument}
                    onChange={(e) => setNewForm({ ...newForm, instrument: e.target.value.toUpperCase() })}
                    placeholder="e.g. XAUUSD"
                    className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs font-bold text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Direction</label>
                  <select
                    value={newForm.direction}
                    onChange={(e) => setNewForm({ ...newForm, direction: e.target.value as SignalDirection })}
                    className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs font-bold text-white"
                  >
                    <option value="BUY">BUY / LONG</option>
                    <option value="SELL">SELL / SHORT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newForm.entryPrice}
                    onChange={(e) => setNewForm({ ...newForm, entryPrice: e.target.value })}
                    placeholder="1.0850"
                    className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newForm.stopLoss}
                    onChange={(e) => setNewForm({ ...newForm, stopLoss: e.target.value })}
                    placeholder="1.0820"
                    className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newForm.takeProfit}
                    onChange={(e) => setNewForm({ ...newForm, takeProfit: e.target.value })}
                    placeholder="1.0920"
                    className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rationale / Note</label>
                <textarea
                  rows={2}
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="e.g. 15m Liquidity grab of Asian session low with Bullish BOS..."
                  className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
              >
                {submitting ? 'Broadcasting...' : 'Publish Live Signal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Close Signal Modal */}
      {closingSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-navy-card border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setClosingSignal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCloseSignal} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Close {closingSignal.instrument} Trade</h3>
                <p className="text-xs text-slate-400 mt-0.5">Record exit price and net pips for audited win rate.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={closeForm.closedPrice}
                  onChange={(e) => setCloseForm({ ...closeForm, closedPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pips Gained (or Lost)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={closeForm.pipsGained}
                  onChange={(e) => setCloseForm({ ...closeForm, pipsGained: e.target.value })}
                  placeholder="e.g. 45 or -20"
                  className="w-full px-3 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={closing}
                className="w-full py-3 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
              >
                {closing ? 'Settling...' : 'Confirm Trade Settlement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
