'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResumeUploadCareer from '@/components/ResumeUploadCareer';
import AssessmentForm, { AssessmentResult } from '@/components/AssessmentForm';
import CareerReport from '@/components/CareerReport';
import CareerChat from '@/components/CareerChat';

interface ResumeAnalysis {
    skills: string[];
    experience: string[];
    education: string[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
    improvementSuggestions: string[];
}

type Step = 'resume' | 'assessment' | 'report';

const STEPS = [
    { id: 'resume' as Step, label: 'Resume Analysis', icon: '📄' },
    { id: 'assessment' as Step, label: 'Career Assessment', icon: '🎯' },
    { id: 'report' as Step, label: 'Your Career Report', icon: '📊' },
];

export default function CareerGuidancePage() {
    const [step, setStep] = useState<Step>('resume');
    const [resumeText, setResumeText] = useState('');
    const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
    const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
    const [showChat, setShowChat] = useState(false);

    const currentIdx = STEPS.findIndex(s => s.id === step);

    const handleResumeAnalysed = (text: string, analysis: ResumeAnalysis) => {
        setResumeText(text);
        setResumeAnalysis(analysis);
        setStep('assessment');
    };

    const handleAssessmentComplete = (result: AssessmentResult) => {
        setAssessmentResult(result);
        setStep('report');
    };

    const handleRestart = () => {
        setStep('resume');
        setResumeText('');
        setResumeAnalysis(null);
        setAssessmentResult(null);
        setShowChat(false);
    };

    return (
        <div className="career-page">
            <div className="bg-blob-career" />

            {/* Nav */}
            <nav className="site-nav">
                <Link href="/" className="brand">
                    <span style={{ fontSize: '1.5rem' }}>🎓</span>
                    PlacementPrep AI
                </Link>
                <div className="nav-actions">
                    <Link href="/" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>← Home</Link>
                    <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>Mock Interview</Link>
                </div>
            </nav>

            {/* Step progress */}
            <div className="step-progress">
                <div className="step-progress-inner">
                    {STEPS.map((s, i) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
                            <div className="step-item">
                                <div className={`step-circle ${s.id === step ? 'active' : currentIdx > i ? 'done' : ''}`}>
                                    {currentIdx > i ? '✓' : s.icon}
                                </div>
                                <span className={`step-label ${s.id === step ? 'active' : currentIdx > i ? 'done' : ''}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`step-connector ${currentIdx > i ? 'done' : ''}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div className={`career-main ${step === 'report' ? 'wide' : ''}`} style={{ maxWidth: step === 'report' ? '1180px' : '680px' }}>

                {/* Left / Main column */}
                <div>
                    {/* ── Step 1: Resume Upload ── */}
                    {step === 'resume' && (
                        <div className="animate-fadeIn">
                            <div className="page-header">
                                <h1>Career Guidance <span className="gradient-text-cyan">AI System</span></h1>
                                <p>Upload your resume to get AI-powered career recommendations, skill gap analysis, and a personalised learning roadmap.</p>
                            </div>
                            <div className="panel">
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>📄</span> Step 1: Analyse Your Resume
                                    </h2>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Upload PDF or DOCX — our AI will extract your skills, experience, and education.</p>
                                </div>
                                <ResumeUploadCareer onAnalysisComplete={handleResumeAnalysed} />
                                <div className="skip-link">
                                    Don't have a resume ready?
                                    <a onClick={() => setStep('assessment')}>Skip to Career Assessment →</a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Assessment ── */}
                    {step === 'assessment' && (
                        <div className="animate-fadeIn">
                            <div className="page-header">
                                <h1>Career Assessment</h1>
                                <p>Answer 10 quick questions to discover your ideal career path.</p>
                            </div>

                            {resumeAnalysis && (
                                <div className="resume-strip">
                                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                                    <div className="resume-strip-info">
                                        <h4>Resume Analysed</h4>
                                        <p>Found {resumeAnalysis.skills.length} skills · ATS Score: {resumeAnalysis.atsScore}/100</p>
                                    </div>
                                    <div className="resume-strip-tags">
                                        {resumeAnalysis.skills.slice(0, 4).map(s => <span key={s} className="skill-chip">{s}</span>)}
                                        {resumeAnalysis.skills.length > 4 && <span className="skill-chip more">+{resumeAnalysis.skills.length - 4}</span>}
                                    </div>
                                </div>
                            )}

                            <div className="panel">
                                <AssessmentForm resumeSkills={resumeAnalysis?.skills} onComplete={handleAssessmentComplete} />
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Report ── */}
                    {step === 'report' && assessmentResult && (
                        <div className="animate-fadeIn">
                            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '999px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                                    🎉 Analysis Complete!
                                </div>
                                <h1>Your Career Report</h1>
                            </div>
                            <CareerReport data={assessmentResult} resumeAnalysis={resumeAnalysis} onRestart={handleRestart} />
                        </div>
                    )}
                </div>

                {/* ── Right column: Chat (only on report step) ── */}
                {step === 'report' && (
                    <div className="chat-sidebar animate-fadeIn">
                        <div className="chat-sidebar-header">
                            <h2>💬 CareerGuide Chat</h2>
                        </div>
                        <div className="chat-panel">
                            <CareerChat context={{ resumeSkills: resumeAnalysis?.skills, targetCareer: assessmentResult?.matches[0]?.career }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Floating chat for non-report steps */}
            {step !== 'report' && (
                <div className="floating-chat-btn">
                    <button onClick={() => setShowChat(v => !v)} className="fab">
                        {showChat ? '✕' : '💬'}
                    </button>

                    {showChat && (
                        <div className="floating-chat-popup animate-fadeIn">
                            <div className="floating-chat-header">
                                <h3>💬 CareerGuide Chat</h3>
                                <button onClick={() => setShowChat(false)} className="floating-chat-close">✕</button>
                            </div>
                            <div className="floating-chat-body">
                                <CareerChat context={{ resumeSkills: resumeAnalysis?.skills }} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
