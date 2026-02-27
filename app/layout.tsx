import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PlacementPrep AI – Interactive Mock Interview Simulator',
  description:
    'Prepare for campus placements with AI-driven mock interviews. Upload your resume, select your role, and get real-time feedback from a senior AI interviewer.',
  keywords: ['placement preparation', 'mock interview', 'AI interview', 'campus placement', 'interview practice'],
  openGraph: {
    title: 'PlacementPrep AI',
    description: 'AI-powered mock interview simulator for campus placements',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
