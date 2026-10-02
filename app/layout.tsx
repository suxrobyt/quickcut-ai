import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QuickCut AI — Tell it what to edit. AI does the rest.',
  description: 'AI-powered video editing platform. Upload videos, tell QuickCut AI what you want, get a finished video.',
  keywords: ['video editing', 'AI', 'video editor', 'TikTok', 'shorts', 'reels'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-qc-bg`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
