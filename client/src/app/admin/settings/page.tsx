'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  CheckCircle2,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Globe,
  Sliders,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('EduTradeFX');
  const [supportEmail, setSupportEmail] = useState('support@edutradefx.com');
  const [mediationEmail, setMediationEmail] = useState('mediation@edutradefx.com');
  const [deskPhone, setDeskPhone] = useState('+61 (2) 8319 4022');

  // Homepage Toggles
  const [showFeaturedBrokers, setShowFeaturedBrokers] = useState(true);
  const [showFeaturedManagers, setShowFeaturedManagers] = useState(true);
  const [showFeaturedSignals, setShowFeaturedSignals] = useState(true);
  const [showLmsPreview, setShowLmsPreview] = useState(true);
  const [showComplaintCta, setShowComplaintCta] = useState(true);
  const [showAdvertiseSection, setShowAdvertiseSection] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Panel
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Settings & Content Toggles</h1>
        <p className="text-xs text-slate-400 mt-1">
          Control homepage visibility modules, maintenance mode, and global support contacts.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Platform settings updated and deployed across all frontend routes.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Homepage Section Visibility Toggles */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-amber-400" />
            Homepage Section Visibility Toggles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/60 border border-slate-800">
              <div>
                <strong className="block text-white font-bold">Featured Brokers Grid</strong>
                <span className="text-slate-400">Display top audited broker cards</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFeaturedBrokers(!showFeaturedBrokers)}
                className={`text-xl ${showFeaturedBrokers ? 'text-amber-400' : 'text-slate-600'}`}
              >
                {showFeaturedBrokers ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/60 border border-slate-800">
              <div>
                <strong className="block text-white font-bold">Account Managers Grid</strong>
                <span className="text-slate-400">Display verified PAMM managers</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFeaturedManagers(!showFeaturedManagers)}
                className={`text-xl ${showFeaturedManagers ? 'text-emerald-400' : 'text-slate-600'}`}
              >
                {showFeaturedManagers ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/60 border border-slate-800">
              <div>
                <strong className="block text-white font-bold">Signal Providers Grid</strong>
                <span className="text-slate-400">Display audited signal feeds</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFeaturedSignals(!showFeaturedSignals)}
                className={`text-xl ${showFeaturedSignals ? 'text-cyan-400' : 'text-slate-600'}`}
              >
                {showFeaturedSignals ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/60 border border-slate-800">
              <div>
                <strong className="block text-white font-bold">Forex Education / LMS</strong>
                <span className="text-slate-400">Display academy course teasers</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLmsPreview(!showLmsPreview)}
                className={`text-xl ${showLmsPreview ? 'text-purple-400' : 'text-slate-600'}`}
              >
                {showLmsPreview ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/60 border border-slate-800">
              <div>
                <strong className="block text-white font-bold">Complaint Box CTA</strong>
                <span className="text-slate-400">Prominent dispute resolution alert</span>
              </div>
              <button
                type="button"
                onClick={() => setShowComplaintCta(!showComplaintCta)}
                className={`text-xl ${showComplaintCta ? 'text-rose-400' : 'text-slate-600'}`}
              >
                {showComplaintCta ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/60 border border-slate-800">
              <div>
                <strong className="block text-white font-bold">Advertise With Us</strong>
                <span className="text-slate-400">Broker listing & media kit section</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvertiseSection(!showAdvertiseSection)}
                className={`text-xl ${showAdvertiseSection ? 'text-amber-400' : 'text-slate-600'}`}
              >
                {showAdvertiseSection ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Global Site Details */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe className="w-4 h-4 text-emerald-400" />
            Global Platform Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Support Desk Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mediation Desk Email</label>
              <input
                type="email"
                value={mediationEmail}
                onChange={(e) => setMediationEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Direct Desk Phone</label>
              <input
                type="text"
                value={deskPhone}
                onChange={(e) => setDeskPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-surface border border-slate-700 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Maintenance Mode */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Emergency Maintenance Mode
              </h2>
              <p className="text-xs text-slate-400">
                When enabled, non-admin visitors see a maintenance notice while database updates or server migrations occur.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`text-xl ${maintenanceMode ? 'text-rose-500' : 'text-slate-600'}`}
            >
              {maintenanceMode ? (
                <ToggleRight className="w-9 h-9" />
              ) : (
                <ToggleLeft className="w-9 h-9" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-gold"
        >
          <Save className="w-4 h-4" />
          Save Platform Settings
        </button>
      </form>
    </div>
  );
}
