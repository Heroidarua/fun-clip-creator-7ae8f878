import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildPixPayload } from "./pix-payload";

export const createPixDonation = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: any }) => {
    // Manual validation since TanStack version might differ in builder methods
    const parsed = z.object({
      amount: z.number().min(1).max(50000),
      userId: z.string().uuid().optional(),
    }).parse(data);

    const { amount, userId } = parsed;
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

    if (!token) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    // Tokens de teste (TEST-...) geram QR Codes de sandbox que os bancos reais
    // recusam com "Pix inexistente". Nesse caso usamos o Pix estático real.
    const isSandboxToken = token.startsWith("TEST-");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Create donation record in Supabase first (status: pending)
    const { data: donation, error: dbError } = await supabaseAdmin
      .from("donations")
      .insert({
        amount,
        user_id: userId || null,
        status: "pending",
        provider: "mercado_pago",
        currency: "BRL"
      })
      .select()
      .single();

    if (dbError || !donation) {
      console.error("Donation insert error:", dbError);
      throw new Error(`Falha ao registrar a doação: ${dbError?.message ?? "sem retorno"}`);
    }

    if (isSandboxToken) {
      const staticCode = buildPixPayload(amount, donation.id.replace(/-/g, "").slice(0, 20));
      await supabaseAdmin
        .from("donations")
        .update({ qr_code: staticCode, payment_method: "pix_estatico" })
        .eq("id", donation.id);

      return {
        id: donation.id,
        amount,
        qrCode: staticCode,
        qrCodeBase64: null,
        expiresAt: null,
        isStatic: true,
        publicKey,
      };
    }

    try {
      // 2. Call Mercado Pago API
      const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": donation.id
        },
        body: JSON.stringify({
          transaction_amount: amount,
          payment_method_id: "pix",
          description: "Doação para SOS01",
          payer: {
            email: "doador@sos01.com.br",
            first_name: "Apoiador",
            last_name: "SOS01",
            identification: { type: "CPF", number: "19119119100" },
          },
          external_reference: donation.id,
        })
      });

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        console.error("MP Error:", JSON.stringify(mpData));
        // Fallback: Pix estático com a chave cadastrada
        const staticCode = buildPixPayload(amount, donation.id.replace(/-/g, "").slice(0, 20));
        await supabaseAdmin
          .from("donations")
          .update({ qr_code: staticCode, payment_method: "pix_estatico" })
          .eq("id", donation.id);

        return {
          id: donation.id,
          amount,
          qrCode: staticCode,
          qrCodeBase64: null,
          expiresAt: null,
          isStatic: true,
          publicKey,
        };
      }

      // 3. Update donation with MP details
      const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code;
      const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64;
      const externalId = mpData.id?.toString();

      await supabaseAdmin
        .from("donations")
        .update({
          external_payment_id: externalId,
          qr_code: qrCode,
          qr_code_base64: qrCodeBase64,
          expires_at: mpData.date_of_expiration
        })
        .eq("id", donation.id);

      return {
        id: donation.id,
        amount,
        qrCode,
        qrCodeBase64,
        expiresAt: mpData.date_of_expiration,
        isStatic: false,
        publicKey: publicKey // Pass public key if needed by client
      };
    } catch (err) {
      console.error("Donation creation failed:", err);
      // Último recurso: entrega o Pix estático para não travar a doação
      const staticCode = buildPixPayload(amount, donation.id.replace(/-/g, "").slice(0, 20));
      await supabaseAdmin
        .from("donations")
        .update({ qr_code: staticCode, payment_method: "pix_estatico" })
        .eq("id", donation.id);

      return {
        id: donation.id,
        amount,
        qrCode: staticCode,
        qrCodeBase64: null,
        expiresAt: null,
        isStatic: true,
        publicKey,
      };
    }
  });

export const checkDonationStatus = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data: any }) => {
    const parsed = z.object({ id: z.string().uuid() }).parse(data);
    const { id } = parsed;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .select("status")
      .eq("id", id)
      .single();
    
    if (error || !donation) throw new Error("Donation not found");
    return { status: donation.status };
  });
