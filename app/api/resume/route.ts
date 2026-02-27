export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { extractResumeText } from '@/lib/parser';
import { generateAIJSON } from '@/lib/ai';

interface ResumeAnalysis {
    skills: string[];
    experience: string[];
    education: string[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
    improvementSuggestions: string[];
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let resumeText: string;
        try {
            resumeText = await extractResumeText(buffer, file.type, file.name);
        } catch (err) {
            return NextResponse.json(
                { error: err instanceof Error ? err.message : 'Failed to parse file' },
                { status: 422 }
            );
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: 'Could not extract enough text from the file. Try a text-based PDF or DOCX.' },
                { status: 422 }
            );
        }

        const analysis = await generateAIJSON<ResumeAnalysis>([
            {
                role: 'system',
                content:
                    'You are a professional resume analyst and career coach. Always respond with valid JSON only.',
            },
            {
                role: 'user',
                content: `Analyze the following resume text and return a JSON object with exactly these fields:
{
  "skills": ["list of technical and soft skills found"],
  "experience": ["short summary of each work/project experience"],
  "education": ["education qualifications"],
  "strengths": ["3-5 candidate strengths"],
  "weaknesses": ["2-3 areas for improvement"],
  "atsScore": <integer 0-100 representing ATS compatibility>,
  "improvementSuggestions": ["3-5 specific resume improvement tips"]
}

Resume Text:
${resumeText.slice(0, 4000)}`,
            },
        ]);

        return NextResponse.json({
            success: true,
            resumeText: resumeText.trim(),
            analysis,
        });
    } catch (err) {
        console.error('[/api/resume] Error:', err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
