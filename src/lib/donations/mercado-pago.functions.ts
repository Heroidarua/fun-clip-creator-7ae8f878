import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export const createPixDonation = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({
      amount: z.number().min(1).max(50000),
      userId: z.string().uuid().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { amount, userId } = data;
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    // 1. Create donation record in Supabase first (status: pending)
    const { data: donation, error: dbError } = await supabase
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
      throw new Error("Failed to create donation record");
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
            email: "doador@sos01.com.br", // Placeholder required by MP
          },
          external_reference: donation.id,
          installments: 1
        })
      });

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        console.error("MP Error:", mpData);
        throw new Error(mpData.message || "Mercado Pago API error");
      }

      // 3. Update donation with MP details
      const qrCode = mpData.point_of_interaction?.transaction_data?.qr_code;
      const qrCodeBase64 = mpData.point_of_interaction?.transaction_data?.qr_code_base64;
      const externalId = mpData.id?.toString();

      await supabase
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
        expiresAt: mpData.date_of_expiration
      };
    } catch (err) {
      console.error("Donation creation failed:", err);
      // Mark as failed in DB
      await supabase.from("donations").update({ status: "rejected" }).eq("id", donation.id);
      throw err;
    }
  });

export const checkDonationStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: donation, error } = await supabase
      .from("donations")
      .select("status")
      .eq("id", data.id)
      .single();
    
    if (error || !donation) throw new Error("Donation not found");
    return { status: donation.status };
  });
