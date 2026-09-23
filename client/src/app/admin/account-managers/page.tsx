'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
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
import { MOCK_ACCOUNT_MANAGERS } from '@/lib/mockData';

export default function AdminAccountManagersPage() {
  const [managers, setManagers] = useState(MOCK_ACCOUNT_MANAGERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [experience, setExperience] = useState('8 Years');
  const [strategy, setStrategy] = useState('');
  const [minInvestment, setMinInvestment] = useState(5000);
  const [winRate, setWinRate] = useState(78.5);
  const [monthlyRoi, setMonthlyRoi] = useState(15.2);
  const [maxDrawdown, setMaxDrawdown] = useState(8.0);
  const [tradingStyle, setTradingStyle] = useState('Algorithmic/EA');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isFeatured, setIsFeatured] = useState(false);

  const openAddModal = () => {
    setEditingManager(null);
    setName('');
    setCompany('');
    setProfileImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setExperience('8 Years');
    setStrategy('');
    setMinInvestment(5000);
    setWinRate(78.5);
    setMonthlyRoi(15.2);
    setMaxDrawdown(8.0);
    setTradingStyle('Algorithmic/EA');
    setDescription('');
    setContactEmail('');
    setWebsite('');
    setStatus('active');
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (m: any) => {
    setEditingManager(m);
    setName(m.name);
    setCompany(m.company);
    setProfileImage(m.profileImage);
    setExperience(m.experience);
    setStrategy(m.strategy);
    setMinInvestment(m.minInvestment);
    setWinRate(m.historicalPerformance?.winRate || 75);
    setMonthlyRoi(m.historicalPerformance?.monthlyRoi || 12);
    setMaxDrawdown(m.historicalPerformance?.maxDrawdown || 8);
    setTradingStyle(m.tradingStyle);
    setDescription(m.description);
    setContactEmail(m.contactEmail);
    setWebsite(m.website || '');
    setStatus(m.status || 'active');
    setIsFeatured(!!m.isFeatured);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingManager) {
      setManagers(
        managers.map((m) =>
          m._id === editingManager._id
            ? {
                ...m,
                name,
                company,
                profileImage,
                experience,
                strategy,
                minInvestment,
                tradingStyle,
                description,
                contactEmail,
                website,
                status,
                isFeatured,
                historicalPerformance: {
                  ...m.historicalPerformance,
                  winRate,
                  monthlyRoi,
                  maxDrawdown,
                },
              }
            : m
        )
      );
    } else {
      const newManager = {
        _id: 'am-' + Date.now(),
        name,
        company,
        profileImage,
        experience,
        strategy,
        minInvestment,
        tradingStyle,
        description,
        contactEmail,
        website,
        status,
        isFeatured,
        rating: 5.0,
        reviewsCount: 0,
        historicalPerformance: {
          winRate,
          monthlyRoi,
          maxDrawdown,
          totalPips: 5000,
          avgTradesPerMonth: 30,
          totalAum: '$1.0M',
          profitFactor: 2.2,
        },
        riskInfo: 'Standard 1-2% max risk per trade.',
        disclaimer: 'Past performance does not guarantee future results.',
        reviews: [],
      };
      setManagers([newManager, ...managers]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this account manager?')) {
      setManagers(managers.filter((m) => m._id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setManagers(
      managers.map((m) =>
        m._id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
    );
  };

  const toggleFeature = (id: string) => {
    setManagers(
      managers.map((m) => (m._id === id ? { ...m, isFeatured: !m.isFeatured } : m))
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
          <h1 className="text-2xl sm:text-3xl font-black text-white">Account Managers Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage institutional PAMM/MAM managers, verify audited track records, and toggle feature status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-glow-gold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Account Manager
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-surface/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Manager & Company</th>
                <th className="p-4">Style & Exp</th>
                <th className="p-4">Performance (Win / ROI / DD)</th>
                <th className="p-4">Min Deposit</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {managers.map((m) => (
                <tr key={m._id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.profileImage}
                        alt={m.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white">{m.name}</h4>
                        <span className="text-[11px] text-slate-400">{m.company}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="badge-regulation text-[10px] block w-fit mb-1">
                      {m.tradingStyle}
                    </span>
                    <span className="text-slate-400 text-[11px]">{m.experience}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        {m.historicalPerformance?.winRate}% Win
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-amber-400 font-bold">
                        +{m.historicalPerformance?.monthlyRoi}% Mo
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">
                        {m.historicalPerformance?.maxDrawdown}% DD
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-white">
                    ${m.minInvestment?.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleFeature(m._id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                        m.isFeatured
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m.isFeatured ? 'FEATURED' : 'STANDARD'}
                    </button>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(m._id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        m.status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      {m.status?.toUpperCase()}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-2 rounded-lg bg-brand-surface border border-slate-700 text-amber-400 hover:border-amber-500/50 transition-all"
                        title="Edit Manager"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-2 rounded-lg bg-brand-surface border border-slate-700 text-rose-400 hover:border-rose-500/50 transition-all"
                        title="Delete Manager"
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
                {editingManager ? 'Edit Account Manager' : 'Add New Account Manager'}
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
                  <label className="block text-slate-300 font-semibold mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trading Style</label>
                  <select
                    value={tradingStyle}
                    onChange={(e) => setTradingStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Algorithmic/EA">Algorithmic/EA</option>
                    <option value="Scalping">Scalping</option>
                    <option value="Swing">Swing</option>
                    <option value="Day Trading">Day Trading</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none"
                  />
                </div>
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
                <label className="block text-slate-300 font-semibold mb-1">Core Strategy</label>
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
                  Save Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
