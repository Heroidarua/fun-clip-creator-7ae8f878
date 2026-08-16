-- profiles: allow owners to delete their own profile
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
GRANT DELETE ON public.profiles TO authenticated;

-- referral_tracking: keep records immutable; make fail-closed explicit
REVOKE UPDATE, DELETE ON public.referral_tracking FROM authenticated, anon;
GRANT ALL ON public.referral_tracking TO service_role;

-- user_stats: writes remain trusted-server only (no client write policies)
REVOKE INSERT, UPDATE, DELETE ON public.user_stats FROM authenticated, anon;
GRANT SELECT ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;