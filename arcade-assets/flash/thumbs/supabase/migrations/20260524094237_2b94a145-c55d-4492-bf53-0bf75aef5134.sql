
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User stats are viewable by everyone" ON public.user_stats;
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Referral tracking is viewable by everyone" ON public.referral_tracking;
CREATE POLICY "Users can view their own referrals"
  ON public.referral_tracking FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.get_ai_usage_today() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.check_and_log_ai_usage(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_ai_usage_today() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_log_ai_usage(text) TO authenticated;
