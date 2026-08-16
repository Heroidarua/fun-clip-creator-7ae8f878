import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  ytCors,
  ytClientIp,
  ytRateLimit,
  signTicket,
  YT_LINK_TTL_SECONDS,
} from "@/lib/youtube-tool.server";
import { supabase } from "@/integrations/supabase/client";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

export const Route = createFileRoute("/api/youtube/download")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      POST: async ({ request }) => {
        try {
          if (!ytRateLimit(ytClientIp(request), 8)) {
            return Response.json(
              { success: false, error: "Muitas requisições. Aguarde um instante." },
              { status: 429, headers: JSON_HEADERS },
            );
          }

          const body = await request.json().catch(() => null);
          const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
          const format = body?.format === "m4a" ? "m4a" : "mp4";
          const requested = String(body?.quality || "best").toLowerCase();
          const quality: "best" | "4k" | "2k" | "1080p" | "high" | "worst" =
            requested === "4k" || requested === "2160p"
              ? "4k"
              : requested === "2k" || requested === "1440p"
                ? "2k"
                : requested === "1080p"
                  ? "1080p"
                  : requested === "720p" || requested === "high"
                    ? "high"
                    : requested === "worst" || requested === "low"
                      ? "worst"
                      : "best";

          if (!rawUrl || rawUrl.length > 2048) {
            return Response.json(
              { success: false, error: "Informe a URL do vídeo do YouTube." },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          const parsed = parseYouTubeUrl(rawUrl);
          if (!parsed || (parsed.kind !== "video" && parsed.kind !== "shorts")) {
            return Response.json(
              { success: false, error: "URL do YouTube inválida." },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          // Criar Job no banco de dados para processamento assíncrono
          const { data: job, error: jobError } = await supabase
            .from("youtube_download_jobs")
            .insert({
              video_id: parsed.videoId!,
              source_url: parsed.canonicalUrl,
              format: format,
              quality: quality,
              status: 'PENDING',
              progress: 0
            })
            .select()
            .single();

          if (jobError || !job) {
            console.error("Job creation error:", jobError);
            throw new Error("Falha ao criar tarefa de download.");
          }

          // Gerar token para o download real
          const token = await signTicket({
            videoId: parsed.videoId!,
            type: format === "m4a" ? "audio" : "video",
            quality,
            title: "",
          });

          const downloadUrl = `/api/youtube/file?token=${encodeURIComponent(token)}&jobId=${job.id}`;
          
          await supabase
            .from("youtube_download_jobs")
            .update({ 
              status: 'COMPLETED', 
              progress: 100, 
              file_url: downloadUrl 
            })
            .eq("id", job.id);

          return Response.json(
            {
              success: true,
              status: "ready",
              jobId: job.id,
              expiresIn: YT_LINK_TTL_SECONDS,
              downloadUrl: downloadUrl,
            },
            { headers: JSON_HEADERS },
          );
        } catch (error: any) {
          console.error("youtube/download error:", error);
          return Response.json(
            {
              success: false,
              error: error.message || "Não foi possível processar este vídeo.",
            },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
