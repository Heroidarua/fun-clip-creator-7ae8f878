import { createFileRoute } from "@tanstack/react-router";
import {
  clearRateLimit,
  corsHeaders,
  isCrossOrigin,
  isRateLimited,
  timingSafeEqual,
} from "@/lib/admin-auth.server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TITLE = 120;
const MAX_MESSAGE = 1000;
const MARQUEE_COLORS = ["primary", "accent", "secondary", "success", "warning", "danger", "foreground"] as const;
const MARQUEE_DIRECTIONS = ["rtl", "ltr"] as const;
const BUTTON_COLORS = ["primary", "success", "accent", "warning", "danger", "foreground"] as const;
const BUTTON_SHAPES = ["rounded-full", "rounded-lg", "rounded-md", "rounded-none"] as const;

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export const Route = createFileRoute("/api/manage-announcements")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(request),
        });
      },
      POST: async ({ request }) => {
        try {
          if (isCrossOrigin(request)) {
            return Response.json(
              { error: "Origem não permitida" },
              { status: 403, headers: corsHeaders(request) }
            );
          }
          const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
          if (!ADMIN_PASSWORD) {
            console.error("ADMIN_PASSWORD env var is not configured");
            return Response.json(
              { error: "Servidor mal configurado" },
              { status: 500, headers: corsHeaders(request) }
            );
          }
          const body = await request.json();
          const { action, password, data: payload } = body;

          if (typeof password !== "string" || !timingSafeEqual(password, ADMIN_PASSWORD)) {
            const limited = await isRateLimited(request);
            return Response.json(
              { error: limited ? "Muitas tentativas. Aguarde cinco minutos." : "Senha incorreta" },
              { status: limited ? 429 : 401, headers: corsHeaders(request) }
            );
          }

          await clearRateLimit(request);

          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          switch (action) {
            case "list": {
              const { data, error } = await supabaseAdmin
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

              if (error) throw error;
              return Response.json(
                { data },
                { headers: corsHeaders(request) }
              );
            }

            case "create": {
              const title = cleanText(payload?.title, MAX_TITLE);
              const message = cleanText(payload?.message, MAX_MESSAGE);
              if (!title || !message) {
                return Response.json(
                  { error: "Título e mensagem são obrigatórios e devem respeitar o limite de caracteres" },
                  { status: 400, headers: corsHeaders(request) }
                );
              }
              const { error } = await supabaseAdmin
                .from("announcements")
                .insert({
                  title,
                  message,
                  active: true,
                });

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders(request) }
              );
            }

            case "update": {
              const title = cleanText(payload?.title, MAX_TITLE);
              const message = cleanText(payload?.message, MAX_MESSAGE);
              if (
                typeof payload?.id !== "string" ||
                !UUID_RE.test(payload.id) ||
                !title ||
                !message ||
                typeof payload?.active !== "boolean"
              ) {
                return Response.json(
                  { error: "Parâmetros inválidos" },
                  { status: 400, headers: corsHeaders(request) }
                );
              }
              const { error } = await supabaseAdmin
                .from("announcements")
                .update({
                  title,
                  message,
                  active: payload.active,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", payload.id);

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders(request) }
              );
            }

            case "delete": {
              if (typeof payload?.id !== "string" || !UUID_RE.test(payload.id)) {
                return Response.json(
                  { error: "Parâmetros inválidos" },
                  { status: 400, headers: corsHeaders(request) }
                );
              }
              const { error } = await supabaseAdmin
                .from("announcements")
                .delete()
                .eq("id", payload.id);

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders(request) }
              );
            }

            case "get-marquee": {
              const { data, error } = await (supabaseAdmin as any)
                .from("marquee_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

              if (error) throw error;
              return Response.json(
                { data },
                { headers: corsHeaders(request) }
              );
            }

            case "save-marquee": {
              const speed = Number(payload?.speed);
              const color = String(payload?.color ?? "");
              const direction = String(payload?.direction ?? "");
              const pauseOnHover = payload?.pause_on_hover;

              if (
                !Number.isFinite(speed) ||
                speed < 5 ||
                speed > 120 ||
                !MARQUEE_COLORS.includes(color as (typeof MARQUEE_COLORS)[number]) ||
                !MARQUEE_DIRECTIONS.includes(direction as (typeof MARQUEE_DIRECTIONS)[number]) ||
                typeof pauseOnHover !== "boolean"
              ) {
                return Response.json(
                  { error: "Parâmetros inválidos" },
                  { status: 400, headers: corsHeaders(request) }
                );
              }

              const { data: existing } = await (supabaseAdmin as any)
                .from("marquee_settings")
                .select("id")
                .limit(1)
                .maybeSingle();

              const values = {
                speed: Math.round(speed),
                color,
                direction,
                pause_on_hover: pauseOnHover,
              };

              const { error } = existing?.id
                ? await (supabaseAdmin as any).from("marquee_settings").update(values).eq("id", existing.id)
                : await (supabaseAdmin as any).from("marquee_settings").insert({ ...values, singleton: true });

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders(request) }
              );
            }

            case "get-button-settings": {
              const { data, error } = await (supabaseAdmin as any)
                .from("button_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

              if (error) throw error;
              return Response.json(
                { data },
                { headers: corsHeaders(request) }
              );
            }

            case "save-button-settings": {
              const color = String(payload?.color ?? "");
              const shape = String(payload?.shape ?? "");
              const animate = payload?.animate;

              if (
                !BUTTON_COLORS.includes(color as (typeof BUTTON_COLORS)[number]) ||
                !BUTTON_SHAPES.includes(shape as (typeof BUTTON_SHAPES)[number]) ||
                typeof animate !== "boolean"
              ) {
                return Response.json(
                  { error: "Parâmetros inválidos" },
                  { status: 400, headers: corsHeaders(request) }
                );
              }

              const { data: existing } = await (supabaseAdmin as any)
                .from("button_settings")
                .select("id")
                .limit(1)
                .maybeSingle();

              const values = {
                color,
                shape,
                animate,
              };

              const { error } = existing?.id
                ? await (supabaseAdmin as any).from("button_settings").update(values).eq("id", existing.id)
                : await (supabaseAdmin as any).from("button_settings").insert({ ...values, singleton: true });

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders(request) }
              );
            }

            case "get-sidebar-marquee": {
              const { data, error } = await (supabaseAdmin as any)
                .from("sidebar_marquee_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

              if (error) throw error;
              return Response.json({ data }, { headers: corsHeaders(request) });
            }

            case "save-sidebar-marquee": {
              const speed = Number(payload?.speed);
              const color = String(payload?.color ?? "");
              const direction = String(payload?.direction ?? "");
              const pauseOnHover = payload?.pause_on_hover;
              const text = cleanText(payload?.text, 200);

              if (
                !Number.isFinite(speed) ||
                speed < 5 ||
                speed > 120 ||
                !MARQUEE_COLORS.includes(color as (typeof MARQUEE_COLORS)[number]) ||
                !MARQUEE_DIRECTIONS.includes(direction as (typeof MARQUEE_DIRECTIONS)[number]) ||
                typeof pauseOnHover !== "boolean" ||
                !text
              ) {
                return Response.json(
                  { error: "Parâmetros inválidos" },
                  { status: 400, headers: corsHeaders(request) }
                );
              }

              const { data: existing } = await (supabaseAdmin as any)
                .from("sidebar_marquee_settings")
                .select("id")
                .limit(1)
                .maybeSingle();

              const values = {
                speed: Math.round(speed),
                color,
                direction,
                pause_on_hover: pauseOnHover,
                text,
                updated_at: new Date().toISOString(),
              };

              const { error } = existing?.id
                ? await (supabaseAdmin as any).from("sidebar_marquee_settings").update(values).eq("id", existing.id)
                : await (supabaseAdmin as any).from("sidebar_marquee_settings").insert({ ...values, singleton: true });

              if (error) throw error;
              return Response.json({ success: true }, { headers: corsHeaders(request) });
            }

            default:
              return Response.json(
                { error: "Ação inválida" },
                { status: 400, headers: corsHeaders(request) }
              );
          }
        } catch (error: any) {
          console.error("Manage announcements error:", error);
          return Response.json(
            { error: "Erro interno" },
            { status: 500, headers: corsHeaders(request) }
          );
        }
      },
    },
  },
});
