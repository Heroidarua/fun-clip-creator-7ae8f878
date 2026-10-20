import { createFileRoute } from "@tanstack/react-router";

/**
 * Espelho em caminho real do parceiro WASM Arcade.
 * /wasm-mirror/assets/index.js -> https://wasmarcade.com/assets/index.js
 * Usar caminho real (em vez de ?p=) faz os imports relativos dos chunks
 * ("./PlayerBar-x.js") resolvessem corretamente a partir da URL do modulo.
 */
const SOURCE = "https://wasmarcade.com";
const SAFE = /^\/[A-Za-z0-9._\-/]+$/;

const HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

export const Route = createFileRoute("/wasm-mirror/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: HEADERS }),
      GET: async ({ params }) => {
        // @ts-ignore - splat param is typed by the route path
        let p: string = params.$ ?? "";
        try {
          p = decodeURIComponent(p);
        } catch {
          // mantém bruto se não for encoded
        }
        if (p && !p.startsWith("/")) p = "/" + p; // o splat não traz a barra inicial
        if (!SAFE.test(p) || p.includes("//") || p.length > 400) {
          return Response.json({ error: "Caminho inválido" }, { status: 400, headers: HEADERS });
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 120_000);
        try {
          const upstream = await fetch(SOURCE + p, {
            signal: controller.signal,
            headers: { accept: "*/*", referer: SOURCE + "/" },
          });

          const headers: Record<string, string> = {
            ...HEADERS,
            "X-Mirror-Source": SOURCE,
            "Cache-Control": upstream.ok ? "public, max-age=604800" : "no-store",
          };
          const ct = upstream.headers.get("content-type");
          if (ct) headers["Content-Type"] = ct;
          const cl = upstream.headers.get("content-length");
          if (cl && upstream.ok) headers["Content-Length"] = cl;

          return new Response(upstream.ok ? upstream.body : null, {
            status: upstream.status,
            headers,
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
