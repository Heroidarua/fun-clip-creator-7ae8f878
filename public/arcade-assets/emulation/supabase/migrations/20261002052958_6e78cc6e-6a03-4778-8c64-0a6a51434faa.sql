CREATE TABLE public.store_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customer_email TEXT,
  amount_brl NUMERIC(10,2) NOT NULL,
  fee_brl NUMERIC(10,2) NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'pending',
  mp_payment_id TEXT,
  qr_code TEXT,
  qr_code_base64 TEXT,
  expires_at TIMESTAMPTZ,
  delivered_data JSONB,
  error_message TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.store_orders TO service_role;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_store_orders_updated_at BEFORE UPDATE ON public.store_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();