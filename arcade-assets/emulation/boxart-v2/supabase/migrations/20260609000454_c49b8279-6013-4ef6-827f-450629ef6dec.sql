REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;
REVOKE INSERT, UPDATE, DELETE ON public.user_stats FROM authenticated;
GRANT SELECT ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;