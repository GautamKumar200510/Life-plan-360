import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { FinanceProvider } from '@/lib/context/FinanceContext';

export const metadata: Metadata = {
  title: 'Life Plan 360° – AI-Powered Wealth Management & Financial Planning',
  description:
    'Comprehensive wealth management, budgeting, investment tracking, retirement projection, and AI financial advisory platform for individuals and families.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8fafc] text-slate-800 antialiased min-h-screen">
        <AuthProvider>
          <FinanceProvider>{children}</FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
