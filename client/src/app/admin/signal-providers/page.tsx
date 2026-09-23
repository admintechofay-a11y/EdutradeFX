'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  X,
  Star,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { MOCK_SIGNAL_PROVIDERS } from '@/lib/mockData';
import { api } from '@/lib/api';

export default function AdminSignalProvidersPage() {
  const [providers, setProviders] = useState<any[]>(MOCK_SIGNAL_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any | null>(null);

  const loadProviders = async () => {
    try {
      const data = await api.getAdminSignalProviders();
      if (Array.isArray(data) && data.length > 0) {
        setProviders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadProviders();
  }, []);

  const handleApproval = async (id: string, approvalStatus: string) => {
    let reason = '';
    if (approvalStatus === 'rejected') {
      const input = prompt('Enter rejection reason for signal provider strategy:');
      if (!input) return;
      reason = input;
    }
    try {
      const res = await api.updateSignalProviderApproval(id, approvalStatus, reason);
      if (res.success) {
        setProviders((prev) =>
          prev.map((p) => (p._id === id ? { ...p, approvalStatus, rejectionReason: reason } : p))
        );
      }
    } catch (err) {
      setProviders((prev) =>
        prev.map((p) => (p._id === id ? { ...p, approvalStatus, rejectionReason: reason } : p))
      );
    }
  };

  // Form state
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [strategy, setStrategy] = useState('');
  const [markets, setMarkets] = useState('EUR/USD, GBP/USD, XAU/USD');
  const [subscriptionPrice, setSubscriptionPrice] = useState(49);
  const [winRate, setWinRate] = useState(82.0);
  const [monthlyRoi, setMonthlyRoi] = useState(20.5);
  const [maxDrawdown, setMaxDrawdown] = useState(6.0);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isFeatured, setIsFeatured] = useState(false);

  const openAddModal = () => {
    setEditingProvider(null);
    setName('');
    setProfileImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80');
    setStrategy('');
    setMarkets('EUR/USD, GBP/USD, XAU/USD');
    setSubscriptionPrice(49);
    setWinRate(82.0);
    setMonthlyRoi(20.5);
    setMaxDrawdown(6.0);
    setDescription('');
    setWebsite('');
    setContactEmail('');
    setStatus('active');
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProvider(p);
    setName(p.name);
    setProfileImage(p.profileImage);
    setStrategy(p.strategy);
    setMarkets(p.markets.join(', '));
    setSubscriptionPrice(p.subscriptionPrice);
    setWinRate(p.historicalPerformance?.winRate || 80);
    setMonthlyRoi(p.historicalPerformance?.monthlyRoi || 18);
    setMaxDrawdown(p.historicalPerformance?.maxDrawdown || 6);
    setDescription(p.description);
    setWebsite(p.website || '');
    setContactEmail(p.contactEmail || '');
    setStatus(p.status || 'active');
    setIsFeatured(!!p.isFeatured);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const marketArray = markets.split(',').map((m) => m.trim()).filter(Boolean);

    if (editingProvider) {
      setProviders(
        providers.map((p) =>
          p._id === editingProvider._id
            ? {
                ...p,
                name,
                profileImage,
                strategy,
                markets: marketArray,
                subscriptionPrice,
                description,
                website,
                contactEmail,
                status,
                isFeatured,
                historicalPerformance: {
                  ...p.historicalPerformance,
                  winRate,
                  monthlyRoi,
                  maxDrawdown,
                },
              }
            : p
        )
      );
    } else {
      const newProvider = {
        _id: 'sp-' + Date.now(),
        name,
        profileImage,
        strategy,
        markets: marketArray,
        subscriptionPrice,
        description,
        website,
        contactEmail,
        status,
        isFeatured,
        rating: 5.0,
        reviewsCount: 0,
        historicalPerformance: {
          winRate,
          monthlyRoi,
          maxDrawdown,
          totalPips: 8000,
          avgTradesPerMonth: 45,
          monthlySignals: 50,
          profitFactor: 2.5,
        },
        riskInfo: 'All signals include exact entry, TP, and SL.',
        disclaimer: 'Trading forex involves risk of capital loss.',
        reviews: [],
      };
      setProviders([newProvider, ...providers]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this signal provider?')) {
      setProviders(providers.filter((p) => p._id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setProviders(
      providers.map((p) =>
        p._id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
      )
    );
  };

  const toggleFeature = (id: string) => {
    setProviders(
      providers.map((p) => (p._id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Panel
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Signal Providers Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage real-time signal feeds, verify trading win rates, and configure monthly pricing.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-glow-gold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Signal Provider
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-surface/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Provider</th>
                <th className="p-4">Markets Traded</th>
                <th className="p-4">Performance (Win / ROI / DD)</th>
                <th className="p-4">Monthly Rate</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {providers.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.profileImage}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white">{p.name}</h4>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{p.strategy}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {p.markets.map((m) => (
                        <span key={m} className="badge-regulation text-[10px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        {p.historicalPerformance?.winRate}% Win
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-amber-400 font-bold">
                        +{p.historicalPerformance?.monthlyRoi}% Mo
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">
                        {p.historicalPerformance?.maxDrawdown}% DD
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-white">
                    ${p.subscriptionPrice}/mo
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleFeature(p._id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                        p.isFeatured
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {p.isFeatured ? 'FEATURED' : 'STANDARD'}
                    </button>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 w-fit ${
                        (p.approvalStatus || 'approved') === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : p.approvalStatus === 'pending'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : p.approvalStatus === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.approvalStatus || 'APPROVED'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.approvalStatus !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => handleApproval(p._id, 'approved')}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                          title="Approve Signal Provider Strategy"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApproval(p._id, 'suspended')}
                          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-[11px] transition-colors"
                          title="Suspend Strategy Feed"
                        >
                          Suspend
                        </button>
                      )}

                      {p.approvalStatus === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleApproval(p._id, 'rejected')}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] transition-colors"
                          title="Reject Strategy Submission"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-brand-surface border border-slate-700 text-amber-400 hover:border-amber-500/50 transition-all"
                        title="Edit Provider"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 rounded-lg bg-brand-surface border border-slate-700 text-rose-400 hover:border-rose-500/50 transition-all"
                        title="Delete Provider"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-2xl w-full rounded-3xl glass-card border border-slate-700 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProvider ? 'Edit Signal Provider' : 'Add New Signal Provider'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provider Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Subscription ($)</label>
                  <input
                    type="number"
                    value={subscriptionPrice}
                    onChange={(e) => setSubscriptionPrice(parseInt(e.target.value, 10))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Markets (Comma-separated)</label>
                <input
                  type="text"
                  value={markets}
                  onChange={(e) => setMarkets(e.target.value)}
                  placeholder="EUR/USD, GBP/USD, XAU/USD"
                  className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Win Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={winRate}
                    onChange={(e) => setWinRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly ROI (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={monthlyRoi}
                    onChange={(e) => setMonthlyRoi(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Drawdown (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxDrawdown}
                    onChange={(e) => setMaxDrawdown(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Profile Image URL</label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Strategy Summary</label>
                <input
                  type="text"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500"
                  />
                  Feature on Homepage
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status === 'active'}
                    onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                    className="rounded border-slate-700 text-emerald-500"
                  />
                  Active Status
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold shadow-glow-gold"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
