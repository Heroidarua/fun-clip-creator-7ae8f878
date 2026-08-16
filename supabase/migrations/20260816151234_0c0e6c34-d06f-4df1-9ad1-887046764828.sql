ALTER TABLE public.youtube_download_jobs ADD COLUMN IF NOT EXISTS title TEXT;

-- Re-grant permissions
GRANT ALL ON public.youtube_download_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_download_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_download_jobs TO anon;
