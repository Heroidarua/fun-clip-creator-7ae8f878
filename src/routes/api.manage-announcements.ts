import { createFileRoute } from "@tanstack/react-router";
import {
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
          if (isRateLimited(request)) {
            return Response.json(
              { error: "Muitas tentativas. Aguarde um minuto." },
              { status: 429, headers: corsHeaders(request) }
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
            return Response.json(
              { error: "Senha incorreta" },
              { status: 401, headers: corsHeaders(request) }
            );
          }

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
