import { createClient } from '@supabase/supabase-js';

// Supabase client for browser/client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase client with service role key for server-side operations
// Use this for admin operations and bypassing RLS
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types for interview transcripts and embeddings
export interface InterviewDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    speaker?: string;
    timestamp?: string;
    interview_id?: string;
    turn_number?: number;
    [key: string]: unknown;
  };
  created_at: string;
}
