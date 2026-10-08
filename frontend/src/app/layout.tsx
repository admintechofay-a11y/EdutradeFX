import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { AppProviders } from '../components/providers/AppProviders';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AIAssistant } from '../components/common/AIAssistant';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A2A6B',
};

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
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen min-h-dvh flex flex-col bg-white text-text-body font-sans antialiased selection:bg-blue-600 selection:text-white">
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
