import { createFileRoute } from "@tanstack/react-router";
import { UPSTREAM_HEADERS } from "../lib/arcade-mirror";
import { localCandidates } from "../lib/arcade-local";

/**
 * Proxy same-origin para assets do parceiro WASM Arcade (wasmarcade.com).
 * O site deles não envia CORS, então os .swf passam por aqui para o
 * Ruffle conseguir carregá-los dentro do nosso domínio.
 * Aceita apenas caminhos de asset estático: /flash/, /emulation/, /covers/, /og/.
 */
const SOURCE = "https://wasmarcade.com";
const SAFE_PATH = /^\/(?:flash|emulation|covers|og)\/[A-Za-z0-9./_-]+$/;

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

export const Route = createFileRoute("/api/arcade/proxy")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams.get("p") ?? "";
        if (!SAFE_PATH.test(p) || p.includes("//")) {
          return Response.json({ error: "Caminho inválido" }, { status: 400, headers: CORS });
        }

        // Onda 1: despensa local primeiro; origem so se nao estiver aqui.
        for (const cand of localCandidates(p)) {
          try {
            const local = await fetch(new URL(cand, request.url));
            if (local.ok) {
              const lh: Record<string, string> = {
                ...CORS,
                "X-Arcade-Source": "local",
                "Cache-Control": "public, max-age=604800",
              };
              const lct = local.headers.get("content-type");
              if (lct) lh["Content-Type"] = lct;
              return new Response(local.body, { status: 200, headers: lh });
            }
          } catch {
            /* sem static interno -> segue para a origem */
          }
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 90_000);
        try {
          const upstream = await fetch(SOURCE + p, {
            signal: controller.signal,
            headers: { ...UPSTREAM_HEADERS },
          });

          if (!upstream.ok) {
            const text = await upstream.text().catch(() => "");
            return new Response(text, {
              status: upstream.status,
              headers: { ...CORS, "Cache-Control": "no-store" },
            });
          }

          const body = new Uint8Array(await upstream.arrayBuffer());
          return new Response(body, {
            status: 200,
            headers: {
              ...CORS,
              "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
              "Cache-Control": "public, max-age=604800",
              "X-Proxy-Source": SOURCE,
            },
          });
        } catch (error) {
          const reason = error instanceof Error && error.name === "AbortError" ? "timeout" : "erro";
          return new Response(`Falha ao buscar em ${SOURCE}: ${reason}`, {
            status: 502,
            headers: { ...CORS, "Cache-Control": "no-store" },
          });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
