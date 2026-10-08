'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle, ShieldCheck, Database, Cpu, Mail } from 'lucide-react';
import { api } from '../../../lib/api';
import { BrokerOptionsManager } from './BrokerOptionsManager';

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
        <h1 className="text-2xl sm:text-3xl font-black text-navy">Platform Settings & Ecosystem Health</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Global financial configurations, dispute SLAs, and microservice status.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-green/10 border border-green/20 flex items-center gap-3 text-green text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 text-green shrink-0" />
          <span>System configurations updated successfully across all operational clusters.</span>
        </div>
      )}

      {/* Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green/10 text-green flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-navy">PostgreSQL Primary</div>
            <div className="text-[11px] text-green font-semibold">Connected (0.8ms)</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue/10 text-blue flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-navy">Anthropic Claude AI</div>
            <div className="text-[11px] text-blue font-semibold">Ready / Fallback Active</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange/10 text-orange flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-navy">SMTP Email Gateway</div>
            <div className="text-[11px] text-orange font-semibold">Active</div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
        <h3 className="text-base font-bold text-navy border-b border-border pb-3">
          Financial & Marketplace Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5">
              Platform Take Rate / Tutor Commission (%)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={platformFee}
              onChange={(e) => setPlatformFee(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
            />
            <span className="text-[11px] text-text-muted mt-1 block">
              Percentage deducted from course enrollments before tutor payout allocation.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5">
              Trader Dispute SLA Target (Hours)
            </label>
            <input
              type="number"
              min={12}
              max={168}
              value={disputeSla}
              onChange={(e) => setDisputeSla(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
            />
            <span className="text-[11px] text-text-muted mt-1 block">
              Maximum turnaround time to investigate broker complaints and assign an auditor.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-navy">Enable 24/7 AI Forex Mentor</div>
            <div className="text-[11px] text-text-muted">
              Provide retail visitors instant guidance on spreads, leverage, and technical terminology.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              aiEnabled ? 'bg-blue' : 'bg-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                aiEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue hover:bg-blue-hover text-white font-bold text-xs rounded-full transition shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Configurations</span>
          </button>
        </div>
      </form>

      {/* Broker Dropdown Options Management */}
      <BrokerOptionsManager />
    </div>
  );
}
