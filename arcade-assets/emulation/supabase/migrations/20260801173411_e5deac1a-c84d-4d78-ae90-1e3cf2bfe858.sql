
-- 1) Least privilege: revoke blanket grants, re-grant only what policies allow
REVOKE ALL ON public.profiles, public.user_stats, public.notifications,
  public.favorite_games, public.referral_tracking, public.ai_usage_log,
  public.announcements, public.downloader_status FROM anon, authenticated;

-- public read-only tables
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT SELECT ON public.downloader_status TO anon, authenticated;

-- user-owned tables (auth.uid() scoped policies)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_stats TO authenticated;
GRANT SELECT ON public.ai_usage_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorite_games TO authenticated;
GRANT SELECT, INSERT ON public.referral_tracking TO authenticated;

GRANT ALL ON public.profiles, public.user_stats, public.notifications,
  public.favorite_games, public.referral_tracking, public.ai_usage_log,
  public.announcements, public.downloader_status TO service_role;

-- 2) Indexes for frequent lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_favorite_games_user
  ON public.favorite_games (user_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer
  ON public.referral_tracking (referrer_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active
  ON public.announcements (active, priority DESC, created_at DESC);

-- 3) Value validation
ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_type_check
  CHECK (type IN ('info','warning','success','error'));
ALTER TABLE public.downloader_status
  ADD CONSTRAINT downloader_status_status_check
  CHECK (status IN ('operational','active','maintenance','down'));
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('info','warning','success','error'));
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_theme_check
  CHECK (profile_theme IN ('purple','blue','green','orange','pink','red','cyan','yellow'));
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_len CHECK (bio IS NULL OR char_length(bio) <= 500);
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_len
  CHECK (display_name IS NULL OR char_length(display_name) <= 60);
