import { createFileRoute } from "@tanstack/react-router";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function isPinimgUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;
    return /(^|\.)pinimg\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function extFromContentType(ct: string, fallback: string): string {
  if (/mp4/i.test(ct)) return "mp4";
  if (/gif/i.test(ct)) return "gif";
  if (/png/i.test(ct)) return "png";
  if (/webp/i.test(ct)) return "webp";
  if (/jpeg|jpg/i.test(ct)) return "jpg";
  return fallback;
}

export const Route = createFileRoute("/api/public/pinterest-download")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      GET: async ({ request }) => {
        const reqUrl = new URL(request.url);
        const target = reqUrl.searchParams.get("url");
        if (!target || !isPinimgUrl(target)) {
          return new Response(
            JSON.stringify({ error: "url deve ser uma mídia https://*.pinimg.com" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const range = request.headers.get("range");
        const upstream = await fetch(target, {
          headers: {
            "User-Agent": BROWSER_UA,
            Accept: "*/*",
            Referer: "https://www.pinterest.com/",
            ...(range ? { Range: range } : {}),
          },
        });

        if (!upstream.ok && upstream.status !== 206) {
          return new Response(
            JSON.stringify({ error: `Falha ao baixar (${upstream.status})` }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const contentType =
          upstream.headers.get("content-type") || "application/octet-stream";
        const ext = extFromContentType(contentType, "jpg");
        const filename = `pinterest_${Date.now()}.${ext}`;

        const headers = new Headers({
          ...corsHeaders,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
          "Accept-Ranges": upstream.headers.get("accept-ranges") || "bytes",
          "Content-Disposition": `attachment; filename="${filename}"`,
        });
        const cl = upstream.headers.get("content-length");
        const cr = upstream.headers.get("content-range");
        if (cl) headers.set("Content-Length", cl);
        if (cr) headers.set("Content-Range", cr);

        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});