import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'EcoPulse — AI-Powered Carbon Tracker',
  description:
    'Track your carbon footprint, get personalized eco-suggestions, and earn rewards for sustainable choices. Join the green revolution with EcoPulse.',
  keywords: ['carbon tracker', 'sustainability', 'eco-friendly', 'carbon footprint', 'green living'],
  authors: [{ name: 'EcoPulse Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0A2F1F',
  manifest: '/manifest.json',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
