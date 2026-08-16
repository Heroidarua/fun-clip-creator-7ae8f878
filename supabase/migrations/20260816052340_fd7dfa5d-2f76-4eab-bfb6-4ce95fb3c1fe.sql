-- Enable pg_trgm for search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id SERIAL PRIMARY KEY,
    external_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    platform TEXT,
    src TEXT NOT NULL,
    img TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search and filtering
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_title_trgm ON public.games USING gin (title gin_trgm_ops);

-- Grants
GRANT SELECT ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO service_role;

-- RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'games' AND policyname = 'Public games are viewable by everyone'
    ) THEN
        CREATE POLICY "Public games are viewable by everyone" ON public.games FOR SELECT USING (true);
    END IF;
END
$$;
