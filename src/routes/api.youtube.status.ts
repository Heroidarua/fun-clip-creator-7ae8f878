import { createFileRoute } from "@tanstack/react-router";
import { ytCors, ytClientIp, ytRateLimit } from "@/lib/youtube-tool.server";
import { supabase } from "@/integrations/supabase/client";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

export const Route = createFileRoute("/api/youtube/status")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const jobId = url.searchParams.get("jobId");

          if (!jobId) {
            return Response.json(
              { success: false, error: "jobId é obrigatório." },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          const { data, error } = await supabase
            .from("youtube_download_jobs")
            .select("*")
            .eq("id", jobId)
            .single();

          if (error || !data) {
            return Response.json(
              { success: false, error: "Tarefa não encontrada." },
              { status: 404, headers: JSON_HEADERS },
            );
          }

          return Response.json(
            {
              success: true,
              status: data.status,
              progress: data.progress,
              downloadUrl: data.file_url,
              error: data.error_message,
            },
            { headers: JSON_HEADERS },
          );
        } catch (error: any) {
          console.error("youtube/status error:", error);
          return Response.json(
            { success: false, error: "Erro ao consultar status." },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
