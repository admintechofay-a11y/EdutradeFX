'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Star,
  FileUp,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

export default function BrokerOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [profData, leadData] = await Promise.all([
          api.getBrokerProfile(),
          api.getBrokerLeads()
        ]);
        setProfile(profData);
        setLeads(Array.isArray(leadData) ? leadData : []);
      } catch (err) {
        console.error('Error fetching broker data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await api.submitBrokerForApproval();
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Listing submitted for institutional compliance review!' });
        setProfile((prev: any) => ({ ...prev, approvalStatus: 'pending' }));
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Failed to submit.' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Error communicating with server.' });
    } finally {
      setSubmitting(false);
    }
  };

  const status = profile?.approvalStatus || 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Broker Command Center</h1>
          <p className="text-xs text-text-muted-dark mt-1">
            Manage your brokerage listing, regulatory disclosures, spreads, and inbound trader leads.
          </p>
        </div>
        {profile?.slug && (
          <Link
            href={`/brokers/${profile.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-surface border border-navy-border text-xs text-gold-primary hover:border-gold-primary/50 transition-colors"
          >
            <span>Preview Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Approval Status Alert Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          status === 'approved'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : status === 'rejected'
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            : status === 'suspended'
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            {status === 'approved' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />}
            {status === 'rejected' && <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />}
            {status === 'suspended' && <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />}
            {status === 'pending' && <Clock className="w-6 h-6 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />}
            <div>
              <div className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                Listing Status: {status.toUpperCase()}
                {status === 'approved' && (
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    LIVE ON MARKETPLACE
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted-dark mt-1">
                {status === 'approved'
                  ? 'Your brokerage profile is verified and receiving public traffic from retail and institutional traders.'
                  : status === 'rejected'
                  ? `Rejection Reason: ${profile?.rejectionReason || 'Compliance documentation incomplete. Please update and resubmit.'}`
                  : status === 'suspended'
                  ? 'Account listing suspended by compliance desk pending mediation or document renewals.'
                  : 'Your profile has been submitted to the EduTradeFX compliance officer for license verification.'}
              </p>
            </div>
          </div>

          {status !== 'approved' && (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gold-primary text-navy-deepest font-bold text-xs hover:bg-gold-light transition-all shadow-glow-gold disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Request Compliance Approval'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Profile Verification</span>
            <ShieldCheck className="w-4 h-4 text-gold-primary" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {profile?.regulators?.length ? `${profile.regulators.length} Tier-1/2` : 'Pending'}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">
            {profile?.documents?.length || 0} compliance documents uploaded
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Inbound Leads</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{leads.length}</div>
          <p className="text-[11px] text-text-muted-dark mt-1">Traders requesting onboarding</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Trader Rating</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {profile?.overallRating ? `${profile.overallRating.toFixed(1)} / 5.0` : '4.8 / 5.0'}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">
            Based on {profile?.reviewCount || 12} verified reviews
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border">
          <div className="flex items-center justify-between text-text-muted-dark mb-2">
            <span className="text-xs font-semibold uppercase">Max Leverage</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            1:{profile?.maxLeverage || 500}
          </div>
          <p className="text-[11px] text-text-muted-dark mt-1">
            EUR/USD Spreads from {profile?.eurUsdSpread || 0.0} pips
          </p>
        </div>
      </div>

      {/* Quick Setup Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/broker/profile"
          className="p-5 rounded-2xl bg-navy-surface border border-navy-border hover:border-gold-primary/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-gold-primary transition-colors">
              Trading Conditions & Spreads
            </h3>
            <p className="text-xs text-text-muted-dark mt-1">
              Configure minimum deposit, account types, trading platforms (MT4/MT5/cTrader), and spread tiers.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gold-primary font-bold">
            <span>Edit Conditions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/broker/documents"
          className="p-5 rounded-2xl bg-navy-surface border border-navy-border hover:border-gold-primary/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
              <FileUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-gold-primary transition-colors">
              Regulatory Licenses
            </h3>
            <p className="text-xs text-text-muted-dark mt-1">
              Upload incorporation certificates, ASIC / FCA / CySEC licenses to earn the Verified Gold Badge.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gold-primary font-bold">
            <span>Manage Licenses</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/broker/leads"
          className="p-5 rounded-2xl bg-navy-surface border border-navy-border hover:border-gold-primary/50 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-gold-primary transition-colors">
              Inbound Leads & Enquiries
            </h3>
            <p className="text-xs text-text-muted-dark mt-1">
              Connect directly with traders looking for VIP spread conditions, PAMM access, or institutional API onboarding.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gold-primary font-bold">
            <span>View {leads.length} Leads</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
