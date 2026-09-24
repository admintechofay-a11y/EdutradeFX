'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Save, CheckCircle2, AlertCircle, FileText, Sparkles, Megaphone, Info } from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'announcement' | 'contact'>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // CMS state for key sections
  const [homeContent, setHomeContent] = useState({
    heroHeadline: 'Trade Smarter with Verified Brokers & Masterclass Education',
    heroSubheadline: 'Compare tier-1 regulated Forex brokers, learn structured institutional strategies from veteran mentors, connect with audited account managers, and safeguard your capital.',
    comparisonNotice: 'Can’t Decide Between Multiple Brokerages? Launch our side-by-side comparison engine.',
    complaintBannerTitle: 'Encountered a Rogue Broker or Withheld Withdrawal?',
    complaintBannerDesc: 'Submit a formal dispute case. EduTradeFX conducts compliance inquiries and publishes findings.',
  });

  const [aboutContent, setAboutContent] = useState({
    missionTitle: 'Elevating Transparency in the Global Forex Ecosystem',
    missionDesc: 'EduTradeFX was established to empower retail currency traders with independently audited broker intelligence, institutional-grade education, verified professional directories, and a dedicated dispute mediation desk.',
    regulatoryNotice: 'EduTradeFX operates strictly as an educational platform and independent directory.',
  });

  const [announcement, setAnnouncement] = useState({
    enabled: true,
    message: 'Next-Gen Forex Intelligence & Ecosystem Platform Live. Over 500+ Brokers Audited.',
    link: '/brokers',
  });

  const [contactInfo, setContactInfo] = useState({
    headquarters: 'Level 24, One Financial Tower, Canary Wharf, London, E14 5AB, United Kingdom',
    supportEmail: 'support@edutradefx.com',
    disputeEmail: 'disputes@edutradefx.com',
    phone: '+44 20 7946 0912',
    hours: 'Mon – Fri: 08:00 – 18:00 GMT',
  });

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const res = await api.get('/admin/content');
        const data = res.data?.data || {};
        if (data.home) setHomeContent((prev) => ({ ...prev, ...data.home }));
        if (data.about) setAboutContent((prev) => ({ ...prev, ...data.about }));
        if (data.announcement) setAnnouncement((prev) => ({ ...prev, ...data.announcement }));
        if (data.contact) setContactInfo((prev) => ({ ...prev, ...data.contact }));
      } catch (err) {
        console.error('Failed to load website content', err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async (section: string, payload: any) => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.put('/admin/content', { section, content: payload });
      setSuccessMsg(`Section '${section}' updated successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save website content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Website Content Management (Lite CMS)</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Edit live hero headlines, mission statements, announcement banners, and company contact details without deploying code.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'home' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Homepage Text</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'about' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About Us</span>
        </button>
        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'announcement' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcement</span>
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'contact' ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>HQ Contact Info</span>
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          {/* TAB 1: HOMEPAGE */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2">Homepage Hero & Callouts</h3>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Hero Main Headline
                </label>
                <input
                  type="text"
                  value={homeContent.heroHeadline}
                  onChange={(e) => setHomeContent({ ...homeContent, heroHeadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Hero Subheadline Description
                </label>
                <textarea
                  rows={3}
                  value={homeContent.heroSubheadline}
                  onChange={(e) => setHomeContent({ ...homeContent, heroSubheadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Complaint Banner Title
                  </label>
                  <input
                    type="text"
                    value={homeContent.complaintBannerTitle}
                    onChange={(e) => setHomeContent({ ...homeContent, complaintBannerTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Comparison Engine Teaser
                  </label>
                  <input
                    type="text"
                    value={homeContent.comparisonNotice}
                    onChange={(e) => setHomeContent({ ...homeContent, comparisonNotice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSave('home', homeContent)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Homepage Content'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2">About Us Mission & Values</h3>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Mission Statement Headline
                </label>
                <input
                  type="text"
                  value={aboutContent.missionTitle}
                  onChange={(e) => setAboutContent({ ...aboutContent, missionTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Detailed Mission Narrative
                </label>
                <textarea
                  rows={4}
                  value={aboutContent.missionDesc}
                  onChange={(e) => setAboutContent({ ...aboutContent, missionDesc: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Regulatory Neutrality Notice
                </label>
                <textarea
                  rows={3}
                  value={aboutContent.regulatoryNotice}
                  onChange={(e) => setAboutContent({ ...aboutContent, regulatoryNotice: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSave('about', aboutContent)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save About Us Content'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENT */}
          {activeTab === 'announcement' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2">Global Announcement Banner</h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ann-enabled"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-blue bg-slate-800 border-slate-700"
                />
                <label htmlFor="ann-enabled" className="text-xs sm:text-sm text-slate-300 font-semibold cursor-pointer">
                  Display Announcement Strip at Top of Website
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Announcement Text
                </label>
                <input
                  type="text"
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={announcement.link}
                  onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                  placeholder="/brokers or /courses"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSave('announcement', announcement)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Announcement'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT INFO */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2">Corporate Contact & Operating Details</h3>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Physical Headquarters Address
                </label>
                <input
                  type="text"
                  value={contactInfo.headquarters}
                  onChange={(e) => setContactInfo({ ...contactInfo, headquarters: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    General Support Email
                  </label>
                  <input
                    type="email"
                    value={contactInfo.supportEmail}
                    onChange={(e) => setContactInfo({ ...contactInfo, supportEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Dispute Desk Email
                  </label>
                  <input
                    type="email"
                    value={contactInfo.disputeEmail}
                    onChange={(e) => setContactInfo({ ...contactInfo, disputeEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Switchboard Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Operational Hours
                  </label>
                  <input
                    type="text"
                    value={contactInfo.hours}
                    onChange={(e) => setContactInfo({ ...contactInfo, hours: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSave('contact', contactInfo)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Contact Details'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
