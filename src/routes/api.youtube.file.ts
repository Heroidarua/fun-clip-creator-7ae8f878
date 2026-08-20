import { createFileRoute } from "@tanstack/react-router";
import { verifyTicket, ytCors } from "@/lib/youtube-tool.server";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  resolveYoutubeCandidates,
  isDirectMediaUrl,
  BROWSER_UA,
} from "@/lib/youtube-resolver.server";
import { YT_PROCESS_TIMEOUT_MS } from "@/lib/youtube-tool.server";

const JSON_HEADERS = { "Content-Type": "application/json", ...ytCors() };

function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = (name || "")
    .replace(/[\\/:*?"<>|\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return cleaned || fallback;
}

export const Route = createFileRoute("/api/youtube/file")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const h = new Headers();
        Object.entries(ytCors()).forEach(([k, v]) => h.set(k, v));
        return new Response(null, { status: 204, headers: h });
      },

      GET: async ({ request }) => {
        try {
          const u = new URL(request.url);
          const token = u.searchParams.get("token");
          if (!token) {
            const h = new Headers();
            Object.entries(JSON_HEADERS).forEach(([k, v]) => h.set(k, v));
            return new Response(JSON.stringify({ success: false, error: "Token ausente." }), { 
              status: 401, 
              headers: h 
            });
          }

          let ticket = await verifyTicket(token);
          const isPreview = u.searchParams.get("preview") === "1";

          // Se for apenas uma prévia e o token for o VideoID (não assinado), geramos um ticket temporário
          if (!ticket && isPreview && token.length <= 15) {
            ticket = {
              videoId: token,
              type: "video",
              quality: "worst",
              title: "preview",
              exp: Date.now() + 60000
            };
          }

          if (!ticket) {
            const h = new Headers();
            Object.entries(JSON_HEADERS).forEach(([k, v]) => h.set(k, v));
            return new Response(JSON.stringify({ success: false, error: "Token inválido ou expirado." }), { 
              status: 403, 
              headers: h 
            });
          }

          const { videoId, type, quality, title } = ticket;
          const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const range = request.headers.get("range");

          let upstream: Response | null = null;
          let data: any = null;

          // Tentamos resolver candidatos até conseguir um stream válido
          const resolvedQuality = type === "video" ? "worst" : quality;
          for await (const candidate of resolveYoutubeCandidates(canonicalUrl, videoId, resolvedQuality)) {
            const mediaUrl = type === "audio" ? candidate.audio_url : candidate.video_url;

            if (!isDirectMediaUrl(mediaUrl)) continue;

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
                  signal: AbortSignal.timeout(120000), // Aumentado para 60s para vídeos maiores
                });
                
                if (res.ok && res.body) {
                  upstream = res;
                  data = candidate;
                  break;
                }
              } catch (e) {
                console.warn("Candidato falhou:", (e as Error).message);
              }
            }
            if (upstream) break;
          }

          if (!upstream || !upstream.body) {
            const h = new Headers();
            Object.entries(JSON_HEADERS).forEach(([k, v]) => h.set(k, v));
            return new Response(JSON.stringify({ success: false, error: "Não foi possível conectar ao YouTube." }), { 
              status: 502, 
              headers: h 
            });
          }

          const ext = type === "audio" ? "m4a" : "mp4";
          const upstreamType = upstream.headers.get("content-type");
          const contentType = upstreamType || (type === "audio" ? "audio/mp4" : "video/mp4");
          
          // Force video/mp4 for previews to ensure browser compatibility
          const finalContentType = isPreview ? "video/mp4" : contentType;
          const filename = `${sanitizeFilename(data?.title || title || "youtube", "youtube")}.${ext}`;
          
          const responseHeaders = new Headers();
          responseHeaders.set("Content-Type", finalContentType);
          responseHeaders.set("Content-Disposition", isPreview 
            ? "inline" 
            : `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set("Cache-Control", "no-store");
          responseHeaders.set("Accept-Ranges", "bytes");
          responseHeaders.set("x-yt-muxed", data?.muxed ? "1" : "0");
          
          const cors = ytCors();
          Object.entries(cors).forEach(([k, v]) => responseHeaders.set(k, v));
          
          const len = upstream.headers.get("content-length");
          if (len) responseHeaders.set("Content-Length", len);
          
          const contentRange = upstream.headers.get("content-range");
          if (range && contentRange) responseHeaders.set("Content-Range", contentRange);

          return new Response(upstream.body, {
            status: range && upstream.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        } catch (error: any) {
          console.error("youtube/file error:", error);
          const h = new Headers();
          Object.entries(JSON_HEADERS).forEach(([k, v]) => h.set(k, v));
          return new Response(JSON.stringify({ success: false, error: "Erro ao baixar arquivo." }), { 
            status: 500, 
            headers: h 
          });
        }
      },
    },
  },
});
