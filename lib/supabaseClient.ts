import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Convenience re-export as `supabase` for backward-compat with existing imports
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type InterviewRecord = {
  id?: string;
  resume_text: string;
  role: string;
  questions: string[];
  answers: string[];
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    recommended_topics: string[];
  };
  created_at?: string;
};
