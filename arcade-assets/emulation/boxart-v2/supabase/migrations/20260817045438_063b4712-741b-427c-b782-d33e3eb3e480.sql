
CREATE TABLE public.button_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    color text NOT NULL DEFAULT 'success',
    shape text NOT NULL DEFAULT 'rounded-full',
    animate boolean NOT NULL DEFAULT true,
    singleton boolean DEFAULT true UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.button_settings TO anon, authenticated;
GRANT ALL ON public.button_settings TO service_role;

ALTER TABLE public.button_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read button settings" ON public.button_settings FOR SELECT TO anon USING (true);

INSERT INTO public.button_settings (color, shape, animate, singleton)
VALUES ('success', 'rounded-full', true, true)
ON CONFLICT (singleton) DO NOTHING;
