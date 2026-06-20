import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/manage-feature-status")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
          if (!ADMIN_PASSWORD) {
            return Response.json(
              { error: "Servidor mal configurado" },
              { status: 500, headers: corsHeaders() }
            );
          }
          const { password, id, status } = await request.json();
          if (password !== ADMIN_PASSWORD) {
            return Response.json(
              { error: "Senha incorreta" },
              { status: 401, headers: corsHeaders() }
            );
          }
          if (!id || (status !== "active" && status !== "maintenance")) {
            return Response.json(
              { error: "Parâmetros inválidos" },
              { status: 400, headers: corsHeaders() }
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

          return Response.json({ success: true }, { headers: corsHeaders() });
        } catch (error: any) {
          console.error("manage-feature-status error:", error);
          return Response.json(
            { error: error.message || "Erro interno" },
            { status: 500, headers: corsHeaders() }
          );
        }
      },
    },
  },
});

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}