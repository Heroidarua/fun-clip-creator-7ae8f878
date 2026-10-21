DROP POLICY IF EXISTS "Anyone can view anonymous jobs by ID" ON public.video_enhancement_jobs;
DROP POLICY IF EXISTS "Anyone can insert anonymous jobs" ON public.video_enhancement_jobs;
REVOKE ALL ON public.video_enhancement_jobs FROM anon;
GRANT ALL ON public.video_enhancement_jobs TO service_role;