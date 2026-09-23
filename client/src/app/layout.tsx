import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CompareProvider } from '@/context/CompareContext';
import { ToastProvider } from '@/components/shared/Toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CompareDrawer from '@/components/layout/CompareDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dm-serif',
  weight: ['400'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'EduTradeFX — Forex Broker Comparison, LMS Academy & Scam Radar',
  description:
    'Discover and compare top-tier regulated Forex brokers, find verified account managers and signal providers, learn trading through our structured LMS, and check our scam radar dispute ledger.',
  keywords: [
    'Forex brokers',
    'Broker comparison',
    'Forex LMS',
    'Trading courses',
    'Forex complaints',
    'Scam broker radar',
    'Signal providers',
    'Account managers',
    'ECN brokers',
  ],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <body className="bg-navy-deepest text-text-on-dark min-h-screen flex flex-col antialiased selection:bg-gold-primary selection:text-navy-deepest font-sans">
        <AuthProvider>
          <ToastProvider>
            <CompareProvider>
              <Navbar />
              <main className="flex-1 pb-16">{children}</main>
              <CompareDrawer />
              <Footer />
            </CompareProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
