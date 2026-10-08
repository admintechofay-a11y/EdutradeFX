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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">Inbound Trader Leads</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Retail and VIP traders requesting account onboarding through your EdutradeFX profile.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-tint hover:bg-border/60 disabled:opacity-50 text-navy font-semibold text-xs rounded-full border border-border transition"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by trader name, email, or country..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue"
          />
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : filteredLeads.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint/60 text-text-muted text-xs uppercase font-bold">
                <th className="p-4">Trader Details</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Deposit Range</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface-tint/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-text-heading">{lead.name}</div>
                    <div className="text-text-muted text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      {lead.country || 'Global'}
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-text-heading">
                      <Mail className="w-3.5 h-3.5 text-text-muted" />
                      <span>{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1.5 text-text-muted text-xs">
                        <Phone className="w-3 h-3 text-text-muted" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-orange">
                    {lead.depositBudget || '$100 - $500'}
                  </td>
                  <td className="p-4 text-text-muted text-xs">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-blue/10 text-blue text-xs font-bold border border-blue/20">
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
