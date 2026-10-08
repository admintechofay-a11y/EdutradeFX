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
    <div className="min-h-screen py-12 md:py-20 text-text-body bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-tint border border-blue/20 text-blue text-xs font-bold uppercase tracking-wider mb-4">
            <Headphones className="w-3.5 h-3.5" />
            <span>Dedicated Support & Institutional Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-heading tracking-tight mb-4">
            Contact EduTradeFX
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Have a question about a broker listing, course curriculum, partnership opportunities, or media kits? Our operations team responds within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Global HQ Info */}
            <div className="p-6 rounded-2xl bg-white border border-border shadow-soft space-y-4">
              <h3 className="text-base font-bold text-text-heading">Global Operations Office</h3>
              <div className="space-y-4 text-xs sm:text-sm text-text-body">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue shrink-0 mt-0.5" />
                  <span>Level 24, One Financial Tower, Canary Wharf, London, E14 5AB, United Kingdom</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue shrink-0" />
                  <span>support@edutradefx.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue shrink-0" />
                  <span>+44 20 7946 0912</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue shrink-0" />
                  <span>Mon – Fri: 08:00 – 18:00 GMT</span>
                </div>
              </div>
            </div>

            {/* Trader Grievance Box CTA Callout */}
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Broker Dispute or Fraud Report?</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                If a broker is withholding your withdrawal, manipulating spreads, or refusing to honor profits, do not use general contact. Submit a formal dispute case to our dedicated compliance desk.
              </p>
              <div className="pt-1">
                <Link
                  href="/complaint-box"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
                >
                  <span>Go to Complaint Box Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Direct Department Emails */}
            <div className="p-6 rounded-2xl bg-surface-tint border border-border space-y-3 text-xs">
              <h4 className="font-bold text-text-heading uppercase tracking-wider">
                Direct Department Inboxes
              </h4>
              <div className="space-y-2.5 text-text-muted">
                <div>
                  <div className="text-text-heading font-semibold">Advertising & Broker Directory</div>
                  <span className="font-mono text-blue font-bold">partners@edutradefx.com</span>
                </div>
                <div>
                  <div className="text-text-heading font-semibold">LMS Academy & Course Mentors</div>
                  <span className="font-mono text-blue font-bold">academy@edutradefx.com</span>
                </div>
                <div>
                  <div className="text-text-heading font-semibold">Compliance & Legal Affairs</div>
                  <span className="font-mono text-blue font-bold">legal@edutradefx.com</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Contact Form (8 cols) */}
          <div className="lg:col-span-8">
            <div className="p-4 sm:p-8 md:p-10 rounded-2xl bg-white border border-border shadow-soft">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-heading">Inquiry Received Successfully</h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
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
                      className="px-6 py-2.5 rounded-full border border-border hover:bg-surface-tint text-sm font-bold text-text-heading transition shadow-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-text-heading mb-2">Send Us a Direct Message</h2>
                  <p className="text-xs sm:text-sm text-text-muted mb-6">
                    Fill in the form below and an EduTradeFX specialist will get back to you promptly.
                  </p>

                  {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-heading mb-1.5 uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Alex Morgan"
                          className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-heading mb-1.5 uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="alex@example.com"
                          className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-heading mb-1.5 uppercase tracking-wider">
                          Mobile Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+44 7911 123456"
                          className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-heading mb-1.5 uppercase tracking-wider">
                          Inquiry Category *
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
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
                      <label className="block text-xs font-bold text-text-heading mb-1.5 uppercase tracking-wider">
                        Subject Line *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="Brief summary of your inquiry"
                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-heading mb-1.5 uppercase tracking-wider">
                        Message Details *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Provide full context, question, or proposal details..."
                        className="w-full px-4 py-3 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue resize-y shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-orange hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-sm rounded-full transition shadow-soft hover:shadow-lift flex items-center justify-center gap-2"
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
