import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Nexus Gaming | Enterprise Game Catalog, Ratings & Review Platform',
  description:
    'Explore detailed video game information, authentic player ratings, Steam-style positive percentages, and anonymous review capabilities powered by enterprise backend architecture.',
  keywords: [
    'video games',
    'game reviews',
    'steam platform',
    'video game ratings',
    'game scores',
    'write review',
    'anonymous review',
    'gaming community',
    'esports',
  ],
  authors: [{ name: 'Nexus Gaming Enterprise Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080b12] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
