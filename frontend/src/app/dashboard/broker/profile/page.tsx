'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Skeleton } from '../../../../components/common/Skeleton';

export default function BrokerProfileEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [yearFounded, setYearFounded] = useState('');
  const [minDeposit, setMinDeposit] = useState('');
  const [maxLeverage, setMaxLeverage] = useState('');
  const [spreadsFrom, setSpreadsFrom] = useState('');
  const [commissions, setCommissions] = useState('');
  const [regulation, setRegulation] = useState('');
  const [tradingPlatforms, setTradingPlatforms] = useState('');
  const [accountTypes, setAccountTypes] = useState('');
  const [depositMethods, setDepositMethods] = useState('');
  const [withdrawMethods, setWithdrawMethods] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/brokers/my/profile');
        if (res.data?.success && res.data?.data) {
          const b = res.data.data;
          setCompanyName(b.companyName || '');
          setWebsite(b.website || '');
          setDescription(b.description || '');
          setHeadquarters(b.headquarters || '');
          setYearFounded(b.yearFounded ? String(b.yearFounded) : '');
          setMinDeposit(b.minDeposit !== undefined ? String(b.minDeposit) : '0');
          setMaxLeverage(b.maxLeverage || '1:500');
          setSpreadsFrom(b.spreadsFrom || '0.0 pips');
          setCommissions(b.commissions || '$3.50 per lot');
          setRegulation(Array.isArray(b.regulation) ? b.regulation.join(', ') : b.regulation || '');
          setTradingPlatforms(
            Array.isArray(b.tradingPlatforms) ? b.tradingPlatforms.join(', ') : b.tradingPlatforms || ''
          );
          setAccountTypes(
            Array.isArray(b.accountTypes) ? b.accountTypes.join(', ') : b.accountTypes || ''
          );
          setDepositMethods(
            Array.isArray(b.depositMethods) ? b.depositMethods.join(', ') : b.depositMethods || ''
          );
          setWithdrawMethods(
            Array.isArray(b.withdrawMethods) ? b.withdrawMethods.join(', ') : b.withdrawMethods || ''
          );
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload = {
        companyName,
        website,
        description,
        headquarters,
        yearFounded: yearFounded ? parseInt(yearFounded, 10) : undefined,
        minDeposit: minDeposit ? parseFloat(minDeposit) : 0,
        maxLeverage,
        spreadsFrom,
        commissions,
        regulation: regulation.split(',').map((s) => s.trim()).filter(Boolean),
        tradingPlatforms: tradingPlatforms.split(',').map((s) => s.trim()).filter(Boolean),
        accountTypes: accountTypes.split(',').map((s) => s.trim()).filter(Boolean),
        depositMethods: depositMethods.split(',').map((s) => s.trim()).filter(Boolean),
        withdrawMethods: withdrawMethods.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await api.put('/brokers/my/profile', payload);
      if (res.data?.success) {
        setSuccessMsg('Broker corporate profile updated successfully.');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update broker profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            Firm Profile & Regulatory Disclosures
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure institutional trading terms, regulatory bodies, platform features, and account options.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Corporate Information */}
        <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Corporate Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brokerage Brand Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Website URL
              </label>
              <input
                type="url"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Global Headquarters
              </label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="e.g. Sydney, Australia"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Year Founded
              </label>
              <input
                type="number"
                value={yearFounded}
                onChange={(e) => setYearFounded(e.target.value)}
                placeholder="2010"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Firm Overview & Value Proposition
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight liquidity depth, execution speed, institutional features..."
              className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Regulatory & Trading Conditions */}
        <div className="bg-brand-navy-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Trading Conditions & Regulatory Licenses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Minimum Deposit ($)
              </label>
              <input
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(e.target.value)}
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maximum Leverage
              </label>
              <input
                type="text"
                value={maxLeverage}
                onChange={(e) => setMaxLeverage(e.target.value)}
                placeholder="1:500"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Spreads From
              </label>
              <input
                type="text"
                value={spreadsFrom}
                onChange={(e) => setSpreadsFrom(e.target.value)}
                placeholder="0.0 pips"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Commissions
              </label>
              <input
                type="text"
                value={commissions}
                onChange={(e) => setCommissions(e.target.value)}
                placeholder="$3.50 per lot"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Regulatory Licenses (comma separated)
              </label>
              <input
                type="text"
                value={regulation}
                onChange={(e) => setRegulation(e.target.value)}
                placeholder="FCA, ASIC, CySEC, DFSA"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Trading Platforms (comma separated)
              </label>
              <input
                type="text"
                value={tradingPlatforms}
                onChange={(e) => setTradingPlatforms(e.target.value)}
                placeholder="MetaTrader 4, MetaTrader 5, cTrader, TradingView"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Types (comma separated)
              </label>
              <input
                type="text"
                value={accountTypes}
                onChange={(e) => setAccountTypes(e.target.value)}
                placeholder="Razor Account, Standard Account, Islamic Swap-Free"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Deposit Methods (comma separated)
              </label>
              <input
                type="text"
                value={depositMethods}
                onChange={(e) => setDepositMethods(e.target.value)}
                placeholder="Visa/Mastercard, Wire Transfer, Neteller, Skrill"
                className="w-full bg-brand-navy-light/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Updates...' : 'Save Firm Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
