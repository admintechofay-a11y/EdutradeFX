import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Database, Globe, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | EduTradeFX',
  description: 'Understand how EduTradeFX collects, safeguards, and processes personal information, course records, and dispute data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-16 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: January 1, 2026 • Compliant with Global Privacy Regulations
          </p>
        </div>

        {/* Content Box */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed bg-brand-navy-card border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-blue" />
              1. Information We Collect
            </h2>
            <p>
              When you interact with EduTradeFX, we may collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-200">Account Credentials:</strong> Full name, verified email address, phone number with country code, and encrypted password hash during registration.
              </li>
              <li>
                <strong className="text-slate-200">Trader Grievance & Dispute Data:</strong> Contact information, accused broker/entity name, deposit transaction hashes, account numbers, dispute statements, and uploaded screenshots submitted via the Complaint Box.
              </li>
              <li>
                <strong className="text-slate-200">Learning Records:</strong> Enrolled courses, video watch duration, quiz submissions, certificate issues, and tutor communication history.
              </li>
              <li>
                <strong className="text-slate-200">Technical Telemetry:</strong> Anonymized IP addresses, browser fingerprint, operating system, and referral headers used strictly for security monitoring and fraud mitigation.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-blue" />
              2. How We Utilize Your Data
            </h2>
            <p>
              EduTradeFX utilizes your information for legitimate educational and operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Authenticating user sessions and providing personalized portal access.</li>
              <li>Processing grievance mediation with brokerages and logging anonymized dispute stats.</li>
              <li>Delivering course content, issuing verifiable graduation certificates, and grading LMS assessments.</li>
              <li>Dispatching critical platform updates, security alerts, and dispute resolution status notifications.</li>
              <li>Detecting and thwarting review manipulation, spam accounts, and malicious platform probing.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-blue" />
              3. Data Protection & Security Architecture
            </h2>
            <p>
              We implement industry-grade technical and organizational safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>All passwords are hashed using salt rounds via bcrypt before database persistence.</li>
              <li>All web traffic is encrypted in transit using TLS 1.3 / HTTPS.</li>
              <li>Authentication tokens are managed via secure, HttpOnly, SameSite JSON Web Tokens (JWT).</li>
              <li>Relational data is stored in isolated PostgreSQL clusters with strict automated daily backups and least-privilege role boundaries.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-blue" />
              4. Third-Party Disclosures & Broker Sharing
            </h2>
            <p>
              <strong>We do not sell, rent, or trade your personal data to advertisers or telemarketers.</strong> Information may only be disclosed under the following narrow conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">Grievance Counterparties:</strong> If you file a formal dispute against a broker or account manager and give consent, we disclose relevant transaction receipts to that entity solely to facilitate refund or dispute mediation.
              </li>
              <li>
                <strong className="text-slate-200">Legal Compliance:</strong> When compelled by valid court orders, regulatory subpoenas, or statutory law enforcement mandates.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-blue" />
              5. Your Rights & Data Choices
            </h2>
            <p>
              Regardless of your geographical residence, EduTradeFX grants all registered members the following control over their data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>The right to request a complete export of your personal profile and learning records.</li>
              <li>The right to correct inaccurate account information at any time via your user dashboard.</li>
              <li>The right to request permanent account closure and erasure of personal data ("Right to be Forgotten"), subject to mandatory financial record retention requirements.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-white">Data Protection Officer Contact</h2>
            <p>
              To exercise any privacy rights, request data erasure, or report security vulnerabilities, contact our Data Protection Officer at:
            </p>
            <div className="text-xs font-mono text-brand-blue">
              privacy@edutradefx.com • Attention: Data Protection Officer
            </div>
          </section>

        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <span>•</span>
          <Link href="/risk-disclaimer" className="hover:text-white transition">Risk Disclaimer</Link>
          <span>•</span>
          <Link href="/complaint-box" className="hover:text-white transition">Complaint Box</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
        </div>

      </div>
    </div>
  );
}
