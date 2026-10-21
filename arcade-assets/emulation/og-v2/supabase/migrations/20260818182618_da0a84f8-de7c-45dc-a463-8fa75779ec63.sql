CREATE TABLE IF NOT EXISTS public.youtube_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    video_id text NOT NULL,
    title text,
    quality text,
    format text,
    progress integer DEFAULT 0,
    file_path text,
    error_message text,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '2 hours')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_jobs TO authenticated;
GRANT ALL ON public.youtube_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.youtube_jobs TO anon;

ALTER TABLE public.youtube_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.youtube_jobs;
CREATE POLICY "Users can insert their own jobs" ON public.youtube_jobs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can select their own jobs" ON public.youtube_jobs;
CREATE POLICY "Users can select their own jobs" ON public.youtube_jobs FOR SELECT TO anon, authenticated USING (true);