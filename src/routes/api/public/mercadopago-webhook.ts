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

              // 3. Update donation (externalRef may be a donation id)
              await supabaseAdmin
                .from('donations')
                .update({
                  status: newStatus,
                  paid_at: mpStatus === 'approved' ? new Date().toISOString() : null
                })
                .eq('id', externalRef);

              // 4. Store order: on approval, buy on Canboso and deliver
              const { data: order } = await supabaseAdmin
                .from('store_orders')
                .select('id, product_id, quantity, customer_email, status')
                .eq('id', externalRef)
                .maybeSingle();

              if (order && order.status === 'pending') {
                if (mpStatus === 'approved') {
                  await supabaseAdmin
                    .from('store_orders')
                    .update({ status: 'paid', paid_at: new Date().toISOString() })
                    .eq('id', order.id);

                  const key = process.env.CANBOSO_API_KEY;
                  if (key) {
                    try {
                      const payload: Record<string, unknown> = {
                        key,
                        product_id: order.product_id,
                        quantity: order.quantity,
                      };
                      if (order.customer_email) payload.customer_email = order.customer_email;
                      const purchaseRes = await fetch('https://canboso.com/api/v2/telegram-buyer/purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `sos01-${order.id}` },
                        body: JSON.stringify(payload),
                      });
                      const purchaseData = (await purchaseRes.json().catch(() => ({}))) as Record<string, unknown>;
                      if (purchaseRes.ok && purchaseData.success !== false) {
                        await supabaseAdmin
                          .from('store_orders')
                          .update({ status: 'delivered', delivered_data: purchaseData })
                          .eq('id', order.id);
                      } else {
                        await supabaseAdmin
                          .from('store_orders')
                          .update({
                            status: 'error',
                            error_message: typeof purchaseData.message === 'string'
                              ? purchaseData.message
                              : 'Falha ao entregar o produto.',
                          })
                          .eq('id', order.id);
                      }
                    } catch (err) {
                      console.error('Canboso delivery error:', err);
                      await supabaseAdmin
                        .from('store_orders')
                        .update({ status: 'error', error_message: 'Falha de conexão com a loja.' })
                        .eq('id', order.id);
                    }
                  }
                } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
                  await supabaseAdmin
                    .from('store_orders')
                    .update({ status: mpStatus })
                    .eq('id', order.id);
                }
              }
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
