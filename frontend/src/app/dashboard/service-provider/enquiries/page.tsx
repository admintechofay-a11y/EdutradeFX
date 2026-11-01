'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, Phone, Building2, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';

export default function ProviderEnquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/service-providers/me/enquiries')
      .then((res) => {
        if (res.data?.success) {
          setEnquiries(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/service-providers/me/enquiries/${id}`, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Inbound B2B Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional brokers, prop firms, and hedge funds requesting enterprise quotes and integration demos.
          </p>
        </div>

        {enquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No Inbound Leads Yet</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Once your profile is published, institutional inquiries submitted on your profile will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{enq.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      {enq.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {enq.companyName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${enq.email}`} className="text-blue-600 hover:underline">
                          {enq.email}
                        </a>
                      </span>
                      {enq.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {enq.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={enq.status || 'NEW'}
                      onChange={(e) => updateStatus(enq.id, e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-700"
                    >
                      <option value="NEW">New Lead</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="CLOSED">Closed / Converted</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Message:</p>
                  <p className="whitespace-pre-wrap">{enq.message}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Budget: <strong>{enq.budgetRange || 'Not specified'}</strong></span>
                  <span>Received: {new Date(enq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
