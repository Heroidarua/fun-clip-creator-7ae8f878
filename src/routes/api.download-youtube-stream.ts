import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  resolveYoutubeCandidates,
  isDirectMediaUrl,
  BROWSER_UA,
} from "@/lib/youtube-resolver.server";
import type { YouTubeData } from "@/lib/youtube-resolver.server";

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
          // preview=1 entrega o arquivo para tocar no player (inline), sem
          // forçar o download no navegador.
          const inline = u.searchParams.get("preview") === "1";
          const quality: "best" | "high" | "worst" | "preview" =
            inline ? "preview" : (q === "high" || q === "hd" ? "high" : q === "worst" || q === "low" ? "worst" : "best");

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
          const range = request.headers.get("range");

          // Tenta cada provedor até um link realmente entregar o arquivo.
          // Links do googlevideo podem expirar ou responder 403 conforme o
          // User-Agent/IP; nesses casos passamos para o próximo candidato.
          let upstream: Response | null = null;
          let data: YouTubeData | null = null;
          let lastStatus = 0;
          let sawPartialOnly = false;
          let fallbackPage = "";

          for await (const candidate of resolveYoutubeCandidates(canonicalUrl, videoId, quality)) {
            const mediaUrl = type === "audio" ? candidate.audio_url : candidate.video_url;

            if (type === "video" && candidate.muxed === false && !inline) {
              sawPartialOnly = true;
              continue;
            }
            if (!isDirectMediaUrl(mediaUrl)) {
              fallbackPage = fallbackPage || candidate.download_page_url || mediaUrl || "";
              continue;
            }

            for (const ua of [candidate.media_ua || BROWSER_UA, BROWSER_UA]) {
              const upstreamHeaders: Record<string, string> = {
                "User-Agent": ua,
                Referer: "https://www.youtube.com/",
                Accept: "*/*",
              };
              if (range) upstreamHeaders["Range"] = range;
              try {
                const res = await fetch(mediaUrl!, {
                  headers: upstreamHeaders,
                  signal: AbortSignal.timeout(20000),
                });
                if (res.ok && res.body) {
                  upstream = res;
                  data = candidate;
                  break;
                }
                lastStatus = res.status;
                console.warn(`Candidato falhou (HTTP ${res.status})`);
              } catch (e) {
                console.warn("Candidato falhou:", (e as Error).message);
              }
            }
            if (upstream) break;
          }

          if (!upstream || !upstream.body) {
            console.warn(`Streaming falhou para videoId ${videoId}, quality ${quality}, sawPartialOnly: ${sawPartialOnly}`);
            if (sawPartialOnly) {
              return Response.json(
                {
                  success: false,
                  error:
                    "O YouTube protegeu este vídeo e só libera trechos parciais. Tente outro vídeo — a maioria funciona normalmente.",
                },
                { status: 422, headers: corsHeaders({ "Content-Type": "application/json" }) },
              );
            }
            return Response.json(
              {
                success: false,
                error:
                  "Não foi possível baixar este vídeo agora. Tente novamente em alguns instantes ou escolha outra qualidade.",
                ...(lastStatus ? { upstream_status: lastStatus } : {}),
                ...(fallbackPage ? { fallback_url: fallbackPage } : {}),
              },
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
            "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
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
