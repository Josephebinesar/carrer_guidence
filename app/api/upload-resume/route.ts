export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { extractResumeText } from '@/lib/parser';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('resume') as File | null;
        const role = formData.get('role') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        if (!role) {
            return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let resumeText: string;
        try {
            resumeText = await extractResumeText(buffer, file.type, file.name);
        } catch (err) {
            return NextResponse.json(
                { error: err instanceof Error ? err.message : 'Failed to parse file. Ensure it is a valid PDF or DOCX.' },
                { status: 422 }
            );
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: 'Could not extract enough text from the file. Try a text-based PDF or DOCX.' },
                { status: 422 }
            );
        }

        // Insert initial interview record into Supabase (non-fatal if DB not configured)
        let interviewId = `local-${Date.now()}`;
        try {
            const { data, error } = await supabase
                .from('interviews')
                .insert({
                    resume_text: resumeText.trim(),
                    role,
                    questions: [],
                    answers: [],
                    score: 0,
                    feedback: {},
                })
                .select()
                .single();

            if (!error && data) {
                interviewId = data.id;
            }
        } catch (dbErr) {
            console.warn('[upload-resume] Supabase insert failed (continuing without DB):', dbErr);
        }

        return NextResponse.json({
            success: true,
            interviewId,
            resumeText: resumeText.trim(),
        });
    } catch (err) {
        console.error('[/api/upload-resume] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
