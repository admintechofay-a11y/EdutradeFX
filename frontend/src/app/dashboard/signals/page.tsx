'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  Plus,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  AlertCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Signal, SignalDirection, SignalProvider } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function SPSignalsTerminalPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [profile, setProfile] = useState<SignalProvider | null>(null);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [signalsRes, profileRes] = await Promise.allSettled([
        api.get('/signal-providers/my/signals'),
        api.get('/signal-providers/my/profile'),
      ]);

      if (signalsRes.status === 'fulfilled') {
        setSignals(signalsRes.value.data?.data || []);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data?.data || null);
      }
    } catch (err) {
      console.error('Failed to load signals terminal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isApproved = profile?.status === 'APPROVED' && profile?.onboardingStatus === 'SUBMITTED';

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      alert('Signal broadcasting requires an APPROVED account status.');
      return;
    }
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
      fetchData();
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

    if (!closeForm.closedPrice && !closeForm.pipsGained) {
      alert('Please specify either an Exit Price or Pips Gained to settle the signal.');
      return;
    }

    setClosing(true);
    try {
      await api.patch(`/signal-providers/my/signals/${closingSignal.id}/close`, {
        closedPrice: closeForm.closedPrice ? parseFloat(closeForm.closedPrice) : undefined,
        pipsGained: closeForm.pipsGained ? parseFloat(closeForm.pipsGained) : undefined,
      });
      setClosingSignal(null);
      setCloseForm({ closedPrice: '', pipsGained: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close signal.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Educational & Non-liability Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-surface-tint border border-border flex items-center justify-between gap-3 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue shrink-0" />
          <span>
            <strong className="text-text-heading">Educational Notice: </strong>
            All trade signals broadcasted on EdutradeFX are strictly for educational and informational purposes. Not financial advice.
          </span>
        </div>
      </div>

      {/* Compliance Lock Warning if NOT approved */}
      {!loading && !isApproved && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <div className="font-bold text-sm text-amber-900 mb-0.5">
                Broadcasting Locked — Account Verification Required
              </div>
              <p>
                To broadcast trade signals to traders, your profile and KYC documents must be audited and APPROVED by compliance.
                Current Status:{' '}
                <span className="font-mono font-bold uppercase underline">
                  {profile?.status || 'PENDING'} ({profile?.onboardingStatus || 'DRAFT'})
                </span>
                .
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/signal-provider/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shrink-0"
          >
            <span>Complete Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy flex items-center gap-2">
            <Radio className="w-6 h-6 text-green" />
            Signals Terminal & Execution Console
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Broadcast real-time trade signals with parameters and track your provider-reported pips record.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          disabled={!isApproved}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 bg-blue hover:bg-blue-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition min-h-[42px]"
          title={!isApproved ? 'Account must be APPROVED to broadcast signals' : undefined}
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
                <th className="p-4">Result (Reported)</th>
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
                      {sig.title && <div className="text-[11px] text-text-muted mt-0.5 truncate">{sig.title}</div>}
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
          description="Send your first trade signal to your subscribers with automated execution alerts."
          actionLabel={isApproved ? 'Broadcast Signal' : 'Complete Verification'}
          onAction={() => {
            if (isApproved) {
              setIsNewModalOpen(true);
            } else {
              window.location.href = '/dashboard/signal-provider/onboarding';
            }
          }}
        />
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        maxWidth="lg"
        title="Broadcast New Trade Signal"
        subtitle="Parameters will be locked upon publishing for audit integrity."
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
                value={newForm.entryPrice}
                onChange={(e) => setNewForm({ ...newForm, entryPrice: e.target.value })}
                placeholder="Market / Price"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-500 mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
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
                value={newForm.takeProfit}
                onChange={(e) => setNewForm({ ...newForm, takeProfit: e.target.value })}
                placeholder="1.0920"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1">Rationale / Notes</label>
            <textarea
              rows={2}
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="e.g. 15m Liquidity grab with Bullish BOS..."
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted resize-none transition"
            />
          </div>

          <p className="text-[11px] text-text-muted italic">
            Note: For audit integrity, Entry, Stop Loss, and Take Profit values cannot be edited after broadcasting.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm"
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
        subtitle="Record exit price or net pips for provider-reported win rate."
      >
        {closingSignal && (
          <form onSubmit={handleCloseSignal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Exit Price <span className="text-text-muted font-normal">(Optional if pips entered)</span>
              </label>
              <input
                type="number"
                step="any"
                value={closeForm.closedPrice}
                onChange={(e) => setCloseForm({ ...closeForm, closedPrice: e.target.value })}
                placeholder="e.g. 1.0890"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Pips Gained (or Lost) <span className="text-text-muted font-normal">(Required if exit price omitted)</span>
              </label>
              <input
                type="number"
                step="any"
                value={closeForm.pipsGained}
                onChange={(e) => setCloseForm({ ...closeForm, pipsGained: e.target.value })}
                placeholder="e.g. +45 or -20"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading placeholder-text-muted font-mono transition"
              />
            </div>

            <button
              type="submit"
              disabled={closing}
              className="w-full py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              {closing ? 'Settling...' : 'Confirm Trade Settlement'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
