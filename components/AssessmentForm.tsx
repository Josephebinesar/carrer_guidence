'use client';

import { useState } from 'react';
import { ASSESSMENT_QUESTIONS, AssessmentQuestion } from '@/lib/careerData';

interface AssessmentFormProps {
    resumeSkills?: string[];
    onComplete: (result: AssessmentResult) => void;
}

export interface AssessmentResult {
    categoryScores: Record<string, number>;
    matches: {
        career: string;
        icon: string;
        description: string;
        score: number;
        skillMatch: number;
        skillGap: string[];
        requiredSkills: string[];
    }[];
    recommendedPath: string;
    roadmap: string;
    weeklyPlan: { week: string; focus: string; tasks: string[] }[];
}

const categoryEmoji: Record<string, string> = {
    analytical: '📊', technical: '💻', creative: '🎨',
    communication: '💬', leadership: '🚀',
};

export default function AssessmentForm({ resumeSkills = [], onComplete }: AssessmentFormProps) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const question: AssessmentQuestion = ASSESSMENT_QUESTIONS[currentQ];
    const total = ASSESSMENT_QUESTIONS.length;
    const progress = (currentQ / total) * 100;
    const answeredCurrent = answers[question.id] !== undefined;

    const goNext = async () => {
        if (!answeredCurrent) return;
        if (currentQ < total - 1) { setCurrentQ(q => q + 1); return; }
        await submit();
    };

    const submit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/career-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, resumeSkills }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Assessment failed');
            onComplete(data as AssessmentResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Progress bar */}
            <div className="assessment-progress">
                <div className="assessment-progress-top">
                    <span>Question {currentQ + 1} of {total}</span>
                    <span className="cat-badge">
                        {categoryEmoji[question.category]} {question.category}
                    </span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Question */}
            <div className="assessment-question">
                <p>{question.text}</p>
            </div>

            {/* Options */}
            <div className="options-list">
                {question.options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt.value }))}
                        className={`option-btn ${answers[question.id] === opt.value ? 'selected' : ''}`}
                    >
                        <span className="radio-dot">
                            {answers[question.id] === opt.value && <span className="radio-inner" />}
                        </span>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && <div className="alert error" style={{ marginBottom: '1rem' }}><span>⚠️</span><span>{error}</span></div>}

            {/* Navigation */}
            <div className="assessment-nav">
                <button
                    onClick={() => currentQ > 0 && setCurrentQ(q => q - 1)}
                    disabled={currentQ === 0 || submitting}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1.25rem', borderRadius: '0.875rem' }}
                >
                    ← Back
                </button>
                <button
                    onClick={goNext}
                    disabled={!answeredCurrent || submitting}
                    className="btn btn-cyan"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.875rem', fontSize: '0.95rem' }}
                >
                    {submitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg className="animate-spin" style={{ width: '1.1rem', height: '1.1rem' }} viewBox="0 0 24 24" fill="none">
                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Analysing…
                        </span>
                    ) : currentQ < total - 1 ? 'Next →' : '🚀 See My Career Matches'}
                </button>
            </div>
        </div>
    );
}
