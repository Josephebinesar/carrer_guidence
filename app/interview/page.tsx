'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InterviewChat from '@/components/InterviewChat';

export default function InterviewPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [resumeText, setResumeText] = useState('');
    const [role, setRole] = useState('');
    const [interviewId, setInterviewId] = useState('');

    useEffect(() => {
        const rt = sessionStorage.getItem('resumeText');
        const r = sessionStorage.getItem('role');
        const id = sessionStorage.getItem('interviewId');

        if (!rt || !r || !id) {
            router.push('/dashboard');
            return;
        }

        setResumeText(rt);
        setRole(r);
        setInterviewId(id);
        setReady(true);
    }, [router]);

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400">Preparing your interview…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col">
            <div className="bg-blob" />

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-2xl">🎓</span>
                    <span className="font-black text-base text-white">PlacementPrep AI</span>
                </Link>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium">
                        🎯 {role}
                    </span>
                    <Link
                        href="/dashboard"
                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Exit
                    </Link>
                </div>
            </nav>

            {/* Interview Area */}
            <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 70px)' }}>
                <div className="glass-card rounded-3xl p-6 flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            🤖
                        </div>
                        <div>
                            <div className="font-bold text-white">AI Interviewer</div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live Interview Session
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <InterviewChat
                            resumeText={resumeText}
                            role={role}
                            interviewId={interviewId}
                        />
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-xs text-slate-600 mt-3">
                    AI-generated questions based on your resume. Take your time to answer thoughtfully.
                </p>
            </div>
        </div>
    );
}
