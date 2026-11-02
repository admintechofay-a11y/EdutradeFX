'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Briefcase,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import PhoneInput from '../common/PhoneInput';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '../common/PasswordStrengthMeter';
import TermsAndConditionsModal from '../common/TermsAndConditionsModal';
import { api } from '../../lib/api';

const FREE_MAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'zoho.com',
  'protonmail.com',
  'mail.com',
  'yandex.com',
  'gmx.com',
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'REGISTERED_COMPANY', label: 'Registered Company' },
  { value: 'INDIVIDUAL_PROVIDER', label: 'Individual Service Provider' },
  { value: 'TECHNOLOGY_DEVELOPER', label: 'Technology Developer' },
  { value: 'CONSULTANCY', label: 'Consultancy' },
  { value: 'FINANCIAL_INSTITUTION', label: 'Financial Institution' },
  { value: 'OTHER', label: 'Other' },
];

interface ProviderRegisterFieldsProps {
  loading: boolean;
  onSubmit: (payload: any) => Promise<void>;
  onError: (msg: string | null) => void;
}

export default function ProviderRegisterFields({ loading, onSubmit, onError }: ProviderRegisterFieldsProps) {
  // Form State
  const [accountType, setAccountType] = useState('REGISTERED_COMPANY');
  const [accountTypeOther, setAccountTypeOther] = useState('');
  const [contactFullName, setContactFullName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Consents (both required separately)
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);

  // Email validation & checking
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Terms Modal State
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'terms' | 'privacy'>('terms');

  // Check email availability
  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    const trimmed = emailToCheck.trim().toLowerCase();
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!trimmed || !isValidFormat) {
      setEmailAvailable(null);
      setEmailError(trimmed ? 'Please enter a valid email address.' : null);
      return;
    }

    setEmailChecking(true);
    setEmailError(null);

    try {
      const res = await api.get('/auth/check-email', { params: { email: trimmed } });
      const available = res.data?.data?.available ?? true;
      setEmailAvailable(available);
      if (!available) {
        setEmailError('This email is already registered.');
      } else {
        setEmailError(null);
      }
    } catch {
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setEmailAvailable(null);
    setEmailError(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      checkEmailAvailability(val);
    }, 500);
  };

  // Free-mail warning calculation
  const emailDomain = email.trim().toLowerCase().split('@')[1] || '';
  const isFreeMail = FREE_MAIL_DOMAINS.includes(emailDomain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    if (!accountType) {
      onError('Please select your provider account type.');
      return;
    }

    if (accountType === 'OTHER' && !accountTypeOther.trim()) {
      onError('Please specify your provider account type.');
      return;
    }

    if (!contactFullName.trim() || contactFullName.trim().length < 2) {
      onError("Contact person's full name must be at least 2 characters.");
      return;
    }

    if (!contactTitle.trim() || contactTitle.trim().length < 2) {
      onError('Job title must be at least 2 characters.');
      return;
    }

    if (!email || emailError) {
      onError(emailError || 'Please enter a valid business email.');
      return;
    }

    if (emailAvailable === false) {
      onError('This email is already registered. Please log in or use another email.');
      return;
    }

    if (!phone || phone.trim().length < 7) {
      onError('A valid mobile business phone number with country code is required.');
      return;
    }

    const { isSufficient } = evaluatePasswordStrength(password);
    if (!isSufficient) {
      onError('Password is too weak. Ensure at least 8 characters with upper, lower, digit, and symbol.');
      return;
    }

    if (password !== confirmPassword) {
      onError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!consentTerms) {
      onError('You must review and accept the Solutions Provider Terms and Conditions.');
      return;
    }

    if (!consentPrivacy) {
      onError('You must review and accept the Privacy & Data Protection Policy.');
      return;
    }

    const payload = {
      name: contactFullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: 'SERVICE_PROVIDER',
      accountType,
      accountTypeOther: accountType === 'OTHER' ? accountTypeOther.trim() : undefined,
      contactFullName: contactFullName.trim(),
      contactTitle: contactTitle.trim(),
      consent: true,
      consentTerms: true,
      consentPrivacy: true,
    };

    await onSubmit(payload);
  };

  const openTermsModal = (tab: 'terms' | 'privacy') => {
    setModalInitialTab(tab);
    setTermsModalOpen(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* 1. Provider Account Type */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">
          Provider Account Type <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-border text-base sm:text-sm text-text-heading bg-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition tap-target min-h-[44px]"
          >
            {ACCOUNT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1.1 Account Type Other Text */}
      {accountType === 'OTHER' && (
        <div className="animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-text-heading mb-1.5">
            Specify Account Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Algorithmic Research Lab, Hosting Provider"
            value={accountTypeOther}
            onChange={(e) => setAccountTypeOther(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-border text-base sm:text-sm text-text-heading placeholder-text-muted/60 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition min-h-[44px]"
          />
        </div>
      )}

      {/* 2. Contact Person's Full Name */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">
          Contact Person&apos;s Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Alex Morgan"
            value={contactFullName}
            onChange={(e) => setContactFullName(e.target.value)}
            className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-base sm:text-sm text-text-heading placeholder-text-muted/60 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition min-h-[44px]"
          />
        </div>
      </div>

      {/* 3. Job Title */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">
          Job Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Briefcase className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Managing Director, Head of Institutional Partnerships"
            value={contactTitle}
            onChange={(e) => setContactTitle(e.target.value)}
            className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-base sm:text-sm text-text-heading placeholder-text-muted/60 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition min-h-[44px]"
          />
        </div>
      </div>

      {/* 4. Business Email */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-text-heading">
            Business Email (Account Login) <span className="text-red-500">*</span>
          </label>
          {emailChecking && (
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-blue" /> Checking...
            </span>
          )}
          {!emailChecking && emailAvailable === true && (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Available
            </span>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            placeholder="alex.m@solutionsgroup.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-base sm:text-sm text-text-heading placeholder-text-muted/60 focus:outline-none transition min-h-[44px] ${
              emailError
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-border focus:border-blue focus:ring-1 focus:ring-blue'
            }`}
          />
        </div>
        {emailError && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {emailError}
          </p>
        )}
        {/* Free-mail non-blocking advisory banner */}
        {isFreeMail && !emailError && (
          <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Tip:</strong> Free-mail address detected (<strong>{emailDomain}</strong>). We recommend using your official corporate domain for faster institutional compliance verification.
            </span>
          </div>
        )}
      </div>

      {/* 5. Business Phone */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">
          Business Phone Number <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          required
          placeholder="Enter direct or office mobile"
        />
      </div>

      {/* 6. Password & Confirm Password */}
      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">
          Account Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Min. 8 characters with upper, lower, number, symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-border text-base sm:text-sm text-text-heading placeholder-text-muted/60 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition min-h-[44px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-heading transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrengthMeter password={password} />
      </div>

      <div>
        <label className="block text-xs font-bold text-text-heading mb-1.5">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            placeholder="Re-enter password exactly"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-base sm:text-sm text-text-heading placeholder-text-muted/60 focus:outline-none transition min-h-[44px] ${
              confirmPassword && password !== confirmPassword
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-border focus:border-blue focus:ring-1 focus:ring-blue'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-heading transition"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 7. Two Separate Required Checkboxes */}
      <div className="pt-2 space-y-3 border-t border-border">
        {/* Checkbox 1: Terms */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-tint border border-border">
          <input
            type="checkbox"
            id="providerConsentTerms"
            checked={consentTerms}
            onChange={(e) => setConsentTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue border-border focus:ring-blue cursor-pointer tap-target"
          />
          <label htmlFor="providerConsentTerms" className="text-xs text-text-muted leading-relaxed cursor-pointer">
            I confirm that I am authorised to submit listings and agree to the{' '}
            <button
              type="button"
              onClick={() => openTermsModal('terms')}
              className="font-bold text-blue hover:underline inline-flex items-center gap-0.5"
            >
              <span>Solutions Provider Terms & Conditions</span>
              <ExternalLink className="w-3 h-3 inline" />
            </button>
            . <span className="text-red-500 font-bold">*</span>
          </label>
        </div>

        {/* Checkbox 2: Privacy */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-tint border border-border">
          <input
            type="checkbox"
            id="providerConsentPrivacy"
            checked={consentPrivacy}
            onChange={(e) => setConsentPrivacy(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue border-border focus:ring-blue cursor-pointer tap-target"
          />
          <label htmlFor="providerConsentPrivacy" className="text-xs text-text-muted leading-relaxed cursor-pointer">
            I understand and consent to the{' '}
            <button
              type="button"
              onClick={() => openTermsModal('privacy')}
              className="font-bold text-blue hover:underline inline-flex items-center gap-0.5"
            >
              <span>EduTradeFX Privacy & Data Protection Policy</span>
              <ExternalLink className="w-3 h-3 inline" />
            </button>
            . <span className="text-red-500 font-bold">*</span>
          </label>
        </div>
      </div>

      {/* 8. Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !consentTerms || !consentPrivacy}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue hover:bg-blue-hover text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tap-target min-h-[48px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Provider Account</span>
          )}
        </button>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={termsModalOpen}
        initialTab={modalInitialTab}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => {
          if (modalInitialTab === 'terms') {
            setConsentTerms(true);
          } else {
            setConsentPrivacy(true);
          }
        }}
      />
    </form>
  );
}

