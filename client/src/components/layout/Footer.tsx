'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/edutradefx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: 'Twitter/X',
    href: 'https://twitter.com/edutradefx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/edutradefx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/edutradefx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@edutradefx',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-navy-deepest border-t border-navy-border pt-16 pb-8">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        {/* Four-column layout (desktop) / two-column (tablet) / one-column (mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Shield className="w-5 h-5 text-gold-primary transition-transform group-hover:scale-105" />
              <span className="font-serif text-[22px] tracking-tight leading-none text-white flex items-center">
                EduTrade<span className="text-gold-primary">FX</span>
              </span>
            </Link>
            <p className="font-sans text-[13px] text-text-muted-dark leading-relaxed">
              EduTradeFX is an independent Forex intelligence platform providing unbiased broker evaluations, verified manager track records, and structured education. Our mission is to protect retail traders and promote industry transparency through objective data.
            </p>
            {/* Social icons row */}
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full bg-navy-surface text-text-muted-dark hover:bg-gold-primary hover:text-navy-deepest flex items-center justify-center transition-all duration-150"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Platform */}
          <div className="space-y-4">
            <h4 className="font-sans text-[12px] font-bold text-gold-primary uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/brokers"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Forex Brokers
                </Link>
              </li>
              <li>
                <Link
                  href="/account-managers"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Account Managers
                </Link>
              </li>
              <li>
                <Link
                  href="/signal-providers"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Signal Providers
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Compare Brokers
                </Link>
              </li>
              <li>
                <Link
                  href="/complaint-box"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Complaint Box
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Learn */}
          <div className="space-y-4">
            <h4 className="font-sans text-[12px] font-bold text-gold-primary uppercase tracking-widest">
              Education
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/education"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/education?level=Beginner"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Beginner Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/education?level=Advanced"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Advanced Strategies
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?subject=tutor"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Become a Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div className="space-y-4">
            <h4 className="font-sans text-[12px] font-bold text-gold-primary uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?subject=advertise"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Advertise With Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/about#privacy"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/about#terms"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/about#risk"
                  className="font-sans text-[13px] text-text-muted-dark hover:text-text-on-dark transition-colors"
                >
                  Risk Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-border pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[12px] text-text-muted-dark">
            © 2025 EduTradeFX. All rights reserved.
          </p>
          <div className="flex items-center gap-3 font-sans text-[12px] text-text-muted-dark">
            <Link href="/about#risk" className="hover:text-text-on-dark transition-colors">
              Risk Disclaimer
            </Link>
            <span className="text-navy-border">|</span>
            <Link href="/about#privacy" className="hover:text-text-on-dark transition-colors">
              Privacy Policy
            </Link>
            <span className="text-navy-border">|</span>
            <Link href="/about#terms" className="hover:text-text-on-dark transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
