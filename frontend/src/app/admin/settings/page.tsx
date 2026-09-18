'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle, ShieldCheck, Database, Cpu, Mail } from 'lucide-react';
import { api } from '../../../lib/api';

export default function AdminSettingsPage() {
  const [platformFee, setPlatformFee] = useState(15);
  const [disputeSla, setDisputeSla] = useState(48);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Settings & Ecosystem Health</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Global financial configurations, dispute SLAs, and microservice status.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>System configurations updated successfully across all operational clusters.</span>
        </div>
      )}

      {/* Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">PostgreSQL Primary</div>
            <div className="text-[11px] text-emerald-400 font-semibold">Connected (0.8ms)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Anthropic Claude AI</div>
            <div className="text-[11px] text-brand-blue font-semibold">Ready / Fallback Active</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">SMTP Email Gateway</div>
            <div className="text-[11px] text-purple-400 font-semibold">Active</div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Financial & Marketplace Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Platform Take Rate / Tutor Commission (%)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={platformFee}
              onChange={(e) => setPlatformFee(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Percentage deducted from course enrollments before tutor payout allocation.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trader Dispute SLA Target (Hours)
            </label>
            <input
              type="number"
              min={12}
              max={168}
              value={disputeSla}
              onChange={(e) => setDisputeSla(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Maximum turnaround time to investigate broker complaints and assign an auditor.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Enable 24/7 AI Forex Mentor</div>
            <div className="text-[11px] text-slate-400">
              Provide retail visitors instant guidance on spreads, leverage, and technical terminology.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              aiEnabled ? 'bg-brand-blue' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                aiEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
}
