import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/mercadopago-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { type, data } = body;

          // Only handle payment updates
          if (type === 'payment' && data?.id) {
            const paymentId = data.id;
            const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

            if (!token) {
              return new Response('Config error', { status: 500 });
            }

            // 1. Fetch real status from Mercado Pago
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!mpResponse.ok) {
              return new Response('MP fetch failed', { status: 400 });
            }

            const mpPayment = await mpResponse.json();
            const externalRef = mpPayment.external_reference; // This is our donation.id
            const mpStatus = mpPayment.status;

            if (externalRef) {
              const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
              // 2. Map MP status to our status
              let newStatus = 'pending';
              if (mpStatus === 'approved') newStatus = 'approved';
              else if (mpStatus === 'rejected') newStatus = 'rejected';
              else if (mpStatus === 'cancelled') newStatus = 'cancelled';
              
              // 3. Update DB
              await supabaseAdmin
                .from('donations')
                .update({ 
                  status: newStatus,
                  paid_at: mpStatus === 'approved' ? newStatus === 'approved' ? new Date().toISOString() : null : null
                })
                .eq('id', externalRef);
            }
          }

          return new Response('ok', { status: 200 });
        } catch (err) {
          console.error('Webhook error:', err);
          return new Response('error', { status: 500 });
        }
      }
    }
  }
});
