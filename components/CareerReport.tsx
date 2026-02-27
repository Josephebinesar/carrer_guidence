'use client';

import { useState } from 'react';

interface CareerMatch {
    career: string;
    icon: string;
    description: string;
    score: number;
    skillMatch: number;
    skillGap: string[];
    requiredSkills: string[];
}

interface WeeklyPlan {
    week: string;
    focus: string;
    tasks: string[];
}

interface CareerReportProps {
    data: {
        categoryScores: Record<string, number>;
        matches: CareerMatch[];
        recommendedPath: string;
        roadmap: string;
        weeklyPlan: WeeklyPlan[];
    };
    resumeAnalysis?: {
        skills: string[];
        strengths: string[];
        weaknesses: string[];
        atsScore: number;
        improvementSuggestions: string[];
    } | null;
    onRestart?: () => void;
}

const categoryLabel: Record<string, string> = {
    analytical: '📊 Analytical', technical: '💻 Technical', creative: '🎨 Creative',
    communication: '💬 Communication', leadership: '🚀 Leadership',
};

type Tab = 'matches' | 'roadmap' | 'skills' | 'resume';
const TABS: { id: Tab; label: string }[] = [
    { id: 'matches', label: '🎯 Matches' },
    { id: 'roadmap', label: '🗺️ Roadmap' },
    { id: 'skills', label: '📊 Skills' },
    { id: 'resume', label: '📄 Resume' },
];

export default function CareerReport({ data, resumeAnalysis, onRestart }: CareerReportProps) {
    const [tab, setTab] = useState<Tab>('matches');
    const top = data.matches[0];

    const atsColor = resumeAnalysis
        ? resumeAnalysis.atsScore >= 80 ? 'good' : resumeAnalysis.atsScore >= 60 ? 'ok' : 'low'
        : 'ok';

    return (
        <div>
            {/* Hero */}
            <div className="report-hero">
                <span className="report-hero-icon">{top?.icon ?? '🎯'}</span>
                <h2>Your Top Career Match</h2>
                <div className="report-hero-career gradient-text-cyan">{top?.career ?? '—'}</div>
                <div className="report-score-badge">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} className="animate-pulse" />
                    {top?.score ?? 0}% Match Score
                </div>
                <p>{data.recommendedPath}</p>
            </div>

            {/* Tab bar */}
            <div className="tab-bar">
                {TABS.map(t => (
                    <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Matches tab ── */}
            {tab === 'matches' && (
                <div>
                    <div className="match-list">
                        {data.matches.map((m, i) => (
                            <div key={m.career} className={`match-card ${i === 0 ? 'top-pick' : ''}`}>
                                <div className="match-card-header">
                                    <div className="match-card-info">
                                        <span className="match-icon">{m.icon}</span>
                                        <div>
                                            <div className="match-name">{m.career}</div>
                                            <div className="match-desc">{m.description}</div>
                                        </div>
                                    </div>
                                    {i === 0 && <span className="match-top-badge">Top Pick</span>}
                                </div>
                                <div className="score-bar">
                                    <div className="score-track">
                                        <div className={`score-fill ${i === 0 ? 'cyan' : 'emerald'}`} style={{ width: `${m.score}%` }} />
                                    </div>
                                    <span className="score-value">{m.score}%</span>
                                </div>
                                <div className="match-stats">
                                    <span>📋 Skill Match: <strong>{m.skillMatch}%</strong></span>
                                    <span className="match-stat-amber">⚠️ Skill Gaps: <strong>{m.skillGap.length}</strong></span>
                                </div>
                                {m.skillGap.length > 0 && (
                                    <div className="skill-gap-chips">
                                        {m.skillGap.map(s => <span key={s} className="gap-chip">{s}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Strength profile */}
                    <div className="strength-profile">
                        <h4>Your Strength Profile</h4>
                        {Object.entries(data.categoryScores).map(([cat, score]) => (
                            <div key={cat} className="strength-row">
                                <span className="strength-label">{categoryLabel[cat] || cat}</span>
                                <div className="score-bar">
                                    <div className="score-track"><div className="score-fill cyan" style={{ width: `${score}%` }} /></div>
                                    <span className="score-value">{score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Roadmap tab ── */}
            {tab === 'roadmap' && (
                <div>
                    <div className="roadmap-overview">
                        <h3>📋 3-Month Learning Plan</h3>
                        <p>{data.roadmap}</p>
                    </div>
                    <div className="roadmap-steps">
                        {data.weeklyPlan.map((item, i) => (
                            <div key={i} className="roadmap-step">
                                <div className="roadmap-step-header">
                                    <span className="roadmap-num">{i + 1}</span>
                                    <div>
                                        <div className="roadmap-week">{item.week}</div>
                                        <div className="roadmap-focus">{item.focus}</div>
                                    </div>
                                </div>
                                <ul className="roadmap-tasks">
                                    {item.tasks.map((t, j) => (
                                        <li key={j} className="roadmap-task">
                                            <span className="roadmap-task-dot" />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Skills tab ── */}
            {tab === 'skills' && (
                <div className="skill-gap-panel">
                    <h3>Skill Gap Analysis — {top?.career}</h3>
                    <div>
                        <div className="skill-gap-label">Required Skills</div>
                        <div className="skill-chips-row">
                            {top?.requiredSkills.map(skill => {
                                const have = !top.skillGap.includes(skill);
                                return (
                                    <span key={skill} className={have ? 'skill-chip-have' : 'skill-chip-need'}>
                                        {have ? '✓' : '+'} {skill}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <div className="skill-gap-stats">
                        <div className="stat-box green">
                            <span className="stat-box-num">{(top?.requiredSkills.length ?? 0) - (top?.skillGap.length ?? 0)}</span>
                            <span className="stat-box-label">Skills You Have</span>
                        </div>
                        <div className="stat-box amber">
                            <span className="stat-box-num">{top?.skillGap.length ?? 0}</span>
                            <span className="stat-box-label">Skills to Learn</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Resume tab ── */}
            {tab === 'resume' && (
                resumeAnalysis ? (
                    <div>
                        <div className="ats-score-box">
                            <div className="ats-score-label">ATS Compatibility Score</div>
                            <div className={`ats-score-num ${atsColor}`}>{resumeAnalysis.atsScore}</div>
                            <div className="ats-score-sub">out of 100</div>
                        </div>

                        <div className="cards-2col">
                            <div className="mini-card green">
                                <h4>✅ Strengths</h4>
                                <ul className="mini-list">
                                    {resumeAnalysis.strengths.map((s, i) => (
                                        <li key={i}><span className="mini-dot" />{s}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mini-card red">
                                <h4>⚠️ Areas to Improve</h4>
                                <ul className="mini-list">
                                    {resumeAnalysis.weaknesses.map((w, i) => (
                                        <li key={i}><span className="mini-dot" />{w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="tips-card">
                            <h4>💡 Resume Improvement Tips</h4>
                            <ul className="tips-list">
                                {resumeAnalysis.improvementSuggestions.map((tip, i) => (
                                    <li key={i} className="tip-item">
                                        <span className="tip-num">{i + 1}</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <p>Upload your resume in Step 1 to see the resume analysis report.</p>
                    </div>
                )
            )}

            {/* Restart */}
            {onRestart && (
                <div style={{ marginTop: '1.5rem' }}>
                    <button onClick={onRestart} className="btn btn-outline btn-full" style={{ padding: '1rem', borderRadius: '1rem', fontSize: '0.95rem' }}>
                        🔄 Start Over
                    </button>
                </div>
            )}
        </div>
    );
}
