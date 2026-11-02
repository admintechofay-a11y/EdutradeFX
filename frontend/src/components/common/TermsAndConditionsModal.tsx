'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Scale, Shield, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  initialTab?: 'terms' | 'privacy' | 'risk';
}

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept, initialTab = 'terms' }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'risk'>(initialTab);
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll state on open or tab change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setHasScrolledBottom(false);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, initialTab]);

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
                ? 'bg-white text-blue shadow-sm font-bold border border-border'
                : 'text-text-muted hover:text-text-heading'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Risk Disclaimer</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Terms and conditions body"
          className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed focus:outline-none"
        >
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-text-heading text-sm">EduTradeFX Terms of Service</h4>
              <p>
                By creating an account on EduTradeFX (&quot;Platform&quot;), you acknowledge and agree that EduTradeFX is an independent educational marketplace and technology service aggregator.
              </p>
              <p>
                EduTradeFX does not operate as a broker, financial advisor, or asset custodian. You are solely responsible for ensuring compliance with your local financial regulations before trading forex, CFDs, or accessing institutional services.
              </p>
              <h5 className="font-semibold text-text-heading text-xs uppercase tracking-wider pt-2">User Conduct & Eligibility</h5>
              <p>
                You warrant that you are at least 18 years of age and legally competent to enter into binding agreements. You must provide truthful, current, and verifiable information during registration.
              </p>
              <h5 className="font-semibold text-text-heading text-xs uppercase tracking-wider pt-2">Third-Party Listings</h5>
              <p>
                Brokers, Signal Providers, Account Managers, and Solutions Providers listed on EduTradeFX operate independently. Listing on this platform does not constitute an endorsement, guarantee of solvency, or warranty of performance.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-text-heading text-sm">Privacy & Data Protection Policy</h4>
              <p>
                EduTradeFX is committed to safeguarding personal identifiable information (PII). We collect essential contact information, IP addresses, and verification evidence solely to administer accounts, satisfy AML/KYC obligations, and prevent fraud.
              </p>
              <p>
                Your registration data is stored securely and never sold to third-party marketing brokers. When you initiate an enquiry with an institutional provider, relevant contact fields are securely transmitted to facilitate that business connection.
              </p>
              <h5 className="font-semibold text-text-heading text-xs uppercase tracking-wider pt-2">Sensitive Documentation</h5>
              <p>
                Regulatory licenses, ID cards, and incorporation certificates uploaded during partner verification are stored in isolated encrypted cloud vaults with restricted administrative access.
              </p>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-3">
              <h4 className="font-bold text-text-heading text-sm text-orange flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange shrink-0" />
                <span>High-Risk Investment Warning</span>
              </h4>
              <p className="font-semibold text-text-heading">
                Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) carries a high degree of risk and can result in the loss of your entire capital.
              </p>
              <p>
                Between 74% and 89% of retail investor accounts lose money when trading CFDs with regulated brokers. Leverage can amplify both profits and losses exponentially.
              </p>
              <p>
                Past performance of audited account managers or signal feeds is not indicative of future results. Never trade or invest funds that you cannot afford to lose completely.
              </p>
            </div>
          )}

          <div className="p-3 bg-surface-tint rounded-xl border border-border text-[11px] text-text-muted">
            <span className="font-semibold text-text-heading">Scroll requirement: </span>
            Please scroll to the bottom of the section to unlock acceptance.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="text-xs text-text-muted flex items-center gap-1.5">
            {hasScrolledBottom ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready to accept
              </span>
            ) : (
              <span>Scroll down to enable acceptance</span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-muted hover:text-text-heading hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!hasScrolledBottom}
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue text-white text-xs font-bold hover:bg-blue-hover transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              I Accept & Agree
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
