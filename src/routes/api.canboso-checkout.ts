import { createFileRoute } from "@tanstack/react-router";
import { isCrossOrigin, isRateLimited } from "@/lib/admin-auth.server";

const CANBOSO_BASE = "https://canboso.com/api/v2/telegram-buyer";
const FEE_BRL = 4;
const MAX_QTY = 50;

function canbosoKey(): string | null {
  return process.env["CANBOSO_API_KEY"] || null;
}

async function fetchProductPrice(productId: string): Promise<{ name: string; amount: number } | null> {
  const key = canbosoKey();
  if (!key) return null;
  try {
    const res = await fetch(`${CANBOSO_BASE}/products`, { headers: { "X-API-Key": key } });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      products?: { productId: string; name: string; price?: { amount: number } }[];
    };
    if (!res.ok || !data.success) return null;
    const p = (data.products ?? []).find((x) => x.productId === productId);
    if (!p || typeof p.price?.amount !== "number" || p.price.amount <= 0) return null;
    return { name: p.name, amount: p.price.amount };
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/canboso-checkout")({
  server: {
    handlers: {
      // Cria o pedido e gera o Pix (preço Canboso + taxa de R$4)
      POST: async ({ request }) => {
        if (isCrossOrigin(request)) return Response.json({ error: "Origem não permitida." }, { status: 403 });
        if (await isRateLimited(request)) {
          return Response.json({ error: "Muitas tentativas. Aguarde cinco minutos." }, { status: 429 });
        }
        const body = (await request.json().catch(() => null)) as
          | { productId?: string; quantity?: number; customerEmail?: string }
          | null;
        if (!body) return Response.json({ error: "Pedido inválido." }, { status: 400 });

        const productId = String(body.productId ?? "");
        const quantity = Math.floor(Number(body.quantity ?? 1));
        if (!/^[\w-]{3,64}$/.test(productId) || !(quantity >= 1 && quantity <= MAX_QTY)) {
          return Response.json({ error: "Produto ou quantidade inválidos." }, { status: 400 });
        }
        let email: string | null = null;
        if (body.customerEmail) {
          email = String(body.customerEmail).trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json({ error: "E-mail inválido." }, { status: 400 });
          }
        }

        const product = await fetchProductPrice(productId);
        if (!product) {
          return Response.json({ error: "Produto indisponível no momento." }, { status: 502 });
        }
        const amount = Math.round((product.amount * quantity + FEE_BRL) * 100) / 100;

        const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!token) return Response.json({ error: "Pagamentos temporariamente indisponíveis." }, { status: 503 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order, error: dbError } = await supabaseAdmin
          .from("store_orders")
          .insert({
            product_id: productId,
            product_name: product.name,
            quantity,
            customer_email: email,
            amount_brl: amount,
            fee_brl: FEE_BRL,
            status: "pending",
          })
          .select("id")
          .single();
        if (dbError || !order) {
          return Response.json({ error: "Não foi possível registrar o pedido." }, { status: 500 });
        }

        try {
          const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-Idempotency-Key": order.id,
            },
            body: JSON.stringify({
              transaction_amount: amount,
              payment_method_id: "pix",
              description: `SOS01 Loja: ${product.name} x${quantity}`,
              payer: {
                email: email ?? "cliente@sos01.com.br",
                first_name: "Cliente",
                last_name: "SOS01",
              },
              external_reference: order.id,
            }),
          });
          const mpData = await mpResponse.json();
          if (!mpResponse.ok) {
            console.error("MP store checkout error:", JSON.stringify(mpData));
            await supabaseAdmin
              .from("store_orders")
              .update({ status: "error", error_message: "Falha ao gerar o Pix." })
              .eq("id", order.id);
            return Response.json({ error: "Não foi possível gerar o Pix. Tente novamente." }, { status: 502 });
          }

          const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code ?? null;
          const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;
          await supabaseAdmin
            .from("store_orders")
            .update({
              mp_payment_id: mpData.id?.toString() ?? null,
              qr_code: qrCode,
              qr_code_base64: qrCodeBase64,
              expires_at: mpData.date_of_expiration ?? null,
            })
            .eq("id", order.id);

          return Response.json({
            orderId: order.id,
            amount,
            qrCode,
            qrCodeBase64,
            expiresAt: mpData.date_of_expiration ?? null,
          });
        } catch (err) {
          console.error("Store checkout failed:", err);
          return Response.json({ error: "Falha de conexão com o pagamento." }, { status: 502 });
        }
      },

      // Consulta o status do pedido (e as credenciais quando entregue)
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") ?? "";
        if (!/^[0-9a-f-]{36}$/i.test(id)) {
          return Response.json({ error: "Pedido inválido." }, { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order, error } = await supabaseAdmin
          .from("store_orders")
          .select("status, delivered_data, error_message, product_name, quantity, amount_brl")
          .eq("id", id)
          .single();
        if (error || !order) return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
        return Response.json({
          status: order.status,
          productName: order.product_name,
          quantity: order.quantity,
          amount: order.amount_brl,
          delivered: order.status === "delivered" ? order.delivered_data : null,
          errorMessage: order.status === "error" ? order.error_message : null,
        });
      },
    },
  },
});
