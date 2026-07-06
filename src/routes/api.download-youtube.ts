import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import { resolveYoutube } from "@/lib/youtube-resolver.server";

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const Route = createFileRoute("/api/download-youtube")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders() }),

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
          if (!rawUrl || rawUrl.length > 2048) {
            return Response.json(
              { success: false, error: "URL ausente ou muito longa." },
              { status: 400, headers: corsHeaders() },
            );
          }
          const parsed = parseYouTubeUrl(rawUrl);
          if (!parsed) {
            return Response.json(
              { success: false, error: "URL do YouTube inválida." },
              { status: 400, headers: corsHeaders() },
            );
          }
          if (parsed.kind !== "video" && parsed.kind !== "shorts") {
            return Response.json(
              {
                success: false,
                error:
                  parsed.kind === "channel"
                    ? "Esse link é de um canal. Cole o link de um vídeo ou shorts."
                    : "Esse link é de uma playlist. Cole o link de um vídeo específico.",
              },
              { status: 400, headers: corsHeaders() },
            );
          }
          const videoId = parsed.videoId!;
          const canonicalUrl = parsed.canonicalUrl || rawUrl;

          const result = await resolveYoutube(canonicalUrl, videoId);

          const { reportDownloaderResult } = await import(
            "@/lib/downloader-status.server"
          );
          reportDownloaderResult("youtube", result.success);

          return Response.json(result, {
            status: result.success ? 200 : 502,
            headers: corsHeaders(),
          });
        } catch (error: any) {
          console.error("YouTube download error:", error);
          return Response.json(
            { success: false, error: error?.message || "Erro ao processar vídeo do YouTube" },
            { status: 500, headers: corsHeaders() },
          );
        }
      },
    },
  },
});
