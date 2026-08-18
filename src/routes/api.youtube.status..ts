import { createFileRoute } from "@tanstack/react-router";
import { ytCors } from "@/lib/youtube-tool.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

export const Route = createFileRoute("/api/youtube/status/")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      GET: async ({ params }) => {
        try {
          // @ts-ignore -Params are typed by the route path
          const { id } = params;
          if (!id) {
            return Response.json(
              { success: false, error: "ID do job ausente." },
              { status: 400, headers: JSON_HEADERS }
            );
          }

          const { data: job, error } = await supabaseAdmin
            .from("youtube_jobs")
            .select("*")
            .eq("id", id)
            .single();

          if (error || !job) {
            return Response.json(
              { success: false, error: "Job não encontrado." },
              { status: 404, headers: JSON_HEADERS }
            );
          }

          return Response.json(
            {
              success: true,
              status: job.status,
              progress: job.progress,
              title: job.title,
              error: job.error_message,
            },
            { headers: JSON_HEADERS }
          );
        } catch (error: any) {
          console.error("youtube/status error:", error);
          return Response.json(
            { success: false, error: "Erro ao consultar status." },
            { status: 500, headers: JSON_HEADERS }
          );
        }
      },
    },
  },
});
