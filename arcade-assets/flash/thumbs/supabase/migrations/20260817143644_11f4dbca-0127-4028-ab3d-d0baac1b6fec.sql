-- donations
DROP POLICY IF EXISTS "Anon can view own donations by ID" ON public.donations;
REVOKE SELECT ON public.donations FROM anon;

-- iptv_spin_results
DROP POLICY IF EXISTS "Users can read their own spins" ON public.iptv_spin_results;
DROP POLICY IF EXISTS "Users can view their own spins" ON public.iptv_spin_results;
CREATE POLICY "Authenticated can view own spins"
ON public.iptv_spin_results FOR SELECT TO authenticated
USING (auth.uid() = user_id);
REVOKE SELECT ON public.iptv_spin_results FROM anon;

-- youtube_download_jobs
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.youtube_download_jobs;
CREATE POLICY "Users can view their own jobs"
ON public.youtube_download_jobs FOR SELECT TO authenticated
USING (auth.uid() = user_id);
REVOKE SELECT ON public.youtube_download_jobs FROM anon;