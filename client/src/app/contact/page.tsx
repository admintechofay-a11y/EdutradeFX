'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Globe,
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          Direct Inquiries & Support
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Contact <span className="gold-gradient-text">EduTradeFX</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Have questions regarding broker audits, advertising partnerships, institutional listings, or academy courses? Reach out to our international team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info & Socials */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">Global Headquarters</h2>

            <div className="space-y-5 text-xs text-slate-300">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-bold mb-0.5">Physical Address</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Level 34, International Financial Tower<br />
                    100 Barangaroo Avenue, Sydney NSW 2000, Australia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-bold mb-0.5">Electronic Inquiries</strong>
                  <a href="mailto:support@edutradefx.com" className="text-amber-400 hover:underline block">
                    support@edutradefx.com
                  </a>
                  <a href="mailto:mediation@edutradefx.com" className="text-slate-400 hover:underline block">
                    mediation@edutradefx.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-bold mb-0.5">Direct Desk Lines</strong>
                  <p className="text-slate-400">+61 (2) 8319 4022 (Sydney Desk)</p>
                  <p className="text-slate-400">+44 (20) 7946 0918 (London Desk)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-bold mb-0.5">Operating Hours</strong>
                  <p className="text-slate-400">24/5 Live Market Support (Sunday 22:00 – Friday 22:00 GMT)</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                Connect on Social Channels
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://t.me/edutradefx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-surface border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                >
                  Telegram
                </a>
                <a
                  href="https://twitter.com/edutradefx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-surface border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://youtube.com/@edutradefx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-surface border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                >
                  YouTube
                </a>
                <a
                  href="https://linkedin.com/company/edutradefx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-surface border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10 space-y-6">
            <h2 className="text-xl font-bold text-white">Send Us a Direct Message</h2>

            {submitted ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/40 p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Dispatched Successfully</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting EduTradeFX. One of our specialists will get back to you at <strong className="text-white">{email}</strong> within one business day.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setMessage('');
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-amber-500 text-brand-darkest text-xs font-bold shadow-glow-gold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. David Sterling"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. david@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Contact Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2831"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="general">General Support</option>
                      <option value="broker_audit">Broker Listing & Audit Inquiry</option>
                      <option value="advertising">Advertising & Media Kit</option>
                      <option value="academy">Academy & Course Questions</option>
                      <option value="partnership">Institutional Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Provide details about your query or proposal..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-gold disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Sending Message...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps Embed Section */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Interactive Location Map
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sydney International Financial Tower, Barangaroo
            </p>
          </div>
        </div>

        <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
          <iframe
            title="EduTradeFX Global HQ Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.98083818318!2d151.20011887648358!3d-33.86435861881774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae4380f2d847%3A0xb3a824706fb2a061!2sBarangaroo%20NSW%202000%2C%20Australia!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
