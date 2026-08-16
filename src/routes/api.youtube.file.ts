import { createFileRoute } from "@tanstack/react-router";
import {
  ytCors,
  verifyTicket,
  YT_MAX_FILE_BYTES,
  YT_PROCESS_TIMEOUT_MS,
} from "@/lib/youtube-tool.server";
import { supabase } from "@/integrations/supabase/client";

const JSON_HEADERS = ytCors({ "Content-Type": "application/json" });

function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = (name || "")
    .replace(/[\\/:*?"<>|\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return cleaned || fallback;
}

const CHUNK_BYTES = 1_000_000;

function parseTotal(contentRange: string | null): number {
  const m = /\/(\d+)$/.exec(contentRange || "");
  return m ? Number(m[1]) : 0;
}

function chunkedStream(
  mediaUrl: string,
  baseHeaders: Record<string, string>,
  start: number,
  total: number,
  first: Response,
  firstEnd: number,
): ReadableStream<Uint8Array> {
  let cursor = firstEnd + 1;
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
          headers: { ...baseHeaders, Range: `bytes=${cursor}-${end}`, Referer: "https://www.youtube.com/" },
          signal: AbortSignal.timeout(YT_PROCESS_TIMEOUT_MS),
        });
        if (!res.ok || !res.body) {
          controller.error(new Error("upstream chunk failed"));
          return;
        }
        cursor = end + 1;
        current = res.body.getReader();
      }
    },
    cancel() {
      current?.cancel().catch(() => {});
    },
  });
}

export const Route = createFileRoute("/api/youtube/file")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ytCors() }),

      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token") || "";
          const jobId = url.searchParams.get("jobId");
          
          const ticket = await verifyTicket(token);
          if (!ticket) {
            if (jobId) {
              await supabase
                .from("youtube_download_jobs")
                .update({ status: 'FAILED', error_message: "Link expirado." })
                .eq("id", jobId);
            }
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

          // Se tiver jobId e for a primeira requisição (sem range), marcar como PROCESSING
          if (jobId && !clientRange) {
             await supabase
                .from("youtube_download_jobs")
                .update({ 
                  status: 'PROCESSING', 
                  progress: 10,
                  title: (ticket.title as any) // Type assertion to bypass temporary generation mismatch
                })
                .eq("id", jobId);
          }



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
                headers: { 
                  ...baseHeaders, 
                  Range: `bytes=${rangeStart}-${firstEnd}`,
                  Referer: "https://www.youtube.com/"
                },
                signal: AbortSignal.timeout(YT_PROCESS_TIMEOUT_MS),
              });
              
              if (res.ok && res.body) {
                total = parseTotal(res.headers.get("content-range")) ||
                  rangeStart + Number(res.headers.get("content-length") || 0);
                
                // BLOQUEIO DE 500 MB SOLICITADO
                const MAX_ALLOWED = 500 * 1024 * 1024;
                if (total > MAX_ALLOWED) {
                  if (jobId) {
                    await supabase
                      .from("youtube_download_jobs")
                      .update({ 
                        status: 'FAILED', 
                        error_message: "Este arquivo ultrapassa o limite máximo de 500 MB. Escolha uma qualidade menor." 
                      })
                      .eq("id", jobId);
                  }
                  return Response.json(
                    { success: false, error: "Este arquivo ultrapassa o limite máximo de 500 MB. Escolha uma qualidade menor." },
                    { status: 413, headers: JSON_HEADERS },
                  );
                }

                contentType = res.headers.get("content-type") || "";
                muxed = candidate.muxed !== false;
                body = chunkedStream(
                  mediaUrl!,
                  baseHeaders,
                  rangeStart,
                  total,
                  res,
                  Math.min(firstEnd, total - 1),
                );
                title = title || candidate.title;
                break;
              }
            } catch {
              /* tenta o próximo candidato */
            }
          }

          if (!body) {
            if (jobId) {
              await supabase
                .from("youtube_download_jobs")
                .update({ status: 'FAILED', error_message: "Não foi possível obter a stream do vídeo." })
                .eq("id", jobId);
            }
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
