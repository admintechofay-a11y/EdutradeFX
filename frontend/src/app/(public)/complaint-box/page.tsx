'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileCheck, 
  Info 
} from 'lucide-react';
import { api } from '../../../lib/api';

const COMPLAINT_CATEGORIES = [
  { value: 'WITHDRAWAL_ISSUE', label: 'Withdrawal Refusal or Delay' },
  { value: 'ACCOUNT_MANAGER_FRAUD', label: 'Account Manager Loss / Unauthorized Trades' },
  { value: 'SIGNAL_PROVIDER_MISCONDUCT', label: 'Misleading Signals / False PnL Reports' },
  { value: 'BROKER_SLIPPAGE_MANIPULATION', label: 'Artificial Slippage & Spread Widening' },
  { value: 'PLATFORM_DOWNTIME', label: 'Server Freezing During High Volatility' },
  { value: 'BONUS_TRAP', label: 'Unfair Terms on Deposit Bonus / Leverage Traps' },
  { value: 'OTHER', label: 'Other Grievance / Unethical Practice' }
];

export default function ComplaintBoxPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    category: 'WITHDRAWAL_ISSUE',
    subject: '',
    description: '',
    declarationConsent: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ referenceId: string; subject: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.declarationConsent) {
      setErrorMessage('You must confirm the legal declaration before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        companyName: form.companyName.trim(),
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        declarationConsent: true,
        targetType: form.category.includes('BROKER') || form.category.includes('WITHDRAWAL') ? 'BROKER' : 'PLATFORM',
        evidence: files.map((f) => f.name),
      };

      const res = await api.post('/complaints', payload);
      const complaint = res.data?.data;
      const refId = complaint?.id ? `FX-DISP-${complaint.id.slice(0, 8).toUpperCase()}` : `FX-DISP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      setSubmittedData({
        referenceId: refId,
        subject: form.subject,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit grievance. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-20 text-text-body bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Banner */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Official Trader Dispute & Grievance Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-heading tracking-tight mb-4">
            EduTradeFX Complaint Box
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Report fraudulent brokers, unauthorized PAMM losses, scam signal providers, or withheld withdrawals. We investigate, demand mediation from entities, and protect the global trading community through transparent grievance reporting.
          </p>
        </div>

        {submittedData ? (
          /* SUCCESS CASE SUBMITTED VIEW */
          <div className="max-w-2xl mx-auto bg-white border border-green-200 rounded-3xl p-8 sm:p-12 text-center shadow-lift space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 text-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-heading">Dispute Case Successfully Logged</h2>
              <p className="text-sm text-text-muted">
                Your grievance has been securely entered into our compliance audit pipeline.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-tint border border-border text-left space-y-2">
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Official Case Reference Code:
              </div>
              <div className="text-xl font-mono font-extrabold text-orange select-all">
                {submittedData.referenceId}
              </div>
              <div className="text-xs text-text-body">
                Case Subject: <span className="text-text-heading font-bold">{submittedData.subject}</span>
              </div>
            </div>

            {/* Resolution Timeline */}
            <div className="space-y-4 text-left border-t border-border pt-6">
              <h3 className="text-sm font-bold text-text-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue" />
                Next Steps & Investigation Pipeline:
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-text-body">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <p><strong className="text-text-heading">Evidence Review (24-48 Hours):</strong> Our forensic analysts examine your submitted transaction hashes, statement screenshots, and correspondence.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <p><strong className="text-text-heading">Formal Notice to Entity:</strong> We issue an official inquiry notice to the designated broker, account manager, or provider requesting clarification.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <p><strong className="text-text-heading">Resolution or Blacklist Notice:</strong> Uncooperative or rogue entities are penalized with public warning badges and listed on our scam watch registry.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmittedData(null);
                  setForm({
                    name: '',
                    email: '',
                    phone: '',
                    companyName: '',
                    category: 'WITHDRAWAL_ISSUE',
                    subject: '',
                    description: '',
                    declarationConsent: false,
                  });
                  setFiles([]);
                }}
                className="px-6 py-2.5 rounded-full border border-border hover:bg-surface-tint text-sm font-bold text-text-heading transition"
              >
                Submit Another Grievance
              </button>
              <Link
                href="/brokers"
                className="px-6 py-2.5 rounded-full bg-orange hover:bg-orange-hover text-sm font-bold text-white transition text-center shadow-soft"
              >
                Browse Regulated Brokers
              </Link>
            </div>
          </div>
        ) : (
          /* GRIEVANCE FORM & SIDEBAR */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-8 bg-white border border-border rounded-2xl p-4 sm:p-8 md:p-10 shadow-soft">
              <h2 className="text-xl font-bold text-text-heading mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue" />
                Submit Incident Report
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mb-6 sm:mb-8">
                Please provide exhaustive factual details. The more documentary evidence you attach, the stronger our mediation leverage.
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Complainant Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                      Mobile / WhatsApp Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+44 7911 123456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                      Target Company / Entity Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="e.g. Apex Global Markets / FX-Alpha-Bot"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Grievance Category & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                      Grievance Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
                    >
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                      Dispute Subject / Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. $14,500 withdrawal blocked since March 10"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue shadow-sm"
                    />
                  </div>
                </div>

                {/* Detailed Incident Narrative */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                    Detailed Chronological Narrative *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Include trading account numbers, deposit dates, transaction IDs, specific dates when withdrawal was requested, broker rep names, and copies of denial emails..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm text-text-heading focus:outline-none focus:border-blue resize-y shadow-sm"
                  />
                </div>

                {/* Document & Evidence Upload Dropzone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                    Attach Documentary Evidence (Screenshots, PDFs, Statements)
                  </label>
                  <label className="border-2 border-dashed border-border hover:border-blue rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-surface-tint">
                    <UploadCloud className="w-8 h-8 text-blue mb-2" />
                    <span className="text-xs sm:text-sm font-semibold text-text-heading text-center">
                      Click to upload or drag & drop files here
                    </span>
                    <span className="text-[11px] text-text-muted mt-1">
                      PNG, JPG, PDF up to 10MB each (max 5 attachments)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-border text-xs text-text-body shadow-sm"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-4 h-4 text-green shrink-0" />
                            <span className="truncate font-medium">{file.name}</span>
                            <span className="text-[10px] text-text-muted font-mono">
                              ({(file.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Declaration & Consent Checkbox */}
                <div className="p-4 rounded-xl bg-surface-tint border border-border space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.declarationConsent}
                      onChange={(e) => setForm({ ...form, declarationConsent: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-blue border-border focus:ring-blue"
                    />
                    <span className="text-xs text-text-body leading-relaxed">
                      <strong className="text-text-heading">Legal Declaration & Mediation Authorization:</strong> I solemnly declare that all statements, dates, and evidence provided above are truthful, accurate, and unedited to the best of my knowledge. I authorize EduTradeFX to contact the accused entity, review transaction records, and post anonymized dispute metrics to the public transparency desk.
                    </span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-full bg-orange hover:bg-orange-hover text-white font-bold text-sm tracking-wide shadow-soft hover:shadow-lift disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Logging Dispute to Forensic Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Submit Official Dispute Report</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Guide & Disclaimer */}
            <div className="lg:col-span-4 space-y-6">
              {/* How Mediation Works */}
              <div className="p-6 rounded-2xl bg-surface-tint border border-border space-y-4">
                <h3 className="text-base font-bold text-text-heading flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue" />
                  How Dispute Resolution Works
                </h3>
                <div className="space-y-4 text-xs text-text-body">
                  <div className="space-y-1">
                    <div className="font-bold text-text-heading">1. Forensic Screening</div>
                    <p>Our audit team checks regulatory status, licensing jurisdictions, and previous grievance records of the target entity.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-text-heading">2. Formal Entity Inquiry</div>
                    <p>We dispatch an official dispute inquiry to the brokerage or provider compliance desk giving 5 business days to respond.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-text-heading">3. Community Warning & Blacklist</div>
                    <p>Non-responsive entities receive a "High Risk / Dispute Notice" flag across all EduTradeFX broker comparison lists.</p>
                  </div>
                </div>
              </div>

              {/* Legal Mandate Disclaimer */}
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-orange font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Important Legal Disclosure</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  EduTradeFX acts exclusively as an independent trading educational community and dispute mediator. We are not a judicial body or law court. We cannot physically seize funds or compel bank chargebacks. However, our public reputation indices frequently motivate brokers to resolve legitimate grievances expeditiously.
                </p>
              </div>

              {/* Direct Compliance Desk */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-soft space-y-3">
                <h4 className="text-xs font-bold text-text-heading uppercase tracking-wider">
                  Direct Compliance Desk
                </h4>
                <p className="text-xs text-text-muted">
                  For law enforcement inquiries, regulatory subpoenas, or urgent security escalations:
                </p>
                <div className="text-xs font-mono font-bold text-blue">
                  disputes@edutradefx.com
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
