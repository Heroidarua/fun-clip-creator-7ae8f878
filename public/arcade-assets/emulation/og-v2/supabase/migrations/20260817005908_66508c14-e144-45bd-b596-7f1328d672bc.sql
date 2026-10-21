
-- Create donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    external_payment_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    provider TEXT NOT NULL DEFAULT 'mercado_pago',
    qr_code TEXT,
    qr_code_base64 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON public.donations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.donations TO anon;
GRANT ALL ON public.donations TO service_role;

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own donations" ON public.donations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Anon can view own donations by ID" ON public.donations
    FOR SELECT
    TO anon
    USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
