import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppProviders } from '../components/providers/AppProviders';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AIAssistant } from '../components/common/AIAssistant';

export const metadata: Metadata = {
  title: 'EdutradeFX — Global Forex Marketplace, Education & Trading Ecosystem',
  description:
    'Compare top regulated Forex brokers, learn with institutional-grade trading masterclasses, connect with verified account managers, and follow profitable signal feeds.',
  keywords: [
    'Forex Brokers',
    'Trading Education',
    'Forex Signals',
    'Account Managers',
    'Broker Comparison',
    'EdutradeFX',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0A0F1E] text-text-primary antialiased selection:bg-blue-600 selection:text-white">
        <AppProviders>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <AIAssistant />
        </AppProviders>
      </body>
    </html>
  );
}
