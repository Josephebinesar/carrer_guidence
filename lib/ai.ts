/**
 * lib/ai.ts
 * AI provider: Groq (llama3-8b-8192) — sole provider.
 */

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Groq (llama3-8b-8192)
// ──────────────────────────────────────────────────────────────────────────────
async function callGroq(messages: AIMessage[], jsonMode = false): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set in .env.local');

    const body: Record<string, unknown> = {
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Generate an AI response using Groq (llama3-8b-8192).
 */
export async function generateAIResponse(
    messages: AIMessage[],
    jsonMode = false
): Promise<string> {
    return callGroq(messages, jsonMode);
}

/**
 * Convenience wrapper that ensures the response is valid JSON.
 */
export async function generateAIJSON<T = unknown>(messages: AIMessage[]): Promise<T> {
    const raw = await callGroq(messages, true);

    const cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in Groq response');

    return JSON.parse(match[0]) as T;
}

// ──────────────────────────────────────────────────────────────────────────────
// Legacy helpers — kept for backward compatibility with interview route
// ──────────────────────────────────────────────────────────────────────────────
export async function queryHuggingFace(prompt: string): Promise<string> {
    // Redirect to Groq; HuggingFace is no longer used
    return callGroq([{ role: 'user', content: prompt }]);
}

export function buildInterviewPrompt(
    resumeText: string,
    role: string,
    conversationHistory: { question: string; answer: string }[],
    questionNumber: number
): string {
    const historyText = conversationHistory
        .map((h, i) => `Q${i + 1}: ${h.question}\nCandidate Answer: ${h.answer}`)
        .join('\n\n');

    const isLastQuestion = questionNumber >= 8;

    return `You are a senior interviewer from top IT companies like TCS, Google India, Amazon India.

You are interviewing a candidate for the role of: ${role}

Candidate Resume:
${resumeText}

Interview Rules:
- Ask ONE question at a time
- Ask total 8 questions: questions 1-5 are technical, questions 6-8 are HR
- Questions should be relevant to the resume and the ${role} role

${historyText ? `Previous Interview History:\n${historyText}\n\n` : ''}

${isLastQuestion
            ? `All 8 questions have been asked. Provide the FINAL EVALUATION in this JSON format ONLY:
{
  "score": <number from 0 to 100>,
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>"],
  "improvements": ["<improvement1>"],
  "recommended_topics": ["<topic1>"]
}`
            : `Now ask question number ${questionNumber} of 8. ${questionNumber <= 5 ? 'This should be a technical question.' : 'This should be an HR question.'} Ask ONLY the question, nothing else.`
        }`;
}
