'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldAlert,
  Award,
  Globe,
  Mail,
  MapPin,
  ArrowRight,
  Twitter,
  Linkedin,
  Send,
  Youtube,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#071B4D] text-slate-300 text-xs">
      {/* High-Risk Investment Warning Strip (Restyled for Institutional Dark Navy) */}
      <div className="border-b border-[#0A2A6B] bg-[#05153D] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3.5">
          <ShieldAlert size={20} className="text-orange shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-300">
            <strong className="text-white font-bold">High Risk Investment Warning:</strong> Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) on margin carries a high level of risk and may not be suitable for all investors. Between 74% and 89% of retail investor accounts lose money when trading CFDs. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. EduTradeFX does not provide investment advice, asset management, or custody of trading funds.
          </p>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block group pb-1">
            <div className="relative w-44 h-20">
              <Image
                src="/logos/logo-white.svg"
                alt="EduTradeFX Logo"
                fill
                sizes="176px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            The premier global marketplace and education ecosystem connecting forex traders with top tier-1 regulated brokers, audited money managers, verified signal providers, and institutional curriculum.
          </p>

          <div className="space-y-2 text-[11px] text-slate-300 pt-1">
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="text-blue-400 shrink-0" />
              <span>Canary Wharf, London, E14 5AB, United Kingdom</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-blue-400 shrink-0" />
              <span>support@edutradefx.com</span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#0A2A6B] hover:bg-blue text-white flex items-center justify-center transition-colors tap-target"
            >
              <Twitter size={15} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#0A2A6B] hover:bg-blue text-white flex items-center justify-center transition-colors tap-target"
            >
              <Linkedin size={15} />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#0A2A6B] hover:bg-blue text-white flex items-center justify-center transition-colors tap-target"
            >
              <Send size={15} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#0A2A6B] hover:bg-blue text-white flex items-center justify-center transition-colors tap-target"
            >
              <Youtube size={15} />
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-300 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Award size={14} />
              <span>Verified Directory</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
              <Globe size={14} />
              <span>Global Coverage</span>
            </div>
          </div>
        </div>

        {/* 3 Link Columns */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Marketplace</h4>
          <ul className="space-y-1 sm:space-y-2.5">
            <li><Link href="/brokers" className="inline-block py-1.5 hover:text-white transition-colors">Compare Brokers</Link></li>
            <li><Link href="/brokers/compare" className="inline-block py-1.5 hover:text-white transition-colors">Side-by-Side Matrix</Link></li>
            <li><Link href="/account-managers" className="inline-block py-1.5 hover:text-white transition-colors">Account Managers</Link></li>
            <li><Link href="/signal-providers" className="inline-block py-1.5 hover:text-white transition-colors">Signal Feeds</Link></li>
            <li><Link href="/courses" className="inline-block py-1.5 hover:text-white transition-colors">Forex Academy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Education & Help</h4>
          <ul className="space-y-1 sm:space-y-2.5">
            <li><Link href="/blog" className="inline-block py-1.5 hover:text-white transition-colors">Market Analysis</Link></li>
            <li><Link href="/courses" className="inline-block py-1.5 hover:text-white transition-colors">Academy Lessons</Link></li>
            <li><Link href="/about" className="inline-block py-1.5 hover:text-white transition-colors">About EduTradeFX</Link></li>
            <li><Link href="/contact" className="inline-block py-1.5 hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link href="/advertise" className="inline-block py-1.5 hover:text-white transition-colors">Advertise with Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Compliance & Legal</h4>
          <ul className="space-y-1 sm:space-y-2.5">
            <li>
              <Link
                href="/complaint-box"
                className="text-orange hover:text-orange-hover font-semibold transition-colors flex items-center gap-1.5 py-1.5"
              >
                <ShieldAlert size={13} className="text-orange shrink-0" />
                <span>Complaint Box</span>
              </Link>
            </li>
            <li><Link href="/terms" className="inline-block py-1.5 hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="inline-block py-1.5 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/risk-disclaimer" className="inline-block py-1.5 hover:text-white transition-colors">Risk Disclaimer</Link></li>
            <li><Link href="/register" className="inline-block py-1.5 hover:text-white transition-colors">Partner Registration</Link></li>
          </ul>

          {/* Newsletter Input with Blue Arrow Button */}
          <div className="mt-6 pt-5 border-t border-[#0A2A6B]">
            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">Market Dispatch</h5>
            <p className="text-[11px] text-slate-400 mb-2.5">Weekly spreads and signal insights.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-1.5">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-full px-3.5 py-2.5 rounded-full bg-[#05153D] border border-[#0A2A6B] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-blue hover:bg-blue-hover text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
              >
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-[#0A2A6B] bg-[#051336] py-5 px-4 sm:px-6 lg:px-8 text-slate-400 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} EduTradeFX Ecosystem. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed and developed by{' '}
            <a
              href="https://techofay-global-ventures.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-white underline underline-offset-2 transition-colors font-semibold"
            >
              Techofay Global Ventures
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
