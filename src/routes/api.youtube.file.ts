import { createFileRoute } from "@tanstack/react-router";
import {
  ytCors,
  verifyTicket,
  YT_MAX_FILE_BYTES,
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

/** O CDN do YouTube recusa faixas abertas (bytes=0-); usamos blocos fixos. */
const CHUNK_BYTES = 1_000_000;

interface ContentRange {
  start: number;
  end: number;
  total: number;
}

function parseContentRange(value: string | null): ContentRange | null {
  const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(value || "");
  if (!match) return null;
  return {
    start: Number(match[1]),
    end: Number(match[2]),
    total: Number(match[3]),
  };
}

/** Transmite o arquivo inteiro pedindo blocos sequenciais ao CDN. */
function chunkedStream(
  mediaUrl: string,
  baseHeaders: Record<string, string>,
  start: number,
  total: number,
  first: Response,
  firstRange: ContentRange,
): ReadableStream<Uint8Array> {
  let cursor = firstRange.end + 1;
  let current: ReadableStreamDefaultReader<Uint8Array> | null =
    first.body!.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        if (current) {
          const { done, value } = await current.read();
          if (!done) {
            controller.enqueue(value!);
            return;
          }
          current = null;
        }
        if (cursor >= total) {
          controller.close();
          return;
        }
        const end = Math.min(cursor + CHUNK_BYTES - 1, total - 1);
        const res = await fetch(mediaUrl, {
          headers: { ...baseHeaders, Range: `bytes=${cursor}-${end}` },
        });
        if (!res.ok || !res.body) {
          controller.error(new Error("upstream chunk failed"));
          return;
        }
        const receivedRange = parseContentRange(res.headers.get("content-range"));
        if (!receivedRange || receivedRange.start !== cursor || receivedRange.end < cursor) {
          await res.body.cancel().catch(() => {});
          controller.error(new Error("upstream returned an invalid byte range"));
          return;
        }
        cursor = receivedRange.end + 1;
        current = res.body.getReader();
      }
    },
    cancel() {
      current?.cancel().catch(() => {});
    },
  });
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
        console.log("youtube/file requested:", request.url);
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
          const clientRange = request.headers.get("range");
          const rangeStart = Number(/bytes=(\d+)-/.exec(clientRange || "")?.[1] || 0);
          let body: ReadableStream<Uint8Array> | null = null;
          let contentType = "";
          let total = 0;
          let title = ticket.title;
          let muxed = false;

          for await (const candidate of resolveYoutubeCandidates(
            canonical,
            ticket.videoId,
            ticket.quality,
          )) {
            const mediaUrl =
              ticket.type === "audio" ? candidate.audio_url : candidate.video_url;
            if (!isDirectMediaUrl(mediaUrl)) continue;

            const baseHeaders: Record<string, string> = {
              "User-Agent": candidate.media_ua || BROWSER_UA,
              Accept: "*/*",
            };
            try {
              const firstEnd = rangeStart + CHUNK_BYTES - 1;
              const res = await fetch(mediaUrl!, {
                headers: { ...baseHeaders, Range: `bytes=${rangeStart}-${firstEnd}` },
              });
              
              if (res.ok && res.body) {
                const receivedRange = parseContentRange(res.headers.get("content-range"));
                const contentLength = Number(res.headers.get("content-length") || 0);
                if (res.status === 206 && (!receivedRange || receivedRange.start !== rangeStart)) {
                  await res.body.cancel().catch(() => {});
                  continue;
                }
                total = receivedRange?.total || contentLength;
                if (total > YT_MAX_FILE_BYTES) {
                  return Response.json(
                    { success: false, error: "Arquivo maior que o limite permitido (1 GB)." },
                    { status: 413, headers: JSON_HEADERS },
                  );
                }
                contentType = res.headers.get("content-type") || "";
                muxed = candidate.muxed !== false;
                body = receivedRange && receivedRange.end + 1 < total
                  ? chunkedStream(
                      mediaUrl!,
                      baseHeaders,
                      rangeStart,
                      total,
                      res,
                      receivedRange,
                    )
                  : res.body;
                title = title || candidate.title;
                break;
              }
            } catch {
              /* tenta o próximo candidato */
            }
          }

          if (!body) {
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
              contentType || (ticket.type === "audio" ? "audio/mp4" : "video/mp4"),
            "Content-Disposition": `attachment; filename="${filename
              .replace(/[^\x20-\x7E]/g, "_")
              .replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            "Cache-Control": "no-store",
            "Accept-Ranges": "bytes",
            "X-Yt-Muxed": muxed ? "1" : "0",
            "Access-Control-Expose-Headers": "X-Yt-Muxed, Content-Length",
          });
          if (total) headers["Content-Length"] = String(total - rangeStart);
          if (clientRange && total) {
            headers["Content-Range"] = `bytes ${rangeStart}-${total - 1}/${total}`;
          }

          return new Response(body, {
            status: clientRange ? 206 : 200,
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
