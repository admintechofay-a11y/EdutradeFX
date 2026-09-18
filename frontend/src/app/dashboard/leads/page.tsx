'use client';

import React, { useState, useEffect } from 'react';
import { Users, Download, Mail, Phone, MapPin, Calendar, Search } from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';

export default function BrokerLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await api.get('/brokers/my/leads');
        setLeads(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load leads', err);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Deposit Target', 'Date'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone || ''}"`,
      `"${l.country || ''}"`,
      `"${l.depositBudget || ''}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edutrade_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Inbound Trader Leads</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Retail and VIP traders requesting account onboarding through your EdutradeFX profile.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-navy-light hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl border border-slate-700 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-brand-navy-card border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by trader name, email, or country..."
            className="w-full pl-10 pr-4 py-2 bg-brand-navy-light border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : filteredLeads.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-brand-navy-card shadow-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-brand-navy-light/40 text-slate-400 text-xs uppercase font-bold">
                <th className="p-4">Trader Details</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Deposit Range</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-brand-navy-light/20 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{lead.name}</div>
                    <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {lead.country || 'Global'}
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-brand-amber">
                    {lead.depositBudget || '$100 - $500'}
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-brand-blue/15 text-brand-blue text-xs font-bold">
                      NEW LEAD
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Inbound Leads Yet"
          description="Trader leads generated from your public profile and comparison table will appear here."
        />
      )}
    </div>
  );
}
