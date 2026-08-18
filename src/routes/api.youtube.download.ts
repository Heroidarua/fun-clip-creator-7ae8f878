import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  ytCors,
  ytClientIp,
  ytRateLimit,
  signTicket,
  YT_LINK_TTL_SECONDS,
} from "@/lib/youtube-tool.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
          
          // Mapeamento compatível com o HeroSection e youtube-resolver.server.ts
          let quality: "best" | "high" | "worst" = "best";
          if (requested.includes("720") || requested === "high" || requested.includes("mp4-720")) {
            quality = "high";
          } else if (requested.includes("worst") || requested.includes("480") || requested.includes("mp4-480") || requested.includes("360")) {
            quality = "worst";
          }

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

          const videoId = parsed.videoId!;
          
          // Registra o job no banco para rastreamento (opcional para stream direto, mas útil)
          const { data: job, error: jobError } = await supabaseAdmin
            .from("youtube_jobs")
            .insert({
              video_id: videoId,
              status: "completed", // Para streaming direto, já marcamos como pronto
              quality,
              format,
              progress: 100,
            })
            .select()
            .single();

          const token = await signTicket({
            videoId,
            type: format === "m4a" ? "audio" : "video",
            quality,
            title: "",
          });

          return Response.json(
            {
              success: true,
              status: "ready",
              jobId: job?.id,
              expiresIn: YT_LINK_TTL_SECONDS,
              downloadUrl: `/api/youtube/file?token=${encodeURIComponent(token)}`,
            },
            { headers: JSON_HEADERS },
          );
        } catch (error: any) {
          console.error("youtube/download error:", error);
          return Response.json(
            {
              success: false,
              error:
                "Não foi possível processar este vídeo. Verifique a URL e tente novamente.",
            },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
