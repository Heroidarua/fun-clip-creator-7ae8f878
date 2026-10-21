CREATE TABLE IF NOT EXISTS public.sidebar_marquee_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true,
  text text not null default 'FAÇA UMA DOAÇÃO DE DONATE',
  speed integer not null default 28,
  color text not null default 'primary',
  direction text not null default 'rtl',
  pause_on_hover boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT ON public.sidebar_marquee_settings TO anon;
GRANT SELECT ON public.sidebar_marquee_settings TO authenticated;
GRANT ALL ON public.sidebar_marquee_settings TO service_role;

ALTER TABLE public.sidebar_marquee_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sidebar_marquee_public_read" ON public.sidebar_marquee_settings;
CREATE POLICY "sidebar_marquee_public_read" ON public.sidebar_marquee_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.sidebar_marquee_settings (singleton) SELECT true WHERE NOT EXISTS (SELECT 1 FROM public.sidebar_marquee_settings);

GRANT SELECT ON public.button_settings TO anon;
GRANT SELECT ON public.button_settings TO authenticated;
GRANT ALL ON public.button_settings TO service_role;
ALTER TABLE public.button_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "button_settings_public_read" ON public.button_settings;
CREATE POLICY "button_settings_public_read" ON public.button_settings FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.button_settings (singleton) SELECT true WHERE NOT EXISTS (SELECT 1 FROM public.button_settings);