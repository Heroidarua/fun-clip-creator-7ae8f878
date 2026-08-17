# Plan: Migrate Pix Donation from Mercado Pago to Stripe

The user wants to integrate Stripe for donations. Since the current Pix integration uses Mercado Pago, I will migrate it to Stripe while maintaining the "Pix" user experience if possible, or offering Stripe's standard checkout/payment element. Stripe supports Pix in Brazil via their Payment Intents API.

## User Review Required

> [!IMPORTANT]
> The current integration uses Mercado Pago for Pix. Stripe also supports Pix in Brazil. I will migrate the backend logic to Stripe. Do you want to keep it as "Pix only" or should I enable Credit Card and other Stripe methods as well?

## Proposed Changes

### Backend (Server Functions)
- Create `src/lib/donations/stripe.functions.ts` to handle Stripe Payment Intent creation for Pix.
- Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` requirements.
- Replace Mercado Pago API calls with Stripe Node.js SDK (or fetch-based API calls for edge compatibility).

### Webhook
- Create `src/routes/api/public/stripe-webhook.ts` to handle `payment_intent.succeeded` and other relevant events.
- Update the `donations` table in Supabase based on Stripe events.

### Frontend
- Update `DonationModal.tsx` to handle Stripe's Pix response (Stripe provides a Pix code and QR code URL/image).
- Adjust the polling/realtime logic if Stripe's webhook flow differs.

### Database
- The existing `donations` table already has fields for `external_payment_id`, `qr_code`, and `status`, which are compatible with Stripe's Pix implementation.

## Technical Details
- Use Stripe's `payment_intents` with `payment_method_types: ['pix']`.
- Stripe's Pix implementation provides `next_action.pix_display_qr_code` containing `data` (copy/paste code) and `image_url_256`.
- Webhook verification will use `stripe.webhooks.constructEvent` or manual signature verification for edge.
