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
          const q = (u.searchParams.get("quality") || "best").toLowerCase();
          const quality: "best" | "high" | "worst" =
            q === "high" || q === "hd" ? "high" : q === "worst" || q === "low" ? "worst" : "best";

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
          const resolved = await resolveYoutube(canonicalUrl, videoId, quality);
          const data = resolved?.data;
          const mediaUrl = type === "audio" ? data?.audio_url : data?.video_url;

          if (!isDirectMediaUrl(mediaUrl)) {
            console.log("URL não direta detectada:", mediaUrl);
            
            // Tenta uma última resolução forçada via servidor caso o link pareça ser um redirecionamento
            if (mediaUrl && mediaUrl.includes('y2mate.com') && !mediaUrl.includes('dlink')) {
               // Se for um link de 'mate' sem dlink, tentamos tratar como erro de processamento
            }

            return Response.json(
              {
                success: false,
                error:
                  "O YouTube protegeu este conteúdo. Clique em 'Baixar' para usar o link alternativo.",
                fallback_url: data?.download_page_url || mediaUrl
              },
              { status: 502, headers: corsHeaders({ "Content-Type": "application/json" }) },
            );
          }

          const range = request.headers.get("range");
          const upstreamHeaders: Record<string, string> = {
            // Usa o mesmo User-Agent do cliente que gerou o link, senão o googlevideo devolve 403
            "User-Agent": data?.media_ua || BROWSER_UA,
            Referer: "https://www.youtube.com/",
            Accept: "*/*",
          };
          // As faixas adaptativas do YouTube só respondem com Range; sem ele devolvem 403.
          upstreamHeaders["Range"] = range || "bytes=0-";

          const upstream = await fetch(mediaUrl!, { headers: upstreamHeaders, signal: AbortSignal.timeout(20000) });
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
          // Só repassa semântica de Range quando o navegador pediu; caso contrário
          // devolve 200 com o arquivo completo.
          if (range && contentRange) headers["Content-Range"] = contentRange;

          return new Response(upstream.body, {
            status: range && upstream.status === 206 ? 206 : 200,
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
