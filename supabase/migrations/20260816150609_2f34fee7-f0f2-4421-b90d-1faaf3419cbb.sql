CREATE TYPE public.youtube_job_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE public.youtube_download_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    video_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    format TEXT NOT NULL,
    quality TEXT NOT NULL,
    status public.youtube_job_status NOT NULL DEFAULT 'PENDING',
    progress INTEGER NOT NULL DEFAULT 0,
    file_size BIGINT,
    file_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '1 hour') NOT NULL
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.youtube_download_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.youtube_download_jobs TO anon;
GRANT ALL ON public.youtube_download_jobs TO service_role;

-- RLS
ALTER TABLE public.youtube_download_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs" ON public.youtube_download_jobs
    FOR SELECT USING (true);

CREATE POLICY "Anonymous can insert jobs" ON public.youtube_download_jobs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can do everything" ON public.youtube_download_jobs
    TO service_role USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX idx_youtube_jobs_status ON public.youtube_download_jobs(status);
CREATE INDEX idx_youtube_jobs_expires_at ON public.youtube_download_jobs(expires_at);
