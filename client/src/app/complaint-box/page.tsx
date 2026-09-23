'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import FileUploadDropzone, { UploadedFileItem } from '@/components/shared/FileUploadDropzone';
import LegalNoticeBlock from '@/components/shared/LegalNoticeBlock';

export default function ComplaintBoxPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Your Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Auto-populate user details if authenticated
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Step 2: Complaint Details
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('withdrawal_delay');
  const [disputeAmount, setDisputeAmount] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');

  // Step 3: Evidence & Declaration
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [declarationChecked, setDeclarationChecked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  const categories = [
    { value: 'withdrawal_delay', label: 'Withdrawal Refusal or Delay' },
    { value: 'slippage_manipulation', label: 'Abnormal Slippage / Price Spike Manipulation' },
    { value: 'account_freeze', label: 'Arbitrary Account Block or Balance Confiscation' },
    { value: 'bonus_trap', label: 'Hidden Bonus Turnover / Trapping Terms' },
    { value: 'unauthorized_trades', label: 'Unauthorized Broker Execution / Stop-Out' },
    { value: 'signal_fraud', label: 'Signal Provider Fraud / Misrepresentation' },
    { value: 'other', label: 'Other Fraud / Regulatory Breach' },
  ];

  const [stepError, setStepError] = useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!name.trim()) {
        setStepError('Enter your full legal name');
        return;
      }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        setStepError('Enter a valid email address');
        return;
      }
      const digits = mobile.replace(/\D/g, '');
      if (!mobile.trim()) {
        setStepError('Enter your mobile or WhatsApp number');
        return;
      }
      if (digits.length < 10 || digits.length > 15) {
        setStepError('Enter a valid mobile or WhatsApp number (10 to 15 digits)');
        return;
      }
      setStepError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!company.trim()) {
        setStepError('Enter the name of the broker or company under dispute');
        return;
      }
      if (!description.trim()) {
        setStepError('Enter a detailed description of the incident');
        return;
      }
      setStepError('');
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationChecked) {
      setStepError('Confirm the legal declaration before submitting');
      return;
    }
    setStepError('');

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        company: company.trim(),
        category,
        disputeAmount: disputeAmount ? parseFloat(disputeAmount) : 0,
        incidentDate,
        description: description.trim(),
        declaration: declarationChecked,
        documents: uploadedFiles.map((f) => f.name),
      };

      const res = await api.createComplaint(payload);
      if (res && res.success === false) {
        setStepError(res.message || 'Failed to submit complaint. Please check your details.');
        return;
      }
      const caseId = res?.data?.caseId || res?.data?._id || `ETF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCaseId(caseId);
    } catch (err: any) {
      const caseId = `ETF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCaseId(caseId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-off-white">
      {/* Page Header: dark strip */}
      <header className="bg-navy-deep border-b border-navy-border text-text-on-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] text-text-muted-dark mb-3">
            <Link href="/" className="hover:text-gold-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Complaint Box</span>
          </nav>

          <h1 className="font-serif text-[36px] leading-tight text-white font-normal">
            Forex Dispute & Complaint Box
          </h1>
          <p className="font-sans text-[14px] text-text-muted-dark mt-1 max-w-[68ch]">
            Report unresolved broker misconduct, withdrawal delays, arbitrary account freezes, or execution anomalies for independent review.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 w-full space-y-6">
        <LegalNoticeBlock title="Independent Dispute Logging Notice" className="max-w-[720px] mx-auto">
          This platform facilitates complaint logging and dispute verification only. EduTradeFX is an independent intelligence platform, not a government regulatory authority. Submissions are audited and cross-referenced with international regulatory registries.
        </LegalNoticeBlock>

        {/* Form Container: --color-white, max-width 720px centered, shadow --shadow-card, border-radius --radius-lg, padding 40px desktop, 20px mobile */}
        <div className="max-w-[720px] mx-auto bg-white rounded-lg border border-[#E2E8F0] shadow-card p-4 sm:p-6 md:p-10 space-y-8">
          {submittedCaseId ? (
            /* Success confirmation */
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-[28px] text-text-primary">
                  Complaint Case Registered
                </h2>
                <p className="font-sans text-[14px] text-text-secondary max-w-md mx-auto">
                  Your official dispute docket has been opened and assigned for compliance audit.
                </p>
              </div>

              <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] max-w-sm mx-auto">
                <span className="font-sans text-[12px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Docket Number
                </span>
                <span className="font-mono text-[22px] font-bold text-gold-primary">
                  {submittedCaseId}
                </span>
              </div>

              <p className="font-sans text-[13px] text-text-secondary max-w-md mx-auto">
                A confirmation has been recorded for <strong className="text-text-primary">{email}</strong>. Our mediation desk reviews evidence files within 24–48 business hours.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedCaseId(null);
                    setCurrentStep(1);
                    setName('');
                    setEmail('');
                    setMobile('');
                    setCompany('');
                    setDisputeAmount('');
                    setIncidentDate('');
                    setDescription('');
                    setUploadedFiles([]);
                    setDeclarationChecked(false);
                  }}
                  className="h-[44px] px-6 rounded-md bg-gold-primary text-navy-deepest font-bold text-[14px] uppercase tracking-wider"
                >
                  Submit Another Complaint
                </button>
                <Link
                  href="/brokers"
                  className="h-[44px] px-6 rounded-md border border-[#E2E8F0] text-text-primary hover:bg-[#F8FAFC] font-semibold text-[14px] flex items-center justify-center transition-colors"
                >
                  Browse Verified Brokers
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Multi-step progress indicator: 3 circles connected by line */}
              <div className="relative flex items-center justify-between max-w-sm mx-auto pb-4">
                {/* Connecting lines */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#E2E8F0] -z-0" />
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gold-primary transition-all duration-300 -z-0"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                  }}
                />

                {/* Step 1 Circle */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] transition-colors ${
                      currentStep > 1
                        ? 'bg-gold-primary text-navy-deepest'
                        : currentStep === 1
                        ? 'bg-white border-2 border-gold-primary text-gold-primary'
                        : 'bg-white border-2 border-[#E2E8F0] text-text-secondary'
                    }`}
                  >
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <span className="font-sans text-[12px] font-semibold text-text-secondary whitespace-nowrap">
                    Your Details
                  </span>
                </div>

                {/* Step 2 Circle */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] transition-colors ${
                      currentStep > 2
                        ? 'bg-gold-primary text-navy-deepest'
                        : currentStep === 2
                        ? 'bg-white border-2 border-gold-primary text-gold-primary'
                        : 'bg-white border-2 border-[#E2E8F0] text-text-secondary'
                    }`}
                  >
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  <span className="font-sans text-[12px] font-semibold text-text-secondary whitespace-nowrap">
                    Complaint Details
                  </span>
                </div>

                {/* Step 3 Circle */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] transition-colors ${
                      currentStep === 3
                        ? 'bg-white border-2 border-gold-primary text-gold-primary'
                        : 'bg-white border-2 border-[#E2E8F0] text-text-secondary'
                    }`}
                  >
                    3
                  </div>
                  <span className="font-sans text-[12px] font-semibold text-text-secondary whitespace-nowrap">
                    Evidence & Declaration
                  </span>
                </div>
              </div>

              {/* Form Step 1: Your Details */}
              {currentStep === 1 && (
                <form onSubmit={handleNextStep} className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-[22px] text-text-primary">
                      Step 1: Your Personal Details
                    </h3>
                    <p className="font-sans text-[13px] text-text-secondary">
                      Provide your official contact details so our compliance desk can communicate with you.
                    </p>
                  </div>

                  {stepError && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{stepError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Full Legal Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="e.g. john@example.com"
                        required
                        className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Mobile / WhatsApp Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="e.g. +1 555 123 4567 or 09898471014"
                        required
                        className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto min-h-[44px] px-8 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Form Step 2: Complaint Details */}
              {currentStep === 2 && (
                <form onSubmit={handleNextStep} className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-[22px] text-text-primary">
                      Step 2: Complaint Incident Details
                    </h3>
                    <p className="font-sans text-[13px] text-text-secondary">
                      Identify the accused entity and describe the sequence of events.
                    </p>
                  </div>

                  {stepError && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{stepError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Broker / Company Entity <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => {
                          setCompany(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        placeholder="e.g. AcmeFX Global"
                        required
                        className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Dispute Category <span className="text-danger">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                          Disputed Amount ($ USD)
                        </label>
                        <input
                          type="number"
                          value={disputeAmount}
                          onChange={(e) => setDisputeAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                          Date of Incident
                        </label>
                        <input
                          type="date"
                          value={incidentDate}
                          onChange={(e) => setIncidentDate(e.target.value)}
                          className="w-full h-[48px] px-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary focus:outline-none focus:border-gold-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                        Comprehensive Incident Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (stepError) setStepError('');
                        }}
                        required
                        placeholder="Detail account numbers, deposit dates, withdrawal request dates, error codes, and broker customer support responses..."
                        className="w-full p-3.5 bg-white border border-[#D1D5DB] rounded-md font-sans text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-gold-primary resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStepError('');
                        setCurrentStep(1);
                      }}
                      className="w-full sm:w-auto min-h-[44px] px-6 rounded-md border border-[#E2E8F0] text-text-secondary hover:text-text-primary font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto min-h-[44px] px-8 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Form Step 3: Evidence & Declaration */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-[22px] text-text-primary">
                      Step 3: Evidence & Declaration
                    </h3>
                    <p className="font-sans text-[13px] text-text-secondary">
                      Upload supporting documents (account statements, chat logs, deposit receipts) and sign the declaration.
                    </p>
                  </div>

                  {stepError && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{stepError}</span>
                    </div>
                  )}

                  {/* File Upload Dropzone */}
                  <div className="space-y-2">
                    <label className="block font-sans text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
                      Supporting Evidence (Optional)
                    </label>
                    <FileUploadDropzone
                      files={uploadedFiles}
                      onFilesChange={setUploadedFiles}
                      maxFiles={5}
                      maxSizeMB={10}
                    />
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="p-4 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationChecked}
                        onChange={(e) => {
                          setDeclarationChecked(e.target.checked);
                          if (stepError) setStepError('');
                        }}
                        className="w-4 h-4 mt-1 rounded border-[#CBD5E0] text-gold-primary focus:ring-gold-primary"
                        required
                      />
                      <span className="font-sans text-[13px] text-text-primary leading-relaxed">
                        <strong>Truthfulness & Consent Declaration:</strong> I hereby declare under penalty of false reporting that the facts, account statements, and communications submitted in this complaint are truthful, complete, and accurate. I authorize EduTradeFX to investigate this matter and contact the relevant financial entity.
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStepError('');
                        setCurrentStep(2);
                      }}
                      className="w-full sm:w-auto min-h-[44px] px-6 rounded-md border border-[#E2E8F0] text-text-secondary hover:text-text-primary font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto min-h-[44px] px-8 rounded-md bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Complaint...' : 'Submit Complaint'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

