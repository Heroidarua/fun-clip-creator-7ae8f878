import { createFileRoute } from "@tanstack/react-router";
import { UPSTREAM_HEADERS, tryR2Roms } from "../lib/arcade-mirror";

/**
 * Espelho byte-a-byte do parceiro WASM Arcade.
 * O player roda num iframe same-origin (/api/arcade/page?p=...) e tudo que o
 * jogo carrega no browser (SPA, EmulatorJS, cores FinalBurn Neo, ROMs, builds
 * WASM, fontes) é resolvido para /api/arcade/mirror?p=/... e streamado daqui,
 * vindo de https://wasmarcade.com/<caminho>.
 */
const SOURCE = "https://wasmarcade.com";
const SAFE = /^\/[A-Za-z0-9._\-/%+~(),!&=@']+$/;

const HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

export const Route = createFileRoute("/api/arcade/mirror")({
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
        if (!SAFE.test(p) || p.includes("//") || p.includes("..") || p.length > 400) {
          return Response.json({ error: "Caminho inválido" }, { status: 400, headers: HEADERS });
        }

        // Onda 3: ROMs primeiro no nosso R2; parceiro so como reserva.
        const fromR2 = await tryR2Roms(p, "", request);
        if (fromR2) return fromR2;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 120_000);
        try {
          const upstream = await fetch(SOURCE + p, {
            signal: controller.signal,
            headers: { ...UPSTREAM_HEADERS },
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
