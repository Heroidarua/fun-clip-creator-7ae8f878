CREATE TABLE IF NOT EXISTS public.admin_rate_limit (
    ip TEXT PRIMARY KEY,
    attempts INTEGER DEFAULT 1,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_rate_limit TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_rate_limit TO authenticated;

ALTER TABLE public.admin_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limit"
    ON public.admin_rate_limit
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
