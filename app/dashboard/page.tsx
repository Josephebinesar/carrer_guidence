'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResumeUpload from '@/components/ResumeUpload';

const ROLES = [
    'Software Engineer',
    'Data Analyst',
    'Machine Learning Engineer',
    'Web Developer',
    'Product Manager',
    'Custom',
];

export default function DashboardPage() {
    const router = useRouter();
    const [role, setRole] = useState('');
    const [customRole, setCustomRole] = useState('');

    const effectiveRole = role === 'Custom' ? customRole.trim() : role;

    const handleUploadComplete = (interviewId: string, resumeText: string) => {
        sessionStorage.setItem('interviewId', interviewId);
        sessionStorage.setItem('resumeText', resumeText);
        sessionStorage.setItem('role', effectiveRole);
        router.push('/interview');
    };

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
                    <span className="bg-violet-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">1</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-slate-500 w-7 h-7 flex items-center justify-center font-bold text-xs border border-white/10 rounded-full">2</span>
                    <span className="text-slate-500 w-7 h-7 flex items-center justify-center font-bold text-xs border border-white/10 rounded-full">3</span>
                </div>
            </nav>

            <main className="relative z-10 max-w-2xl mx-auto px-6 pb-16 pt-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-3">
                        Set Up Your Interview
                    </h1>
                    <p className="text-slate-400">Upload your resume and tell us what role you're targeting.</p>
                </div>

                <div className="glass-card rounded-3xl p-8 space-y-8">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                            🎯 Select Target Role
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {ROLES.filter((r) => r !== 'Custom').map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-center
                    ${role === r
                                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                            <button
                                onClick={() => setRole('Custom')}
                                className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                  ${role === 'Custom'
                                        ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                ✏️ Custom
                            </button>
                        </div>

                        {role === 'Custom' && (
                            <input
                                type="text"
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                placeholder="e.g. DevOps Engineer, Android Developer…"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                  text-white placeholder-slate-500 outline-none focus:border-violet-500
                  focus:ring-1 focus:ring-violet-500/50 transition-all text-sm"
                            />
                        )}

                        {effectiveRole && (
                            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                Role selected: <span className="font-semibold text-white">{effectiveRole}</span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10" />

                    {/* Resume Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                            📄 Upload Your Resume
                        </label>
                        {!effectiveRole && (
                            <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
                                <span>⚠️</span> Please select a role above before uploading your resume.
                            </div>
                        )}
                        <ResumeUpload onUploadComplete={handleUploadComplete} role={effectiveRole} />
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    {[
                        { icon: '🔒', title: 'Private', desc: 'Stored securely in Supabase' },
                        { icon: '⚡', title: 'Fast', desc: 'Questions generated in seconds' },
                        { icon: '🎓', title: 'Tailored', desc: 'Personalized to your profile' },
                    ].map((c) => (
                        <div key={c.title} className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">{c.icon}</div>
                            <div className="font-semibold text-white text-sm">{c.title}</div>
                            <div className="text-xs text-slate-400 mt-1">{c.desc}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
