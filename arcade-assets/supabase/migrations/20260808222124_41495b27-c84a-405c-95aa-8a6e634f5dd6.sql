CREATE TABLE public.marquee_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  speed integer NOT NULL DEFAULT 28,
  color text NOT NULL DEFAULT 'primary',
  direction text NOT NULL DEFAULT 'rtl',
  pause_on_hover boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.marquee_settings TO anon;
GRANT SELECT ON public.marquee_settings TO authenticated;
GRANT ALL ON public.marquee_settings TO service_role;

ALTER TABLE public.marquee_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marquee settings are viewable by everyone"
ON public.marquee_settings FOR SELECT USING (true);

CREATE TRIGGER update_marquee_settings_updated_at
BEFORE UPDATE ON public.marquee_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.marquee_settings (singleton) VALUES (true);