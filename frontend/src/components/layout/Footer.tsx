import React from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldAlert, Award, Globe, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070B16] border-t border-slate-800 text-gray-400 text-xs">
      {/* High-Risk Investment Warning Strip */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-gray-400">
            <strong className="text-gray-200">High Risk Investment Warning:</strong> Trading Foreign Exchange (Forex) and Contracts for Difference (CFDs) on margin carries a high level of risk and may not be suitable for all investors. Between 74% and 89% of retail investor accounts lose money when trading CFDs. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. EduTradeFX does not provide investment advice, asset management, or custody of trading funds.
          </p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              EduTrade<span className="text-blue-500">FX</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            The premier global marketplace and education hub connecting forex traders with top tier-1 regulated brokers, audited money managers, verified signal providers, and institutional-grade curriculum.
          </p>
          <div className="space-y-1.5 text-[11px] text-gray-400 pt-1">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-blue-400 shrink-0" />
              <span>Canary Wharf, London, E14 5AB, UK</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-blue-400 shrink-0" />
              <span>support@edutradefx.com</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Award size={14} />
              <span>Verified Directory</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <Globe size={14} />
              <span>Global Coverage</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3.5">Marketplace</h4>
          <ul className="space-y-2">
            <li><Link href="/brokers" className="hover:text-blue-400 transition-colors">Compare Brokers</Link></li>
            <li><Link href="/compare" className="hover:text-blue-400 transition-colors">Side-by-Side Matrix</Link></li>
            <li><Link href="/account-managers" className="hover:text-blue-400 transition-colors">Account Managers</Link></li>
            <li><Link href="/signal-providers" className="hover:text-blue-400 transition-colors">Signal Feeds</Link></li>
            <li><Link href="/courses" className="hover:text-blue-400 transition-colors">Forex Academy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3.5">Education & Help</h4>
          <ul className="space-y-2">
            <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Market Analysis</Link></li>
            <li><Link href="/courses" className="hover:text-blue-400 transition-colors">Academy Lessons</Link></li>
            <li><Link href="/about" className="hover:text-blue-400 transition-colors">About EduTradeFX</Link></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            <li><Link href="/advertise" className="hover:text-blue-400 transition-colors">Advertise with Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3.5">Compliance & Legal</h4>
          <ul className="space-y-2">
            <li><Link href="/complaint-box" className="hover:text-red-400 font-semibold transition-colors flex items-center gap-1.5"><ShieldAlert size={12} className="text-red-400" /><span>Complaint Box</span></Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/risk-disclaimer" className="hover:text-blue-400 transition-colors">Risk Disclaimer</Link></li>
            <li><Link href="/register" className="hover:text-blue-400 transition-colors">Partner Registration</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-slate-900 bg-black/40 py-5 px-4 text-center text-gray-500 text-[11px]">
        <p>&copy; {new Date().getFullYear()} EduTradeFX Ecosystem. All rights reserved. Technology & Architecture by Techofay Global Ventures.</p>
      </div>
    </footer>
  );
};
