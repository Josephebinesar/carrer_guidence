export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, generateAIJSON, buildInterviewPrompt } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeText, role, conversationHistory, questionNumber } = body;

        if (!resumeText || !role) {
            return NextResponse.json(
                { error: 'resumeText and role are required' },
                { status: 400 }
            );
        }

        const currentQuestion = typeof questionNumber === 'number' ? questionNumber : 1;
        const history = Array.isArray(conversationHistory) ? conversationHistory : [];

        const isLastQuestion = currentQuestion >= 8;

        let rawResponse: string;

        try {
            if (isLastQuestion) {
                // For evaluation, use JSON mode with chat API directly for better reliability
                const evalMessages = [
                    {
                        role: 'system' as const,
                        content:
                            'You are an expert interviewer. Evaluate the candidate and respond with valid JSON only.',
                    },
                    {
                        role: 'user' as const,
                        content: `You interviewed a candidate for "${role}".

Resume:
${resumeText.slice(0, 2000)}

Interview Q&A:
${history.map((h: { question: string; answer: string }, i: number) => `Q${i + 1}: ${h.question}\nA: ${h.answer}`).join('\n\n')}

Return a JSON evaluation with:
{
  "score": <integer 0-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
  "recommended_topics": ["<topic1>", "<topic2>", "<topic3>"]
}`,
                    },
                ];

                const evaluation = await generateAIJSON<{
                    score: number;
                    strengths: string[];
                    weaknesses: string[];
                    improvements: string[];
                    recommended_topics: string[];
                }>(evalMessages);

                return NextResponse.json({ type: 'evaluation', evaluation });
            } else {
                // Regular question
                const prompt = buildInterviewPrompt(resumeText, role, history, currentQuestion);
                rawResponse = await generateAIResponse(
                    [{ role: 'user', content: prompt }],
                    false
                );
            }
        } catch (err) {
            console.error('[/api/interview] AI error:', err);

            if (isLastQuestion) {
                return NextResponse.json({
                    type: 'evaluation',
                    evaluation: {
                        score: 70,
                        strengths: ['Completed the full interview', 'Good communication'],
                        weaknesses: ['Could improve technical depth'],
                        improvements: ['Practice more coding problems', 'Study system design'],
                        recommended_topics: ['Data Structures', 'System Design', 'Core ' + role + ' concepts'],
                    },
                });
            }

            return NextResponse.json({ error: 'Failed to get response from AI. Please try again.' }, { status: 502 });
        }

        const question = rawResponse!
            .replace(/^\s*Q\d+[.:]\s*/i, '')
            .replace(/^\s*Question\s*\d+[.:]\s*/i, '')
            .trim();

        return NextResponse.json({ type: 'question', question });
    } catch (err) {
        console.error('[/api/interview] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
