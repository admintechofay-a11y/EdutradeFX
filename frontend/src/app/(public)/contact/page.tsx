'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Headphones
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'GENERAL',
    subject: '',
    message: '',
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
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit inquiry. Please try again or email support directly.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-4">
            <Headphones className="w-3.5 h-3.5" />
            <span>Dedicated Support & Institutional Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Contact EduTradeFX
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Have a question about a broker listing, course curriculum, partnership opportunities, or media kits? Our operations team responds within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Global HQ Info */}
            <div className="p-6 rounded-3xl bg-brand-navy-card border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Global Operations Office</h3>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span>Level 24, One Financial Tower, Canary Wharf, London, E14 5AB, United Kingdom</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>support@edutradefx.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>+44 20 7946 0912</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>Mon – Fri: 08:00 – 18:00 GMT</span>
                </div>
              </div>
            </div>

            {/* Trader Grievance Box CTA Callout */}
            <div className="p-6 rounded-3xl bg-red-950/30 border border-red-500/30 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Broker Dispute or Fraud Report?</span>
              </div>
              <p className="text-xs text-red-200/90 leading-relaxed">
                If a broker is withholding your withdrawal, manipulating spreads, or refusing to honor profits, do not use general contact. Submit a formal dispute case to our dedicated compliance desk.
              </p>
              <div className="pt-1">
                <Link
                  href="/complaint-box"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 hover:text-white transition"
                >
                  <span>Go to Complaint Box Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Direct Department Emails */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider">
                Direct Department Inboxes
              </h4>
              <div className="space-y-2 text-slate-400">
                <div>
                  <div className="text-white font-medium">Advertising & Broker Directory</div>
                  <span className="font-mono text-brand-blue">partners@edutradefx.com</span>
                </div>
                <div>
                  <div className="text-white font-medium">LMS Academy & Course Mentors</div>
                  <span className="font-mono text-brand-blue">academy@edutradefx.com</span>
                </div>
                <div>
                  <div className="text-white font-medium">Compliance & Legal Affairs</div>
                  <span className="font-mono text-brand-blue">legal@edutradefx.com</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Contact Form (8 cols) */}
          <div className="lg:col-span-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-brand-navy-card border border-slate-800 shadow-xl">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Inquiry Received Successfully</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for contacting EduTradeFX. Your inquiry has been routed to our operations team. We will review your message and reply within 1 business day.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: '',
                          email: '',
                          phone: '',
                          category: 'GENERAL',
                          subject: '',
                          message: '',
                        });
                      }}
                      className="px-6 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-sm font-semibold text-slate-200 transition"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Send Us a Direct Message</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mb-6">
                    Fill in the form below and an EduTradeFX specialist will get back to you promptly.
                  </p>

                  {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Alex Morgan"
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="alex@example.com"
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Mobile Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+44 7911 123456"
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Inquiry Category *
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                        >
                          <option value="GENERAL">General Inquiries & Support</option>
                          <option value="ADVERTISING">Advertising & Media Kit</option>
                          <option value="PARTNERSHIP">Broker Directory Listing</option>
                          <option value="ACADEMY">Tutor / Academy Instructor Program</option>
                          <option value="BROKER_DISPUTE">Broker Dispute (See Complaint Box)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Subject Line *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="Brief summary of your inquiry"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Message Details *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Provide full context, question, or proposal details..."
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-brand-blue resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-brand-cyan hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Transmitting to Support Desk...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
