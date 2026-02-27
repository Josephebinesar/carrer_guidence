'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FeedbackReport from '@/components/FeedbackReport';

interface ResultsData {
    role: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    recommended_topics: string[];
    questions: string[];
    answers: string[];
}

export default function ResultsPage() {
    const router = useRouter();
    const [data, setData] = useState<ResultsData | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('interviewResults');
        if (!raw) {
            router.push('/dashboard');
            return;
        }
        try {
            setData(JSON.parse(raw));
        } catch {
            router.push('/dashboard');
        }
    }, [router]);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400">Loading your results…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="bg-blob" />

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-2xl">🎓</span>
                    <span className="font-black text-lg text-white">PlacementPrep AI</span>
                </Link>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Step</span>
                    <span className="text-slate-500 w-7 h-7 flex items-center justify-center font-bold text-xs border border-white/10 rounded-full">1</span>
                    <span className="text-slate-500 w-7 h-7 flex items-center justify-center font-bold text-xs border border-white/10 rounded-full">2</span>
                    <span className="bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">3</span>
                </div>
            </nav>

            <main className="relative z-10 max-w-3xl mx-auto px-6 pb-16 pt-6">
                <div className="text-center mb-10 animate-fadeIn">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20
            text-emerald-300 text-sm font-medium mb-6">
                        🎉 Interview Complete!
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">Your Results Are In</h1>
                    <p className="text-slate-400">Here's a detailed breakdown of your performance during the mock interview.</p>
                </div>

                <div className="glass-card rounded-3xl p-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <FeedbackReport data={data} />
                </div>
            </main>
        </div>
    );
}
