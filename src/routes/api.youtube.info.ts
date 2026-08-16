import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  ytCors,
  ytClientIp,
  ytRateLimit,
  YT_MAX_DURATION_SECONDS,
} from "@/lib/youtube-tool.server";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

/** Estimativa grosseira de tamanho por qualidade (bytes). */
function estimateBytes(duration: number, kbps: number): number | null {
  if (!duration || duration <= 0) return null;
  return Math.round((duration * kbps * 1000) / 8);
}

export const Route = createFileRoute("/api/youtube/info")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      POST: async ({ request }) => {
        try {
          if (!ytRateLimit(ytClientIp(request))) {
            return Response.json(
              { success: false, error: "Muitas requisições. Aguarde um instante." },
              { status: 429, headers: JSON_HEADERS },
            );
          }

          const body = await request.json().catch(() => null);
          const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
          if (!rawUrl || rawUrl.length > 2048) {
            return Response.json(
              { success: false, error: "Informe a URL do vídeo do YouTube." },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          const parsed = parseYouTubeUrl(rawUrl);
          if (!parsed || (parsed.kind !== "video" && parsed.kind !== "shorts")) {
            return Response.json(
              {
                success: false,
                error:
                  parsed?.kind === "channel"
                    ? "Esse link é de um canal. Cole o link de um vídeo ou shorts."
                    : parsed?.kind === "playlist"
                      ? "Esse link é de uma playlist. Cole o link de um vídeo específico."
                      : "URL do YouTube inválida.",
              },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          const videoId = parsed.videoId!;
          const { resolveYoutube, fallbackThumbnail } = await import(
            "@/lib/youtube-resolver.server"
          );
          const result = await resolveYoutube(parsed.canonicalUrl, videoId);
          const data = result.data;

          if (!result.success || !data) {
            return Response.json(
              {
                success: false,
                error:
                  "Não foi possível processar este vídeo. Verifique a URL e tente novamente.",
              },
              { status: 502, headers: JSON_HEADERS },
            );
          }

          const duration = Number(data.duration) || 0;
          if (duration > YT_MAX_DURATION_SECONDS) {
            return Response.json(
              {
                success: false,
                error: `Vídeo muito longo (limite de ${YT_MAX_DURATION_SECONDS / 60} minutos).`,
              },
              { status: 413, headers: JSON_HEADERS },
            );
          }

          const formats = [
            {
              id: "mp4-4k",
              container: "mp4" as const,
              type: "video" as const,
              quality: "best",
              label: "MP4 — 4K / 2K (Ultra HD)",
              estimatedBytes: estimateBytes(duration, 15000),
            },
            {
              id: "mp4-1080p",
              container: "mp4" as const,
              type: "video" as const,
              quality: "best",
              label: "MP4 — 1080p (Full HD)",
              estimatedBytes: estimateBytes(duration, 5000),
            },
            {
              id: "mp4-720p",
              container: "mp4" as const,
              type: "video" as const,
              quality: "high",
              label: "MP4 — 720p (HD)",
              estimatedBytes: estimateBytes(duration, 2500),
            },
            {
              id: "mp4-480p",
              container: "mp4" as const,
              type: "video" as const,
              quality: "worst",
              label: "MP4 — 480p (Qualidade SD)",
              estimatedBytes: estimateBytes(duration, 1200),
            },
            {
              id: "m4a-audio",
              container: "m4a" as const,
              type: "audio" as const,
              quality: "best",
              label: "Áudio — M4A 128 kbps",
              estimatedBytes: estimateBytes(duration, 128),
            },
          ];

          return Response.json(
            {
              success: true,
              videoId,
              url: parsed.canonicalUrl,
              title: data.title || "Vídeo do YouTube",
              author: data.author || "",
              thumbnail: data.thumbnail || fallbackThumbnail(videoId),
              duration,
              formats,
            },
            { headers: JSON_HEADERS },
          );
        } catch (error: any) {
          console.error("youtube/info error:", error);
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
