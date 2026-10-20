import { createFileRoute } from "@tanstack/react-router";
import { rewriteArcadeHtml } from "@/lib/arcade-html";

const SOURCE = "https://wasmarcade.com";
const HEADERS = { "Access-Control-Allow-Origin": "*" };

export const Route = createFileRoute("/api/arcade/page")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: HEADERS }),
      GET: async ({ request }) => {
        let p = "";
        try {
          p = decodeURIComponent(new URL(request.url).searchParams.get("p") ?? "");
        } catch {
          p = "";
        }
        if (!/^\/[A-Za-z0-9._\-/]+$/.test(p) || p.includes("//") || p.length > 400) {
          return Response.json({ error: "Caminho inválido" }, { status: 400, headers: HEADERS });
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 90_000);
        try {
          const upstream = await fetch(SOURCE + p, {
            signal: controller.signal,
            headers: { accept: "text/html,*/*", referer: SOURCE + "/" },
          });

          if (!upstream.ok) {
            const text = await upstream.text().catch(() => "");
            return new Response(text, {
              status: upstream.status,
              headers: { ...HEADERS, "Cache-Control": "no-store" },
            });
          }

          const html = await upstream.text();
          const nonce = crypto.randomUUID().replaceAll("-", "");
          return new Response(rewriteArcadeHtml(html, p, nonce), {
            status: 200,
            headers: {
              ...HEADERS,
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-cache",
              "X-Mirror-Source": SOURCE,
              "X-Arcade-Nonce": nonce,
              "X-Frame-Options": "SAMEORIGIN",
            },
          });
        } catch (error) {
          const reason = error instanceof Error && error.name === "AbortError" ? "timeout" : "erro";
          return new Response(`Falha ao espelhar ${SOURCE}${p}: ${reason}`, {
            status: 502,
            headers: HEADERS,
          });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
