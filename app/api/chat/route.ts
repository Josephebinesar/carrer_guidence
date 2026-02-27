export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, AIMessage } from '@/lib/ai';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequestBody {
    message: string;
    history?: ChatMessage[];
    context?: {
        resumeSkills?: string[];
        targetCareer?: string;
    };
}

const SYSTEM_PROMPT = `You are CareerGuide AI, an expert career counselor specializing in tech careers.
You help users with:
- Career path selection (Data Analytics, Web Dev, AI/ML, UI/UX, DevOps, etc.)
- Resume improvement advice
- Skill gap analysis
- Learning roadmaps and resource recommendations
- Interview preparation tips
- Job search strategies

Rules:
- Stay focused on career guidance topics only
- Be encouraging, specific, and actionable
- If the user asks about non-career topics, gently redirect them
- Keep responses concise but helpful (2-4 paragraphs max)
- Use bullet points for lists
- Reference the user's context (skills/career) when provided`;

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequestBody = await req.json();
        const { message, history = [], context } = body;

        if (!message?.trim()) {
            return NextResponse.json({ error: 'message is required' }, { status: 400 });
        }

        // Build context injection if user has profile data
        let contextNote = '';
        if (context?.resumeSkills?.length) {
            contextNote += `\n\nUser's known skills: ${context.resumeSkills.join(', ')}`;
        }
        if (context?.targetCareer) {
            contextNote += `\nUser's target career: ${context.targetCareer}`;
        }

        const messages: AIMessage[] = [
            { role: 'system', content: SYSTEM_PROMPT + contextNote },
            // Include last 6 messages of history to maintain conversation memory
            ...history.slice(-6).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            { role: 'user', content: message.trim() },
        ];

        const reply = await generateAIResponse(messages, false);

        return NextResponse.json({
            success: true,
            reply: reply || 'I apologize, I could not generate a response. Please try again.',
        });
    } catch (err) {
        console.error('[/api/chat] Error:', err);
        const message = err instanceof Error ? err.message : 'Internal server error';

        // Graceful degradation message
        return NextResponse.json(
            {
                error: message,
                reply:
                    "I'm having trouble connecting to the AI service right now. Please check your API key configuration and try again in a moment.",
            },
            { status: 500 }
        );
    }
}
