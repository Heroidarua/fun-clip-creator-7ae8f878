DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.youtube_jobs;
DROP POLICY IF EXISTS "Users can select their own jobs" ON public.youtube_jobs;
REVOKE ALL ON public.youtube_jobs FROM anon, authenticated;
GRANT ALL ON public.youtube_jobs TO service_role;
ALTER TABLE public.youtube_jobs ENABLE ROW LEVEL SECURITY;