import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  resolveYoutube,
  isDirectMediaUrl,
  BROWSER_UA,
} from "@/lib/youtube-resolver.server";

function corsHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra,
  };
}

function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = (name || "")
    .replace(/[\\/:*?"<>|\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return cleaned || fallback;
}

export const Route = createFileRoute("/api/download-youtube-stream")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders() }),

      GET: async ({ request }) => {
        try {
          const u = new URL(request.url);
          const rawUrl = (u.searchParams.get("url") || "").trim();
          const type =
            (u.searchParams.get("type") || "video") === "audio" ? "audio" : "video";

          if (!rawUrl || rawUrl.length > 2048) {
            return Response.json(
              { success: false, error: "URL ausente." },
              { status: 400, headers: corsHeaders({ "Content-Type": "application/json" }) },
            );
          }
          const parsed = parseYouTubeUrl(rawUrl);
          if (!parsed || (parsed.kind !== "video" && parsed.kind !== "shorts")) {
            return Response.json(
              { success: false, error: "URL do YouTube inválida." },
              { status: 400, headers: corsHeaders({ "Content-Type": "application/json" }) },
            );
          }

          const videoId = parsed.videoId!;
          const canonicalUrl = parsed.canonicalUrl || rawUrl;
          const resolved = await resolveYoutube(canonicalUrl, videoId);
          const data = resolved?.data;
          const mediaUrl = type === "audio" ? data?.audio_url : data?.video_url;

          if (!isDirectMediaUrl(mediaUrl)) {
            return Response.json(
              {
                success: false,
                error:
                  "Não foi possível extrair a mídia direta agora. Tente novamente em instantes.",
              },
              { status: 502, headers: corsHeaders({ "Content-Type": "application/json" }) },
            );
          }

          const range = request.headers.get("range");
          const upstreamHeaders: Record<string, string> = {
            "User-Agent": BROWSER_UA,
            Referer: "https://www.youtube.com/",
            Accept: "*/*",
          };
          if (range) upstreamHeaders["Range"] = range;

          const upstream = await fetch(mediaUrl!, { headers: upstreamHeaders });
          if (!upstream.ok || !upstream.body) {
            return Response.json(
              { success: false, error: `Falha ao baixar (HTTP ${upstream.status}).` },
              { status: 502, headers: corsHeaders({ "Content-Type": "application/json" }) },
            );
          }

          const ext = type === "audio" ? "m4a" : "mp4";
          const contentType =
            upstream.headers.get("content-type") ||
            (type === "audio" ? "audio/mp4" : "video/mp4");
          const filename = `${sanitizeFilename(data?.title || "", "youtube")}.${ext}`;
          const headers: Record<string, string> = corsHeaders({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            "Cache-Control": "no-store",
            "Accept-Ranges": "bytes",
          });
          const len = upstream.headers.get("content-length");
          if (len) headers["Content-Length"] = len;
          const contentRange = upstream.headers.get("content-range");
          if (contentRange) headers["Content-Range"] = contentRange;

          return new Response(upstream.body, {
            status: upstream.status === 206 ? 206 : 200,
            headers,
          });
        } catch (error: any) {
          console.error("YouTube stream error:", error);
          return Response.json(
            { success: false, error: error?.message || "Erro ao baixar." },
            { status: 500, headers: corsHeaders({ "Content-Type": "application/json" }) },
          );
        }
      },
    },
  },
});
