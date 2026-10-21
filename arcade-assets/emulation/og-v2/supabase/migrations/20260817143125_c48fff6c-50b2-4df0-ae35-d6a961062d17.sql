CREATE TABLE IF NOT EXISTS public.iptv_spin_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    outcome TEXT NOT NULL,
    won BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT ON public.iptv_spin_results TO anon;
GRANT SELECT, INSERT ON public.iptv_spin_results TO authenticated;
GRANT ALL ON public.iptv_spin_results TO service_role;

ALTER TABLE public.iptv_spin_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert spin results" ON public.iptv_spin_results FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view their own spins" ON public.iptv_spin_results FOR SELECT TO anon, authenticated USING (true);