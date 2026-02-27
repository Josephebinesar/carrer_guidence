export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import {
    scoreAssessmentAnswers,
    matchCareerPaths,
} from '@/lib/careerData';
import { generateAIJSON } from '@/lib/ai';

interface AssessmentRequestBody {
    answers: Record<string, number>;  // { q1: 5, q2: 3, … }
    resumeSkills?: string[];          // from resume analysis (optional)
}

interface CareerRoadmap {
    recommendedPath: string;
    roadmap: string;
    weeklyPlan: { week: string; focus: string; tasks: string[] }[];
}

export async function POST(req: NextRequest) {
    try {
        const body: AssessmentRequestBody = await req.json();
        const { answers, resumeSkills = [] } = body;

        if (!answers || typeof answers !== 'object') {
            return NextResponse.json({ error: 'answers object is required' }, { status: 400 });
        }

        // ── Pure deterministic scoring (no AI) ─────────────────────────────────
        const categoryScores = scoreAssessmentAnswers(answers);
        const matches = matchCareerPaths(categoryScores, resumeSkills);

        const top3 = matches.slice(0, 3).map(({ career, score, skillMatch, skillGap }) => ({
            career: career.title,
            icon: career.icon,
            description: career.description,
            score,
            skillMatch,
            skillGap,
            requiredSkills: career.requiredSkills,
        }));

        const topCareer = top3[0];

        // ── AI: generate detailed roadmap for the top career ───────────────────
        let roadmapData: CareerRoadmap | null = null;
        try {
            roadmapData = await generateAIJSON<CareerRoadmap>([
                {
                    role: 'system',
                    content:
                        'You are a career counselor. Provide a 3-month learning roadmap as valid JSON only.',
                },
                {
                    role: 'user',
                    content: `The user's top career match is "${topCareer.career}" with these skill gaps: ${topCareer.skillGap.join(', ') || 'none'}.
Their resume skills include: ${resumeSkills.join(', ') || 'not specified'}.

Return a JSON object with:
{
  "recommendedPath": "<one-sentence summary of why this career matches>",
  "roadmap": "<2-3 paragraph overview of the 3-month plan>",
  "weeklyPlan": [
    { "week": "Week 1-2", "focus": "<topic>", "tasks": ["<task1>", "<task2>", "<task3>"] },
    { "week": "Week 3-4", "focus": "<topic>", "tasks": ["<task1>", "<task2>"] },
    { "week": "Month 2", "focus": "<topic>", "tasks": ["<task1>", "<task2>"] },
    { "week": "Month 3", "focus": "<topic>", "tasks": ["<task1>", "<task2>"] }
  ]
}`,
                },
            ]);
        } catch (err) {
            console.warn('[career-assessment] Roadmap AI failed, using fallback:', err);
            roadmapData = {
                recommendedPath: `Based on your assessment, ${topCareer.career} is your best career match.`,
                roadmap: `Focus on building core ${topCareer.career} skills over the next 3 months. Start with fundamentals, build projects, and grow your portfolio.`,
                weeklyPlan: [
                    { week: 'Week 1-2', focus: 'Fundamentals', tasks: topCareer.skillGap.slice(0, 2).map((s) => `Learn basics of ${s}`) },
                    { week: 'Week 3-4', focus: 'Practice', tasks: ['Build a small project', 'Complete online exercises'] },
                    { week: 'Month 2', focus: 'Portfolio', tasks: ['Build a portfolio project', 'Document your work'] },
                    { week: 'Month 3', focus: 'Job Ready', tasks: ['Update resume', 'Apply for roles', 'Practice interviews'] },
                ],
            };
        }

        return NextResponse.json({
            success: true,
            categoryScores,
            matches: top3,
            recommendedPath: roadmapData.recommendedPath,
            roadmap: roadmapData.roadmap,
            weeklyPlan: roadmapData.weeklyPlan,
        });
    } catch (err) {
        console.error('[/api/career-assessment] Error:', err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
