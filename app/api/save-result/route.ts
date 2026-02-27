export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { interviewId, questions, answers, score, feedback } = body;

        if (!interviewId) {
            return NextResponse.json(
                { error: 'interviewId is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('interviews')
            .update({
                questions,
                answers,
                score,
                feedback,
            })
            .eq('id', interviewId);

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json(
                { error: 'Failed to save results to database' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Save result error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
