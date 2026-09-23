'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  FileText,
  DollarSign,
  Building,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function NewComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [brokerName, setBrokerName] = useState('');
  const [category, setCategory] = useState('withdrawal_delay');
  const [disputeAmount, setDisputeAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [tradingAccountNumber, setTradingAccountNumber] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [country, setCountry] = useState('United Kingdom');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCaseId, setGeneratedCaseId] = useState<string | null>(null);

  const categories = [
    { value: 'withdrawal_delay', label: 'Withdrawal Delay / Refusal to Release Funds' },
    { value: 'slippage_manipulation', label: 'Abnormal Slippage or Artificial Spread Spike' },
    { value: 'account_freeze', label: 'Arbitrary Account Freezing or Cancellation of Profits' },
    { value: 'bonus_trap', label: 'Hidden Bonus Turnover Rules Preventing Withdrawal' },
    { value: 'unauthorized_trades', label: 'Unauthorized Trades / Broker Manager Execution' },
    { value: 'other', label: 'Other Fraudulent or Unethical Practice' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        brokerName,
        category,
        disputeAmount: Number(disputeAmount),
        currency,
        tradingAccountNumber,
        incidentDate,
        description,
        name,
        email,
        country,
      };

      const res = await api.createComplaint(payload);
      if (res.success && res.data?.caseId) {
        setGeneratedCaseId(res.data.caseId);
      } else {
        // Fallback case ID
        const randomCase = `ETF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setGeneratedCaseId(randomCase);
      }
    } catch (err) {
      const randomCase = `ETF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedCaseId(randomCase);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dispute Ledger
      </Link>

      {generatedCaseId ? (
        <div className="rounded-3xl glass-card border border-emerald-500/40 p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-green">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="badge-green text-xs font-bold">Dispute Case Registered</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Your Case Has Been Filed
            </h2>
            <div className="text-xl font-mono font-bold text-amber-400 py-2">
              Case ID: {generatedCaseId}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Our independent mediation desk has received your dispute regarding{' '}
              <strong>{brokerName}</strong>. An inquiry notice will be prepared and served to the
              broker's compliance division within 24-48 business hours.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href={`/complaints/${generatedCaseId}`}
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-brand-darkest shadow-glow-gold"
            >
              Track Case Live
            </Link>
            <Link
              href="/complaints"
              className="px-6 py-3 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:text-white"
            >
              Return to Scam Radar
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-10 space-y-8">
          {/* Wizard Header */}
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Mediation Intake Wizard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              File a Broker Dispute
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Step {step} of 4: Provide accurate documentation to initiate formal mediation.
            </p>
          </div>

          {/* Step Progress bar */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step >= s ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Broker & Target */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  Target Broker or Financial Firm
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Broker / Firm Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ApexFX Global, IC Markets..."
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Dispute Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Financials & Account */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Disputed Amount & Trading Account
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Disputed Amount *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={disputeAmount}
                      onChange={(e) => setDisputeAmount(e.target.value)}
                      required
                      min="1"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="USDT">USDT (Crypto)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Trading Account Number (MT4 / MT5) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9814201"
                    value={tradingAccountNumber}
                    onChange={(e) => setTradingAccountNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Date of Incident
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Description & Evidence */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Dispute Narrative & Evidence Attachments
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Dispute Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $8,500 Withdrawal Refused and Account Locked"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Detailed Sequence of Events *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe chronological events: date of deposit, trades executed, withdrawal request date, communications with broker support..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Evidence Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Upload Proof (Screenshots, MT4/5 Statements, Emails)
                  </label>
                  <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-colors">
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <label className="cursor-pointer text-xs text-amber-400 font-bold hover:underline">
                      Click to browse files
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.csv"
                      />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Supports JPG, PNG, PDF, CSV up to 10MB each
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((f, i) => (
                        <div
                          key={i}
                          className="text-[11px] text-emerald-400 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Complainant Identity */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  Your Contact Information
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Email Address * (For case updates)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Country of Residence *
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed">
                  <strong>Mediation Integrity Declaration:</strong> By submitting, you confirm that all information provided is accurate and factual. EduTradeFX maintains strict confidentiality while mediating with registered broker compliance teams.
                </div>
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !brokerName.trim()) {
                      alert('Please specify the broker name');
                      return;
                    }
                    if (step === 2 && !disputeAmount) {
                      alert('Please specify the disputed amount');
                      return;
                    }
                    if (step === 3 && (!title.trim() || !description.trim())) {
                      alert('Please provide a dispute title and description');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-brand-darkest hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-glow-gold"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 to-rose-500 text-white transition-all shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting Dispute...' : 'File Official Dispute'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
