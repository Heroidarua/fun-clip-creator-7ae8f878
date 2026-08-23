import { createFileRoute } from "@tanstack/react-router";
import {
  corsHeaders,
  isCrossOrigin,
  isRateLimited,
  timingSafeEqual,
} from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/manage-feature-status")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }) => {
        try {
          if (isCrossOrigin(request)) {
            return Response.json(
              { error: "Origem não permitida" },
              { status: 403, headers: corsHeaders(request) }
            );
          }
          if (await isRateLimited(request)) {
            return Response.json(
              { error: "Muitas tentativas. Aguarde um minuto." },
              { status: 429, headers: corsHeaders(request) }
            );
          }
          const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
          if (!ADMIN_PASSWORD) {
            return Response.json(
              { error: "Servidor mal configurado" },
              { status: 500, headers: corsHeaders(request) }
            );
          }
          const { password, id, status } = await request.json();
          if (typeof password !== "string" || !timingSafeEqual(password, ADMIN_PASSWORD)) {
            return Response.json(
              { error: "Senha incorreta" },
              { status: 401, headers: corsHeaders(request) }
            );
          }
          const UUID_RE =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (
            typeof id !== "string" ||
            !UUID_RE.test(id) ||
            (status !== "active" && status !== "maintenance")
          ) {
            return Response.json(
              { error: "Parâmetros inválidos" },
              { status: 400, headers: corsHeaders(request) }
            );
          }

          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );
          const { error } = await supabaseAdmin
            .from("downloader_status")
            .update({ status, last_checked: new Date().toISOString() })
            .eq("id", id);
          if (error) throw error;

          return Response.json({ success: true }, { headers: corsHeaders(request) });
        } catch (error: any) {
          console.error("manage-feature-status error:", error);
          return Response.json(
            { error: "Erro interno" },
            { status: 500, headers: corsHeaders(request) }
          );
        }
      },
    },
  },
});