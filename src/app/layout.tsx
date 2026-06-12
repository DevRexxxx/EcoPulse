import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/emergency/ErrorBoundary';

export const metadata: Metadata = {
  title: 'EcoPulse — AI-Powered Carbon Tracker',
  description:
    'Track your carbon footprint, get personalized eco-suggestions, and earn rewards for sustainable choices. Join the green revolution with EcoPulse.',
  keywords: ['carbon tracker', 'sustainability', 'eco-friendly', 'carbon footprint', 'green living'],
  authors: [{ name: 'EcoPulse Team' }],
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A2F1F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" />
      </head>
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
