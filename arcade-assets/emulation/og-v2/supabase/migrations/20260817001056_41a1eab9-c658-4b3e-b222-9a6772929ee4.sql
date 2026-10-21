CREATE TABLE public.iptv_spin_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    outcome TEXT NOT NULL,
    won BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT ON public.iptv_spin_results TO authenticated;
GRANT SELECT, INSERT ON public.iptv_spin_results TO anon;
GRANT ALL ON public.iptv_spin_results TO service_role;

ALTER TABLE public.iptv_spin_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own spin"
ON public.iptv_spin_results
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can read their own spins"
ON public.iptv_spin_results
FOR SELECT
TO anon, authenticated
USING (true);