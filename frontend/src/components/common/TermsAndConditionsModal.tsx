'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Scale, Shield, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'risk'>('terms');
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll state on open or tab change
  useEffect(() => {
    if (isOpen) {
      setHasScrolledBottom(false);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, activeTab]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Considered scrolled to bottom if within 40px of bottom
    if (scrollHeight - scrollTop - clientHeight < 40) {
      setHasScrolledBottom(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-tint">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-heading">
                Terms & Regulatory Conditions
              </h3>
              <p className="text-[11px] text-text-muted">
                Please review all sections before creating your account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-text-muted hover:text-text-heading rounded-full hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-slate-50/70 p-1.5 gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition whitespace-nowrap min-h-[38px] ${
              activeTab === 'terms'
                ? 'bg-white text-blue shadow-sm font-bold border border-border'
                : 'text-text-muted hover:text-text-heading'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>1. Terms of Service</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition whitespace-nowrap min-h-[38px] ${
              activeTab === 'privacy'
                ? 'bg-white text-blue shadow-sm font-bold border border-border'
                : 'text-text-muted hover:text-text-heading'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>2. Privacy Policy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition whitespace-nowrap min-h-[38px] ${
              activeTab === 'risk'
                ? 'bg-white text-red-600 shadow-sm font-bold border border-border'
                : 'text-text-muted hover:text-text-heading'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>3. Risk Warning</span>
          </button>
        </div>

        {/* Content Body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm text-text-body space-y-4 leading-relaxed"
        >
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <strong>Platform Notice:</strong> EduTradeFX is an independent financial technology directory, community, and educational resource. EduTradeFX is not a broker, custodian, or investment advisor.
              </div>
              <h4 className="font-bold text-sm text-text-heading">1. Acceptance & Eligibility</h4>
              <p>
                By registering an account on EduTradeFX, you certify that you are at least 18 years of age or the age of legal majority in your jurisdiction. You agree to be legally bound by these terms, and agree that all details provided during onboarding are accurate and true.
              </p>
              <h4 className="font-bold text-sm text-text-heading">2. Broker Directories & Reviews</h4>
              <p>
                All ratings, broker directories, and fee specifications published on EduTradeFX are compiled for informational transparency. While we perform compliance audits of regulatory licenses, traders must perform their own due diligence before opening accounts or depositing capital.
              </p>
              <h4 className="font-bold text-sm text-text-heading">3. Account Integrity</h4>
              <p>
                You are responsible for safeguarding your login credentials. You agree to notify us immediately of any unauthorized account activity. EduTradeFX will never ask you for your account password or payment card PIN via email or phone.
              </p>
              <h4 className="font-bold text-sm text-text-heading">4. Dispute Facilitation</h4>
              <p>
                The EduTradeFX Complaint Box and dispute assistance service facilitates dialogue between traders and financial brokers. EduTradeFX acts as an impartial community facilitator and does not guarantee financial recovery or legal damages.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <strong>Data Protection:</strong> Your personal data is protected under modern encryption standards and is never sold to third-party telemarketers.
              </div>
              <h4 className="font-bold text-sm text-text-heading">1. Information We Collect</h4>
              <p>
                We collect your name, email address, phone number (E.164 format), IP address, and optional trader profile data (city, country, social media links). For institutional partners, we collect company verification documents and regulatory licenses.
              </p>
              <h4 className="font-bold text-sm text-text-heading">2. How We Use Your Data</h4>
              <p>
                Your data is used to secure your account, verify your identity, send educational notifications, and route direct broker inquiries to the administrative compliance team. Broker inquiry data is held strictly by EdutradeFX and never automatically broadcasted.
              </p>
              <h4 className="font-bold text-sm text-text-heading">3. Cookies & Security</h4>
              <p>
                We use secure, HTTP-only cookies and cryptographic tokens to maintain your authentication state. All sessions are logged with audit trails for dispute resolution.
              </p>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                <strong className="block text-red-700 font-bold mb-1">HIGH RISK INVESTMENT WARNING:</strong>
                Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) involves a high level of risk and may not be suitable for all investors. Leverage can work against you as well as for you.
              </div>
              <h4 className="font-bold text-sm text-text-heading">1. Potential for Total Loss</h4>
              <p>
                Before deciding to trade foreign exchange or any other financial instrument you should carefully consider your investment objectives, level of experience, and risk appetite. There is a possibility that you may sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.
              </p>
              <h4 className="font-bold text-sm text-text-heading">2. No Financial Advice</h4>
              <p>
                Nothing on EduTradeFX constitutes financial, legal, or tax advice. Past performance of signal providers, algorithms, or account managers is not an indicator of future results.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface-tint flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-text-muted text-center sm:text-left">
            {hasScrolledBottom ? (
              <span className="text-green font-semibold flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 className="w-3.5 h-3.5" /> All legal sections reviewed
              </span>
            ) : (
              <span>Scroll down or review tabs to acknowledge terms</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-border bg-white text-text-heading font-semibold text-xs hover:bg-slate-50 transition min-h-[42px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-blue hover:bg-blue-hover text-white font-bold text-xs transition shadow-soft flex items-center justify-center gap-1.5 min-h-[42px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Read & Agree</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
