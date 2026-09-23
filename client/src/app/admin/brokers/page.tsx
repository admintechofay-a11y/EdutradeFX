'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Scale,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShieldCheck,
  AlertTriangle,
  X,
  Search,
} from 'lucide-react';
import { MOCK_BROKERS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function AdminBrokersPage() {
  const [brokers, setBrokers] = useState<any[]>(MOCK_BROKERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<any | null>(null);

  const loadBrokers = async () => {
    try {
      const data = await api.getAdminBrokers();
      if (Array.isArray(data) && data.length > 0) {
        setBrokers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadBrokers();
  }, []);

  const handleApproval = async (id: string, approvalStatus: string) => {
    let reason = '';
    if (approvalStatus === 'rejected') {
      const input = prompt('Enter rejection reason for broker compliance file:');
      if (!input) return;
      reason = input;
    }
    try {
      const res = await api.updateBrokerApproval(id, approvalStatus, reason);
      if (res.success) {
        setBrokers((prev) =>
          prev.map((b) => (b._id === id ? { ...b, approvalStatus, rejectionReason: reason } : b))
        );
      }
    } catch (err) {
      setBrokers((prev) =>
        prev.map((b) => (b._id === id ? { ...b, approvalStatus, rejectionReason: reason } : b))
      );
    }
  };

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [safetyScore, setSafetyScore] = useState(90);
  const [minDeposit, setMinDeposit] = useState(100);
  const [maxLeverage, setMaxLeverage] = useState('1:500');
  const [spreadType, setSpreadType] = useState('Raw / ECN');
  const [eurUsdSpread, setEurUsdSpread] = useState(0.1);
  const [regulation, setRegulation] = useState('FCA, ASIC, CySEC');
  const [scamWarning, setScamWarning] = useState(false);

  const openAddModal = () => {
    setEditingBroker(null);
    setName('');
    setSlug('');
    setTagline('');
    setDescription('');
    setSafetyScore(90);
    setMinDeposit(100);
    setMaxLeverage('1:500');
    setSpreadType('Raw / ECN');
    setEurUsdSpread(0.1);
    setRegulation('FCA, ASIC, CySEC');
    setScamWarning(false);
    setModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBroker(b);
    setName(b.name);
    setSlug(b.slug);
    setTagline(b.tagline || '');
    setDescription(b.description);
    setSafetyScore(b.safetyScore);
    setMinDeposit(b.minDeposit);
    setMaxLeverage(b.maxLeverage);
    setSpreadType(b.spreadType);
    setEurUsdSpread(b.eurUsdSpread);
    setRegulation(b.regulation.join(', '));
    setScamWarning(b.scamWarning || false);
    setModalOpen(true);
  };

  const handleDelete = (slugToDelete: string) => {
    if (confirm('Are you sure you want to remove this broker listing?')) {
      setBrokers(brokers.filter((b) => b.slug !== slugToDelete));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const regList = regulation.split(',').map((r) => r.trim());

    if (editingBroker) {
      setBrokers(
        brokers.map((b) =>
          b.slug === editingBroker.slug
            ? {
                ...b,
                name,
                slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                tagline,
                description,
                safetyScore: Number(safetyScore),
                minDeposit: Number(minDeposit),
                maxLeverage,
                spreadType,
                eurUsdSpread: Number(eurUsdSpread),
                regulation: regList,
                scamWarning,
              }
            : b
        )
      );
    } else {
      const newBroker = {
        _id: 'b-' + Date.now(),
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&q=80',
        tagline,
        description,
        rating: 4.8,
        totalReviews: 1,
        safetyScore: Number(safetyScore),
        foundedYear: 2020,
        headquarters: 'Global',
        regulation: regList,
        minDeposit: Number(minDeposit),
        maxLeverage,
        spreadType,
        eurUsdSpread: Number(eurUsdSpread),
        tradingPlatforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView'],
        scamWarning,
      };
      setBrokers([newBroker as any, ...brokers]);
    }
    setModalOpen(false);
  };

  const filteredBrokers = useMemo(() => {
    if (!search.trim()) return brokers;
    const q = search.toLowerCase();
    return brokers.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.headquarters.toLowerCase().includes(q) ||
        b.regulation.some((r) => r.toLowerCase().includes(q))
    );
  }, [brokers, search]);

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brokers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[40px] pl-9 pr-3 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-gold-primary shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="h-[40px] px-4 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Broker
        </button>
      </div>

      {/* Data Table: bg --color-white, border-radius --radius-md, shadow --shadow-card */}
      <div className="bg-white rounded-md border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header row: bg #F8FAFC, Inter 12px weight 600 --color-text-secondary uppercase tracking-wide */}
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Broker Name
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Trust Score
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Regulations
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Spread Model
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  EUR/USD
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Min Deposit
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Data rows: Inter 14px --color-text-primary, height 52px, Row hover: bg #FAFAFA */}
            <tbody className="divide-y divide-[#E2E8F0] font-sans text-[14px] text-text-primary">
              {filteredBrokers.map((b) => (
                <tr key={b.slug} className="h-[52px] hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] p-1 flex items-center justify-center shrink-0">
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-text-primary block leading-tight">
                          {b.name}
                        </span>
                        <span className="font-mono text-[11px] text-text-secondary">
                          {b.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <span className="font-bold text-text-primary">
                      {b.safetyScore}/100
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {(Array.isArray(b.regulation)
                        ? b.regulation
                        : typeof b.regulation === 'string'
                        ? b.regulation.split(',').map((s: string) => s.trim()).filter(Boolean)
                        : (Array.isArray(b.regulators) ? b.regulators : [])
                      ).slice(0, 2).map((r: string) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded text-[11px] bg-[#F1F5F9] border border-[#E2E8F0] text-text-primary"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-text-secondary font-medium">
                    {b.spreadType}
                  </td>

                  <td className="px-5 py-3 font-semibold text-text-primary">
                    {b.eurUsdSpread} pips
                  </td>

                  <td className="px-5 py-3 font-bold text-text-primary">
                    ${b.minDeposit}
                  </td>

                  {/* Status column */}
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 w-fit ${
                        (b.approvalStatus || 'approved') === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.approvalStatus === 'pending'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : b.approvalStatus === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.approvalStatus || 'APPROVED'}
                    </span>
                  </td>

                  {/* Actions column: compliance controls + icon buttons */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Direct compliance action buttons */}
                      {b.approvalStatus !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => handleApproval(b._id, 'approved')}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                          title="Approve Broker for Public Listing"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApproval(b._id, 'suspended')}
                          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors"
                          title="Suspend Broker Listing"
                        >
                          Suspend
                        </button>
                      )}

                      {b.approvalStatus === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleApproval(b._id, 'rejected')}
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[11px] transition-colors"
                          title="Reject Application"
                        >
                          Reject
                        </button>
                      )}

                      <Link
                        href={`/brokers/${b.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-[#F1F5F9] transition-colors"
                        title="View Public Profile"
                      >
                        👁️
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded text-text-secondary hover:text-gold-primary hover:bg-[#F1F5F9] transition-colors"
                        title="Edit Broker"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.slug)}
                        className="p-1.5 rounded text-text-secondary hover:text-danger hover:bg-[#FEE2E2] transition-colors"
                        title="Delete Broker"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination at bottom right: prev/next + page numbers */}
        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="font-sans text-[13px] text-text-secondary">
            Showing 1-{filteredBrokers.length} of {filteredBrokers.length} brokers
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="h-[32px] px-2.5 rounded border border-[#E2E8F0] bg-white text-[12px] font-medium text-text-secondary hover:text-text-primary disabled:opacity-40"
              disabled
            >
              Prev
            </button>
            <button
              type="button"
              className="h-[32px] w-[32px] rounded bg-gold-primary text-navy-deepest text-[12px] font-bold"
            >
              1
            </button>
            <button
              type="button"
              className="h-[32px] px-2.5 rounded border border-[#E2E8F0] bg-white text-[12px] font-medium text-text-secondary hover:text-text-primary disabled:opacity-40"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal: Light-mode styling */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-modal animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-sans text-[18px] font-bold text-text-primary">
                {editingBroker ? `Edit Broker: ${editingBroker.name}` : 'Add New Broker Listing'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-primary block mb-1">Broker Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-primary block mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. ic-markets"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-primary block mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. World's Leading True ECN Broker"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div>
                <label className="font-bold text-text-primary block mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-text-primary block mb-1">Trust Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(Number(e.target.value))}
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-primary block mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(Number(e.target.value))}
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-primary block mb-1">Max Leverage</label>
                  <input
                    type="text"
                    value={maxLeverage}
                    onChange={(e) => setMaxLeverage(e.target.value)}
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-primary block mb-1">Spread Model</label>
                  <select
                    value={spreadType}
                    onChange={(e) => setSpreadType(e.target.value)}
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  >
                    <option value="Raw / ECN">Raw / ECN</option>
                    <option value="Standard / Variable">Standard / Variable</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-primary block mb-1">EUR/USD Spread (pips)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={eurUsdSpread}
                    onChange={(e) => setEurUsdSpread(Number(e.target.value))}
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-primary block mb-1">
                  Regulatory Bodies (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FCA, ASIC, CySEC"
                  value={regulation}
                  onChange={(e) => setRegulation(e.target.value)}
                  className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-md text-text-primary focus:outline-none focus:border-gold-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="scamWarningToggle"
                  checked={scamWarning}
                  onChange={(e) => setScamWarning(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                />
                <label htmlFor="scamWarningToggle" className="font-bold text-danger cursor-pointer">
                  Flag with Scam / High Risk Warning
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-[40px] px-4 text-text-secondary hover:text-text-primary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[40px] px-6 rounded-md font-bold uppercase tracking-wider bg-gold-primary text-navy-deepest shadow-sm hover:bg-gold-light transition-colors"
                >
                  Save Broker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

