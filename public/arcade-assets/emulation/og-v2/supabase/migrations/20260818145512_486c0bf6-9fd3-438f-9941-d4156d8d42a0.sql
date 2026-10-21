-- 1. IPTV spin results: bind inserts to the caller
DROP POLICY IF EXISTS "Anyone can insert spin results" ON public.iptv_spin_results;
DROP POLICY IF EXISTS "Anyone can insert their own spin" ON public.iptv_spin_results;
CREATE POLICY "Insert own spin results" ON public.iptv_spin_results
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 2. YouTube download jobs: bind inserts to the caller
DROP POLICY IF EXISTS "Anonymous can insert jobs" ON public.youtube_download_jobs;
CREATE POLICY "Insert own download jobs" ON public.youtube_download_jobs
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3. Referral tracking: validate referrer identity and code
DROP POLICY IF EXISTS "Users can insert referral entries" ON public.referral_tracking;
CREATE POLICY "Users can insert valid referral entries" ON public.referral_tracking
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_id
    AND referrer_id <> referred_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = referral_tracking.referrer_id
        AND p.referral_code = referral_tracking.referral_code
    )
  );