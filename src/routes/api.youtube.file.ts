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
const CHUNK_BYTES = 4_000_000;
/** O googlevideo bloqueia rajadas de requisições: tentamos novamente com pausa. */
const MAX_CHUNK_ATTEMPTS = 6;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

export interface MediaSource {
  url: string;
  headers: Record<string, string>;
}

/** Busca um bloco tentando novamente e renovando o link quando o CDN recusa. */
async function fetchChunk(
  source: MediaSource,
  start: number,
  end: number,
  refresh: () => Promise<MediaSource | null>,
): Promise<{ response: Response; range: ContentRange; source: MediaSource }> {
  let current = source;
  let lastError = "upstream chunk failed";

  for (let attempt = 0; attempt < MAX_CHUNK_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(current.url, {
        headers: { ...current.headers, Range: `bytes=${start}-${end}` },
      });
      if (res.ok && res.body) {
        const range = parseContentRange(res.headers.get("content-range"));
        if (range && range.start === start && range.end >= start) {
          return { response: res, range, source: current };
        }
        const length = Number(res.headers.get("content-length") || 0);
        if (!range && length > 0) {
          return {
            response: res,
            range: { start, end: start + length - 1, total: start + length },
            source: current,
          };
        }
      }
      lastError = `upstream status ${res.status}`;
      await res.body?.cancel().catch(() => {});
    } catch (error: any) {
      lastError = error?.message || lastError;
    }

    await sleep(Math.min(5000, 500 * 2 ** attempt));
    if (attempt >= 1) {
      const renewed = await refresh().catch(() => null);
      if (renewed) current = renewed;
    }
  }

  throw new Error(lastError);
}

/** Transmite o arquivo inteiro pedindo blocos sequenciais ao CDN. */
function chunkedStream(
  source: MediaSource,
  total: number,
  first: Response,
  firstRange: ContentRange,
  refresh: () => Promise<MediaSource | null>,
): ReadableStream<Uint8Array> {
  let cursor = firstRange.end + 1;
  let active = source;
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
        try {
          const chunk = await fetchChunk(active, cursor, end, refresh);
          active = chunk.source;
          cursor = chunk.range.end + 1;
          current = chunk.response.body!.getReader();
        } catch (error) {
          controller.error(error as Error);
          return;
        }
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

          const { resolveYoutube, resolveYoutubeCandidates, isDirectMediaUrl, BROWSER_UA } = await import(
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

          /** Gera um link novo do CDN quando o atual é recusado no meio do download. */
          const refresh = async (): Promise<MediaSource | null> => {
            const fresh = await resolveYoutube(canonical, ticket.videoId, ticket.quality);
            const data = fresh?.data;
            if (!data) return null;
            const freshUrl = ticket.type === "audio" ? data.audio_url : data.video_url;
            if (!isDirectMediaUrl(freshUrl)) return null;
            return {
              url: freshUrl!,
              headers: { "User-Agent": data.media_ua || BROWSER_UA, Accept: "*/*" },
            };
          };

          for await (const candidate of resolveYoutubeCandidates(
            canonical,
            ticket.videoId,
            ticket.quality,
          )) {
            const mediaUrl =
              ticket.type === "audio" ? candidate.audio_url : (candidate.muxed ? candidate.video_url : candidate.video_url);
            if (!isDirectMediaUrl(mediaUrl)) continue;

            const baseHeaders: Record<string, string> = {
              "User-Agent": candidate.media_ua || BROWSER_UA,
              Accept: "*/*",
            };
            const source: MediaSource = { url: mediaUrl!, headers: baseHeaders };
            try {
              const firstEnd = rangeStart + CHUNK_BYTES - 1;
              const first = await fetchChunk(source, rangeStart, firstEnd, refresh);
              const receivedRange = first.range;
              total = receivedRange.total;
              if (total > YT_MAX_FILE_BYTES) {
                await first.response.body?.cancel().catch(() => {});
                return Response.json(
                  { success: false, error: "Arquivo maior que o limite permitido (3 GB)." },
                  { status: 413, headers: JSON_HEADERS },
                );
              }
              contentType = first.response.headers.get("content-type") || "";
              muxed = candidate.muxed !== false;
              body =
                receivedRange.end + 1 < total
                  ? chunkedStream(first.source, total, first.response, receivedRange, refresh)
                  : first.response.body!;
              title = title || candidate.title;
              break;
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
          const isPreview = url.searchParams.get("preview") === "1";
          const headers: Record<string, string> = ytCors({
            "Content-Type":
              contentType || (ticket.type === "audio" ? "audio/mp4" : "video/mp4"),
            "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${filename
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
