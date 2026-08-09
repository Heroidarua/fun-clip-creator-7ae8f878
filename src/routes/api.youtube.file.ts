import { createFileRoute } from "@tanstack/react-router";
import {
  ytCors,
  verifyTicket,
  YT_MAX_FILE_BYTES,
  YT_PROCESS_TIMEOUT_MS,
} from "@/lib/youtube-tool.server";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = (name || "")
    .replace(/[\\/:*?"<>|\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return cleaned || fallback;
}

/**
 * Entrega o conteúdo referente a um link temporário assinado.
 * Nada é gravado em disco: o conteúdo é transmitido sob demanda e o token
 * expira automaticamente, dispensando limpeza de arquivos residuais.
 */
export const Route = createFileRoute("/api/youtube/file")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token") || "";
          const ticket = await verifyTicket(token);
          if (!ticket) {
            return Response.json(
              { success: false, error: "Link expirado. Gere um novo download." },
              { status: 410, headers: JSON_HEADERS },
            );
          }

          const { resolveYoutubeCandidates, isDirectMediaUrl, BROWSER_UA } = await import(
            "@/lib/youtube-resolver.server"
          );

          const canonical = `https://www.youtube.com/watch?v=${ticket.videoId}`;
          const range = request.headers.get("range");
          let upstream: Response | null = null;
          let title = ticket.title;

          for await (const candidate of resolveYoutubeCandidates(
            canonical,
            ticket.videoId,
            ticket.quality,
          )) {
            const mediaUrl =
              ticket.type === "audio" ? candidate.audio_url : candidate.video_url;
            if (!isDirectMediaUrl(mediaUrl)) continue;

            const headers: Record<string, string> = {
              "User-Agent": candidate.media_ua || BROWSER_UA,
              Referer: "https://www.youtube.com/",
              Accept: "*/*",
            };
            if (range) headers["Range"] = range;
            try {
              const res = await fetch(mediaUrl!, {
                headers,
                signal: AbortSignal.timeout(YT_PROCESS_TIMEOUT_MS),
              });
              if (res.ok && res.body) {
                const len = Number(res.headers.get("content-length") || 0);
                if (len && len > YT_MAX_FILE_BYTES) {
                  return Response.json(
                    { success: false, error: "Arquivo maior que o limite permitido (1 GB)." },
                    { status: 413, headers: JSON_HEADERS },
                  );
                }
                upstream = res;
                title = title || candidate.title;
                break;
              }
            } catch {
              /* tenta o próximo candidato */
            }
          }

          if (!upstream?.body) {
            return Response.json(
              {
                success: false,
                error:
                  "Não foi possível processar este vídeo. Verifique a URL e tente novamente.",
              },
              { status: 502, headers: JSON_HEADERS },
            );
          }

          const ext = ticket.type === "audio" ? "m4a" : "mp4";
          const filename = `${sanitizeFilename(title, "youtube")}.${ext}`;
          const headers: Record<string, string> = ytCors({
            "Content-Type":
              upstream.headers.get("content-type") ||
              (ticket.type === "audio" ? "audio/mp4" : "video/mp4"),
            "Content-Disposition": `attachment; filename="${filename
              .replace(/[^\x20-\x7E]/g, "_")
              .replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            "Cache-Control": "no-store",
            "Accept-Ranges": "bytes",
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
          return Response.json(
            { success: false, error: "Erro ao entregar o arquivo." },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
