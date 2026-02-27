/**
 * lib/careerData.ts
 * Static data: career paths, required skills, and scoring logic.
 * No AI required for initial scoring — deterministic matching.
 */

export interface CareerPath {
    id: string;
    title: string;
    icon: string;
    description: string;
    requiredSkills: string[];
    assessmentWeights: Record<string, number>; // question-category → weight (0-1)
}

export const CAREER_PATHS: CareerPath[] = [
    {
        id: 'data-analyst',
        title: 'Data Analyst',
        icon: '📊',
        description: 'Transform data into actionable insights using SQL, Excel, Python, and BI tools.',
        requiredSkills: ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Statistics', 'Data Visualization'],
        assessmentWeights: { analytical: 0.35, technical: 0.30, creative: 0.10, communication: 0.15, leadership: 0.10 },
    },
    {
        id: 'web-developer',
        title: 'Web Developer',
        icon: '🌐',
        description: 'Build responsive web applications with modern JavaScript frameworks.',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs'],
        assessmentWeights: { analytical: 0.20, technical: 0.40, creative: 0.25, communication: 0.10, leadership: 0.05 },
    },
    {
        id: 'ai-engineer',
        title: 'AI / ML Engineer',
        icon: '🤖',
        description: 'Design and deploy machine learning models and AI-powered systems.',
        requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Science'],
        assessmentWeights: { analytical: 0.35, technical: 0.40, creative: 0.15, communication: 0.05, leadership: 0.05 },
    },
    {
        id: 'ui-ux-designer',
        title: 'UI/UX Designer',
        icon: '🎨',
        description: 'Create intuitive user experiences through research, prototyping, and design systems.',
        requiredSkills: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'CSS', 'Design Thinking'],
        assessmentWeights: { analytical: 0.15, technical: 0.15, creative: 0.45, communication: 0.20, leadership: 0.05 },
    },
    {
        id: 'product-manager',
        title: 'Product Manager',
        icon: '🚀',
        description: 'Lead product strategy, roadmaps, and cross-functional teams to ship great products.',
        requiredSkills: ['Product Strategy', 'Agile', 'Roadmapping', 'User Research', 'SQL', 'Communication', 'Leadership'],
        assessmentWeights: { analytical: 0.20, technical: 0.10, creative: 0.20, communication: 0.25, leadership: 0.25 },
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        icon: '⚙️',
        description: 'Streamline CI/CD pipelines, cloud infrastructure, and system reliability.',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Shell Scripting', 'Terraform'],
        assessmentWeights: { analytical: 0.25, technical: 0.50, creative: 0.05, communication: 0.10, leadership: 0.10 },
    },
    {
        id: 'cybersecurity',
        title: 'Cybersecurity Analyst',
        icon: '🔒',
        description: 'Protect systems and data through threat analysis, penetration testing, and incident response.',
        requiredSkills: ['Network Security', 'Ethical Hacking', 'SIEM', 'Cryptography', 'Linux', 'Python', 'Compliance'],
        assessmentWeights: { analytical: 0.35, technical: 0.40, creative: 0.05, communication: 0.10, leadership: 0.10 },
    },
    {
        id: 'mobile-developer',
        title: 'Mobile Developer',
        icon: '📱',
        description: 'Build native and cross-platform mobile apps for iOS and Android.',
        requiredSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'REST APIs', 'Firebase', 'UI/UX principles'],
        assessmentWeights: { analytical: 0.20, technical: 0.45, creative: 0.20, communication: 0.10, leadership: 0.05 },
    },
];

// ──────────────────────────────────────────────────────────────────────────────
// Assessment questions (10 questions across 5 categories)
// ──────────────────────────────────────────────────────────────────────────────

export interface AssessmentQuestion {
    id: string;
    text: string;
    category: 'analytical' | 'technical' | 'creative' | 'communication' | 'leadership';
    options: { label: string; value: number }[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
    {
        id: 'q1',
        category: 'analytical',
        text: 'When faced with a complex problem, you prefer to:',
        options: [
            { label: 'Break it into smaller parts and analyze each', value: 5 },
            { label: 'Look for patterns from past experiences', value: 4 },
            { label: 'Discuss with others to brainstorm together', value: 3 },
            { label: 'Jump into solutions and iterate', value: 2 },
        ],
    },
    {
        id: 'q2',
        category: 'technical',
        text: 'How comfortable are you writing code or working with technical tools?',
        options: [
            { label: 'Very comfortable — I code daily', value: 5 },
            { label: 'Comfortable — I can build projects independently', value: 4 },
            { label: 'Somewhat comfortable — still learning', value: 3 },
            { label: 'Prefer low-code / no-code tools', value: 2 },
        ],
    },
    {
        id: 'q3',
        category: 'creative',
        text: 'When working on a project, you tend to:',
        options: [
            { label: 'Focus on the aesthetic and user experience', value: 5 },
            { label: 'Innovate with new ideas and approaches', value: 4 },
            { label: 'Follow established best practices', value: 3 },
            { label: 'Prioritize efficiency and performance', value: 2 },
        ],
    },
    {
        id: 'q4',
        category: 'communication',
        text: 'How do you prefer to share your work and ideas?',
        options: [
            { label: 'Presentations and written reports', value: 5 },
            { label: 'Visual demos and prototypes', value: 4 },
            { label: 'Code / technical documentation', value: 3 },
            { label: 'One-on-one conversations', value: 2 },
        ],
    },
    {
        id: 'q5',
        category: 'leadership',
        text: 'In a team project, you naturally:',
        options: [
            { label: 'Take charge and coordinate everyone', value: 5 },
            { label: 'Mentor others and review their work', value: 4 },
            { label: 'Execute tasks assigned to you very well', value: 3 },
            { label: 'Work independently on your piece', value: 2 },
        ],
    },
    {
        id: 'q6',
        category: 'analytical',
        text: 'Which activity excites you the most?',
        options: [
            { label: 'Exploring data to find hidden trends', value: 5 },
            { label: 'Building and deploying systems', value: 3 },
            { label: 'Designing intuitive user interfaces', value: 2 },
            { label: 'Planning product strategy', value: 4 },
        ],
    },
    {
        id: 'q7',
        category: 'technical',
        text: 'How often do you learn new programming languages or tools?',
        options: [
            { label: 'Constantly — I enjoy learning new stacks', value: 5 },
            { label: 'Often — when a project demands it', value: 4 },
            { label: 'Sometimes — I master what I know first', value: 3 },
            { label: 'Rarely — prefer using familiar tools', value: 2 },
        ],
    },
    {
        id: 'q8',
        category: 'creative',
        text: 'Which best describes your ideal work output?',
        options: [
            { label: 'A beautiful, polished interface', value: 5 },
            { label: 'An elegant algorithm or model', value: 4 },
            { label: 'A scalable, reliable system', value: 3 },
            { label: 'A clear strategy document or roadmap', value: 2 },
        ],
    },
    {
        id: 'q9',
        category: 'communication',
        text: 'When explaining technical concepts, you:',
        options: [
            { label: 'Simplify for non-technical audiences naturally', value: 5 },
            { label: 'Use diagrams and visuals', value: 4 },
            { label: 'Prefer technical accuracy over simplification', value: 3 },
            { label: 'Avoid explaining — let the code speak', value: 1 },
        ],
    },
    {
        id: 'q10',
        category: 'leadership',
        text: 'Your long-term career goal is:',
        options: [
            { label: 'Leading a team or founding a startup', value: 5 },
            { label: 'Becoming a domain expert / architect', value: 4 },
            { label: 'Working across different departments', value: 3 },
            { label: 'Deep specialist in one technology', value: 2 },
        ],
    },
];

// ──────────────────────────────────────────────────────────────────────────────
// Scoring logic (pure, deterministic — no AI)
// ──────────────────────────────────────────────────────────────────────────────

export interface CategoryScores {
    analytical: number;
    technical: number;
    creative: number;
    communication: number;
    leadership: number;
}

export function scoreAssessmentAnswers(answers: Record<string, number>): CategoryScores {
    const totals: CategoryScores = { analytical: 0, technical: 0, creative: 0, communication: 0, leadership: 0 };
    const counts: CategoryScores = { analytical: 0, technical: 0, creative: 0, communication: 0, leadership: 0 };

    for (const question of ASSESSMENT_QUESTIONS) {
        const value = answers[question.id];
        if (typeof value === 'number') {
            totals[question.category] += value;
            counts[question.category]++;
        }
    }

    // Normalise to 0-100
    return {
        analytical: counts.analytical ? Math.round((totals.analytical / (counts.analytical * 5)) * 100) : 0,
        technical: counts.technical ? Math.round((totals.technical / (counts.technical * 5)) * 100) : 0,
        creative: counts.creative ? Math.round((totals.creative / (counts.creative * 5)) * 100) : 0,
        communication: counts.communication ? Math.round((totals.communication / (counts.communication * 5)) * 100) : 0,
        leadership: counts.leadership ? Math.round((totals.leadership / (counts.leadership * 5)) * 100) : 0,
    };
}

export function matchCareerPaths(
    categoryScores: CategoryScores,
    resumeSkills: string[] = []
): { career: CareerPath; score: number; skillMatch: number; skillGap: string[] }[] {
    return CAREER_PATHS.map((career) => {
        // Weighted assessment score
        let assessmentScore = 0;
        for (const [cat, weight] of Object.entries(career.assessmentWeights)) {
            assessmentScore += (categoryScores[cat as keyof CategoryScores] ?? 0) * weight;
        }

        // Skill match bonus (up to 20 extra points)
        const normalizedResumeSkills = resumeSkills.map((s) => s.toLowerCase().trim());
        const matchedSkills = career.requiredSkills.filter((rs) =>
            normalizedResumeSkills.some((rs2) => rs2.includes(rs.toLowerCase()) || rs.toLowerCase().includes(rs2))
        );
        const skillMatch = Math.round((matchedSkills.length / career.requiredSkills.length) * 100);
        const skillBonus = (matchedSkills.length / career.requiredSkills.length) * 20;

        const finalScore = Math.min(100, Math.round(assessmentScore + skillBonus));
        const skillGap = career.requiredSkills.filter(
            (rs) => !normalizedResumeSkills.some((rs2) => rs2.includes(rs.toLowerCase()) || rs.toLowerCase().includes(rs2))
        );

        return { career, score: finalScore, skillMatch, skillGap };
    }).sort((a, b) => b.score - a.score);
}
