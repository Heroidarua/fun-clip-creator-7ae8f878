import { createFileRoute } from "@tanstack/react-router";
import { igCors, verifyTicket, IG_PROCESS_TIMEOUT_MS } from "@/lib/instagram-tool.server";
import { isSafeProxyUrl } from "@/lib/proxy-url-guard";

const JSON_HEADERS = igCors({ "Content-Type": "application/json" });

function sanitizeFilename(name: string, fallback: string): string {
  return (name || "")
    .replace(/[\\/:*?"<>|\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100) || fallback;
}

export const Route = createFileRoute("/api/instagram/file")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: igCors() }),

      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token") || "";
          const ticket = await verifyTicket(token);

          if (!ticket) {
            return Response.json(
              { success: false, error: "Link expirado ou inválido." },
              { status: 410, headers: JSON_HEADERS },
            );
          }

          const targetUrl = ticket.videoId; // No caso do IG, guardamos a URL no campo videoId do ticket
          if (!isSafeProxyUrl(targetUrl)) {
            return Response.json(
              { success: false, error: "URL de mídia não permitida." },
              { status: 403, headers: JSON_HEADERS },
            );
          }

          const mediaType = ticket.type === "video" ? "video" : "image"; // Mapeia de volta o tipo do ticket para o IG proxy
          const range = request.headers.get("range");
          const response = await fetch(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": "https://www.instagram.com/",
              ...(range ? { Range: range } : {}),
            },
            signal: AbortSignal.timeout(IG_PROCESS_TIMEOUT_MS),
          });

          if (!response.ok) throw new Error(`Upstream status ${response.status}`);

          const ext = mediaType === "video" ? "mp4" : "jpg";
          const filename = `${sanitizeFilename(ticket.title, "instagram")}.${ext}`;
          
          const headers = new Headers({
            "Access-Control-Allow-Origin": "*",
            "Content-Type": response.headers.get("content-type") || (mediaType === "video" ? "video/mp4" : "image/jpeg"),
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            "Cache-Control": "public, max-age=31536000",
            "Accept-Ranges": "bytes",
          });

          if (response.headers.has("content-length")) headers.set("Content-Length", response.headers.get("content-length")!);
          if (response.headers.has("content-range")) headers.set("Content-Range", response.headers.get("content-range")!);

          return new Response(response.body, { status: response.status, headers });
        } catch (error) {
          console.error("instagram/file error:", error);
          return Response.json(
            { success: false, error: "Erro ao transmitir arquivo." },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
