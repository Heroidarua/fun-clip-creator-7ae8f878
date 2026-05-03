import { createFileRoute } from "@tanstack/react-router";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sos012025";

export const Route = createFileRoute("/api/manage-announcements")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(),
        });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { action, password, data: payload } = body;

          if (password !== ADMIN_PASSWORD) {
            return Response.json(
              { error: "Senha incorreta" },
              { status: 401, headers: corsHeaders() }
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
                .order("created_at", { ascending: false });

              if (error) throw error;
              return Response.json(
                { data },
                { headers: corsHeaders() }
              );
            }

            case "create": {
              if (!payload?.title || !payload?.message) {
                return Response.json(
                  { error: "Título e mensagem são obrigatórios" },
                  { status: 400, headers: corsHeaders() }
                );
              }
              const { error } = await supabaseAdmin
                .from("announcements")
                .insert({
                  title: payload.title,
                  message: payload.message,
                  active: true,
                });

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders() }
              );
            }

            case "update": {
              if (!payload?.id) {
                return Response.json(
                  { error: "ID do aviso é obrigatório" },
                  { status: 400, headers: corsHeaders() }
                );
              }
              const { error } = await supabaseAdmin
                .from("announcements")
                .update({
                  title: payload.title,
                  message: payload.message,
                  active: payload.active,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", payload.id);

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders() }
              );
            }

            case "delete": {
              if (!payload?.id) {
                return Response.json(
                  { error: "ID do aviso é obrigatório" },
                  { status: 400, headers: corsHeaders() }
                );
              }
              const { error } = await supabaseAdmin
                .from("announcements")
                .delete()
                .eq("id", payload.id);

              if (error) throw error;
              return Response.json(
                { success: true },
                { headers: corsHeaders() }
              );
            }

            default:
              return Response.json(
                { error: "Ação inválida" },
                { status: 400, headers: corsHeaders() }
              );
          }
        } catch (error: any) {
          console.error("Manage announcements error:", error);
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
