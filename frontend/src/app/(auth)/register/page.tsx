'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Users,
  Radio,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Briefcase,
  MailCheck,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Role } from '../../../types';
import PhoneInput from '../../../components/common/PhoneInput';
import PasswordStrengthMeter, { evaluatePasswordStrength } from '../../../components/common/PasswordStrengthMeter';
import TermsAndConditionsModal from '../../../components/common/TermsAndConditionsModal';

export default function RegisterPage() {
  const router = useRouter();

  // Mode: 'TRADER' or 'PARTNER'
  const [mode, setMode] = useState<'TRADER' | 'PARTNER'>('TRADER');
  const [partnerRole, setPartnerRole] = useState<Role>('BROKER');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consent, setConsent] = useState(false);

  // Email validation & duplicate check (A2)
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password strength (A3)
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);

  // Terms Modal (A4)
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Submission & Pending Verification (A5)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);

  // Debounced email check
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
    } catch (err: any) {
      // Non-blocking on network failure
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

  // Cooldown timer for resend verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await api.post('/auth/resend-verification', { email: email.trim().toLowerCase() });
      const devUrl = res.data?.data?.devVerificationUrl || res.data?.devVerificationUrl;
      if (devUrl) {
        setDevVerificationUrl(devUrl);
      }
      setResendMessage('A new verification email has been sent. Please check your inbox.');
      setResendCooldown(60);
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Failed to resend. Please try again shortly.');
    } finally {
      setResendLoading(false);
    }
  };

  // B1: Partner Role card label changed from "Brokerage Firm" to "Broker"
  const partnerOptions = [
    { role: 'BROKER' as Role, label: 'Broker', desc: 'List your regulated broker & acquire verified trader leads', icon: Building2 },
    { role: 'ACCOUNT_MANAGER' as Role, label: 'Account Manager', desc: 'Offer audited PAMM / MAM portfolio management', icon: Users },
    { role: 'SIGNAL_PROVIDER' as Role, label: 'Signal Provider', desc: 'Publish audited trading signals & execution analytics', icon: Radio },
    { role: 'TUTOR' as Role, label: 'Course Instructor', desc: 'Create Academy masterclasses & monetize lessons', icon: GraduationCap },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('You must review and accept the Terms of Service, Privacy Policy, and High-Risk Warning.');
      return;
    }

    if (!phone || phone.trim().length < 7) {
      setError('A valid mobile phone number with country code is required.');
      return;
    }

    if (emailAvailable === false) {
      setError('This email is already registered. Please log in or use a different email.');
      return;
    }

    const { isSufficient } = evaluatePasswordStrength(password);
    if (!isSufficient) {
      setError('Password is too weak. Ensure it is at least 8 characters and includes uppercase, lowercase, numbers, and special symbols.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const isPartner = mode === 'PARTNER';
      const endpoint = isPartner ? '/auth/register-partner' : '/auth/register';
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        consent: true,
      };

      if (isPartner) {
        payload.role = partnerRole;
      }

      const res = await api.post(endpoint, payload);
      const devUrl = res.data?.data?.devVerificationUrl || res.data?.devVerificationUrl;
      if (devUrl) {
        setDevVerificationUrl(devUrl);
      }

      // Verify before create (A5) - account is pending email confirmation
      setPendingVerification(true);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render Pending Verification Screen (A5) ──────────────
  if (pendingVerification) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-tint">
        <div className="w-full max-w-lg space-y-6 bg-white border border-border p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-lift text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto mx-auto" />
          </Link>

          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue flex items-center justify-center mx-auto shadow-inner">
            <MailCheck className="w-8 h-8 text-blue" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              Verify Your Email
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
              We sent an activation link to <strong className="text-navy">{email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
          </div>

          {devVerificationUrl && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 text-left space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-800">
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Development Quick Activation:</span>
              </div>
              <p>
                In local development mode without live SMTP credentials, you can activate your account immediately:
              </p>
              <a
                href={devVerificationUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-sm"
              >
                <span>Activate Account Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Activation Required:</span>
            </div>
            <p>
              Your account is not created until you verify your email address. The link expires in 24 hours. Be sure to check your spam/junk folder if not received within 2 minutes.
            </p>
          </div>

          {resendMessage && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue font-medium">
              {resendMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-tint hover:bg-border/60 disabled:opacity-50 text-navy font-bold text-xs rounded-full border border-border transition min-h-[44px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Verification Email'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPendingVerification(false);
                setError(null);
              }}
              className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-text-muted hover:text-text-heading transition"
            >
              Wrong email? Go back
            </button>
          </div>

          <div className="pt-4 border-t border-border text-xs text-text-muted">
            Already verified?{' '}
            <Link href="/login" className="font-bold text-blue hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Registration Form ──────────────────────────────
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-tint">
      <div className="w-full max-w-xl space-y-5 sm:space-y-6 bg-white border border-border p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lift">
        
        {/* Brand Logo & Heading */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logos/logo-color.svg" alt="EduTradeFX" className="h-8 sm:h-9 w-auto" />
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text-heading">Create Your Account</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Access verified broker audits, institutional courses, and dispute protection
          </p>
        </div>

        {/* Account Mode Toggle (Trader vs Partner) */}
        <div className="flex flex-col xs:flex-row p-1 sm:p-1.5 rounded-2xl xs:rounded-full bg-surface-tint border border-border gap-1 xs:gap-0">
          <button
            type="button"
            onClick={() => setMode('TRADER')}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl xs:rounded-full text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 min-h-[40px] ${
              mode === 'TRADER'
                ? 'bg-blue text-white shadow-soft'
                : 'text-text-muted hover:text-text-heading'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Trader Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('PARTNER')}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl xs:rounded-full text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 min-h-[40px] ${
              mode === 'PARTNER'
                ? 'bg-blue text-white shadow-soft'
                : 'text-text-muted hover:text-text-heading'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Institutional Partner</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Partner Role Picker (B1: Renamed Brokerage Firm -> Broker) */}
        {mode === 'PARTNER' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Institutional Entity Type:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {partnerOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = partnerRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setPartnerRole(opt.role)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50 border-blue text-text-heading ring-1 ring-blue'
                        : 'bg-white border-border text-text-muted hover:border-blue'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-text-heading">{opt.label}</div>
                      <div className="text-[10px] text-text-muted mt-0.5 leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              Institutional partner applications require compliance verification before public listing activation.
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
              {mode === 'PARTNER' ? 'Entity / Representative Full Name *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Email Field with Live Duplicate Check (A2) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider">
                  Email Address *
                </label>
                {emailChecking && (
                  <span className="text-[10px] text-blue font-medium animate-pulse">Checking availability...</span>
                )}
                {emailAvailable === true && (
                  <span className="text-[10px] text-green font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Email available
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => checkEmailAvailability(email)}
                  placeholder="alex@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:ring-1 ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : emailAvailable === true
                      ? 'border-green focus:border-green focus:ring-green'
                      : 'border-border focus:border-blue focus:ring-blue'
                  }`}
                />
              </div>
              {emailError && (
                <div className="mt-1.5 flex items-center justify-between text-xs text-red-600">
                  <span>{emailError}</span>
                  <Link href="/login" className="font-bold text-blue hover:underline">
                    Log in instead &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile with Country-Code Dropdown (A1, B12) */}
            <div>
              <PhoneInput
                label="Mobile Number *"
                name="phone"
                value={phone}
                onChange={setPhone}
                required
              />
            </div>
          </div>

          {/* Password with Strength Meter (A3) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-heading min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter (A3) */}
              <PasswordStrengthMeter
                password={password}
                onStrengthChange={(isStrong) => setIsPasswordStrong(isStrong)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-12 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:ring-1 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-border focus:border-blue focus:ring-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-heading min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1 text-[11px] text-red-500">Passwords do not match.</p>
              )}
            </div>
          </div>

          {/* Mandatory T&C Checkbox with Modal Trigger (A4) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-surface-tint border border-border space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentCheckbox"
                checked={consent}
                disabled={!consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue border-border focus:ring-blue shrink-0 disabled:opacity-50 cursor-pointer"
              />
              <div className="text-xs text-text-body leading-relaxed">
                <span>
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-blue hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Terms & Conditions, Privacy Policy & Risk Warning</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </span>
                {!consent && (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    ⚠️ You must review the legal terms in full before enabling this checkbox.
                  </p>
                )}
              </div>
            </div>

            {!consent && (
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-border rounded-xl text-xs font-semibold text-blue flex items-center justify-center gap-1.5 transition"
              >
                <span>Read & Review Terms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !consent || !isPasswordStrong || (confirmPassword !== '' && confirmPassword !== password) || emailAvailable === false}
            className="w-full py-3.5 sm:py-4 bg-orange hover:bg-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-full transition shadow-soft flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>
              {loading
                ? 'Submitting...'
                : mode === 'PARTNER'
                ? 'Submit Partner Registration'
                : 'Create Free Trader Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-border text-xs text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue hover:text-blue-hover transition inline-block py-1">
            Sign In Here
          </Link>
        </div>

      </div>

      {/* Terms & Conditions Modal (A4) */}
      <TermsAndConditionsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => setConsent(true)}
      />
    </div>
  );
}
