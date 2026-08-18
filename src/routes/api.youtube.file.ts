import { createFileRoute } from "@tanstack/react-router";
import { verifyTicket, ytCors } from "@/lib/youtube-tool.server";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  resolveYoutubeCandidates,
  isDirectMediaUrl,
  BROWSER_UA,
} from "@/lib/youtube-resolver.server";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

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
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      GET: async ({ request }) => {
        try {
          const u = new URL(request.url);
          const token = u.searchParams.get("token");
          if (!token) {
            return Response.json({ success: false, error: "Token ausente." }, { status: 401, headers: JSON_HEADERS });
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
            return Response.json({ success: false, error: "Token inválido ou expirado." }, { status: 403, headers: JSON_HEADERS });
          }

          const { videoId, type, quality, title } = ticket;
          const isPreview = u.searchParams.get("preview") === "1";
          const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const range = request.headers.get("range");

          let upstream: Response | null = null;
          let data: any = null;

          for await (const candidate of resolveYoutubeCandidates(canonicalUrl, videoId, quality)) {
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
                  signal: AbortSignal.timeout(20000),
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
            return Response.json({ success: false, error: "Não foi possível conectar ao YouTube." }, { status: 502, headers: JSON_HEADERS });
          }

          const ext = type === "audio" ? "m4a" : "mp4";
          const contentType = upstream.headers.get("content-type") || (type === "audio" ? "audio/mp4" : "video/mp4");
          const filename = `${sanitizeFilename(data?.title || title || "youtube", "youtube")}.${ext}`;
          
          const headers: Record<string, string> = ytCors({
            "Content-Type": contentType,
            "Content-Disposition": isPreview 
              ? "inline" 
              : `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            "Cache-Control": "no-store",
            "Accept-Ranges": "bytes",
            "x-yt-muxed": data?.muxed ? "1" : "0",
          });
          
          const len = upstream.headers.get("content-length");
          if (len) headers["Content-Length"] = len;
          const contentRange = upstream.headers.get("content-range");
          if (range && contentRange) headers["Content-Range"] = contentRange;

          return new Response(upstream.body, {
            status: range && upstream.status === 206 ? 206 : 200,
            headers,
          });
        } catch (error: any) {
          console.error("youtube/file error:", error);
          return Response.json({ success: false, error: "Erro ao baixar arquivo." }, { status: 500, headers: JSON_HEADERS });
        }
      },
    },
  },
});
