'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  BarChart3, 
  Users, 
  Globe, 
  Target, 
  CheckCircle2, 
  Mail, 
  Building2, 
  DollarSign, 
  Send,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../../lib/api';

const AD_PLACEMENTS = [
  {
    id: 'featured_broker',
    title: 'Featured Broker Placement',
    desc: 'Pinned at the top of the Broker Directory and Compare matrices with a gold verified badge and direct CTA button.',
    badge: 'Highest Conversion',
  },
  {
    id: 'hero_banner',
    title: 'Homepage & Header Banner',
    desc: 'Prominent 728x90 and responsive leaderboards showcased on high-traffic landing pages.',
    badge: 'Maximum Reach',
  },
  {
    id: 'academy_partner',
    title: 'Academy & Course Sponsorship',
    desc: 'Exclusive "Brought to you by" brand integration inside our trading courses and video player modules.',
    badge: 'Educational Authority',
  },
  {
    id: 'newsletter_blast',
    title: 'Trader Newsletter & Push Blasts',
    desc: 'Direct sponsor segment delivered to our verified opt-in community of 45,000+ active retail traders.',
    badge: 'High Intent',
  },
];

export default function AdvertisePage() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    placement: 'featured_broker',
    budget: '$2,500 - $5,000',
    goals: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      await api.post('/contact', {
        name: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        category: 'ADVERTISING',
        subject: `[Advertising Inquiry] ${form.companyName} (${form.placement})`,
        message: `Company: ${form.companyName}\nWebsite: ${form.website}\nSelected Placement: ${form.placement}\nEstimated Monthly Budget: ${form.budget}\nCampaign Goals & Specifications:\n${form.goals}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to submit advertising request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-semibold mb-4">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Institutional Partner Program & Media Kit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Advertise with EduTradeFX
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Position your brokerage, fintech software, prop firm, or liquidity bridge in front of over 120,000+ monthly active traders seeking regulated trading solutions.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">120K+</div>
            <div className="text-xs text-slate-400 font-medium">Monthly Active Visitors</div>
          </div>
          <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-blue font-mono">4.2%</div>
            <div className="text-xs text-slate-400 font-medium">Average CTR on Featured Listings</div>
          </div>
          <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">82%</div>
            <div className="text-xs text-slate-400 font-medium">Funded Trader Intent Ratio</div>
          </div>
          <div className="p-6 rounded-2xl bg-brand-navy-card border border-slate-800 text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-gold font-mono">65+</div>
            <div className="text-xs text-slate-400 font-medium">Global Trader Jurisdictions</div>
          </div>
        </div>

        {/* Ad Placements Showcase */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            High-Impact Advertising Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AD_PLACEMENTS.map((ad) => (
              <div
                key={ad.id}
                className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 hover:border-slate-700 transition relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{ad.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30 uppercase tracking-wider">
                    {ad.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {ad.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="max-w-3xl mx-auto bg-brand-navy-card border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Media Kit & Proposal Request Received</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Thank you for your interest in partnering with EduTradeFX. Our institutional advertising director will reach out to <strong className="text-white">{form.email}</strong> within 1 business day with custom rate cards and inventory availability.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-sm font-semibold text-slate-200 transition"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Request Media Kit & Custom Proposal
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Fill in your campaign parameters below to receive our official rate card and availability schedule.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Company / Broker Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="e.g. Apex Global Markets"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Official Brand Website *
                    </label>
                    <input
                      type="url"
                      required
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://examplebroker.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Corporate Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="partners@examplebroker.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Preferred Placement Format *
                    </label>
                    <select
                      value={form.placement}
                      onChange={(e) => setForm({ ...form, placement: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue"
                    >
                      <option value="featured_broker">Featured Broker Listing (Directory Pin)</option>
                      <option value="hero_banner">Homepage & Global Header Leaderboard</option>
                      <option value="academy_partner">Academy & Course Video Sponsorship</option>
                      <option value="newsletter_blast">Direct Opt-In Newsletter Blast</option>
                      <option value="custom_bundle">All-Inclusive Multi-Channel Package</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Estimated Monthly Budget *
                    </label>
                    <select
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue"
                    >
                      <option value="$1,000 - $2,500">$1,000 – $2,500 / month</option>
                      <option value="$2,500 - $5,000">$2,500 – $5,000 / month</option>
                      <option value="$5,000 - $10,000">$5,000 – $10,000 / month</option>
                      <option value="$10,000+">$10,000+ / month (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Campaign Goals & Target Geographies
                  </label>
                  <textarea
                    rows={4}
                    value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })}
                    placeholder="Tell us about your target regions (UK, EU, LATAM, SEA), regulation, CPA/CPL models, or timeline..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-blue resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-lg shadow-brand-blue/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Media Kit & Schedule Call</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
