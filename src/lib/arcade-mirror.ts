import { notFound } from "@tanstack/react-router";

/**
 * Espelho em caminho real do parceiro WASM Arcade.
 * Cada prefixo espelhado (ex.: /wasm-mirror, /games, /revc) faz um GET nosso
 * servir o mesmo caminho em wasmarcade.com, em streaming. O caminho real
 * (em vez de ?p=) faz os imports relativos dos módulos e os assets injetados
 * em runtime (scripts do motor, WASM, dados, fontes) resolverem corretamente.
 */
export const MIRROR_SOURCE = "https://wasmarcade.com";

// Prefixos que o motor dos jogos pede em runtime com caminho absoluto.
export const MIRROR_PREFIXES = [
  "/wasm-mirror",
  "/games",
  "/revc",
  "/vc-data",
  "/vc-assets",
  "/emulation",
  "/flash",
  "/pc",
  "/covers",
  "/og",
  "/assets",
] as const;

const SAFE = /^\/[A-Za-z0-9._\-/]+$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
};

// CSS do parceiro aponta para /assets/fonte.woff2 (absoluto). Como o CSS chega
// em /wasm-mirror/assets/..., reescreve para o espelho — senão a fonte cai num
// caminho que não existe aqui.
function rewriteCss(css: string): string {
  return css.replace(/url\(\s*("|')?(\/[^"')]+)\1\s*\)/g, (m, q: string, path: string) =>
    path.startsWith("/wasm-mirror/") ? m : `url(${q}/wasm-mirror${path})`,
  );
}

/** Monta o handler GET de uma rota espelho para o prefixo informado. */
export function streamMirror(prefix: string) {
  return async ({ request }: { request: Request }) => {
    const u = new URL(request.url);
    const idx = u.pathname.indexOf(prefix);
    let p = idx >= 0 ? u.pathname.slice(idx + prefix.length) : "";
    try {
      p = decodeURIComponent(p);
    } catch {
      // mantém bruto se não for encoded
    }
    if (p && !p.startsWith("/")) p = "/" + p;
    if (!SAFE.test(p) || p.includes("//") || p.length > 400) {
      return Response.json({ error: "Caminho inválido" }, { status: 400, headers: CORS });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 300_000);
    try {
      const upHeaders: Record<string, string> = { accept: "*/*", referer: MIRROR_SOURCE + "/" };
      const range = request.headers.get("range");
      if (range) upHeaders["range"] = range;

      const upstream = await fetch(MIRROR_SOURCE + p + u.search, {
        signal: controller.signal,
        headers: upHeaders,
      });

      const headers: Record<string, string> = {
        ...CORS,
        "X-Mirror-Source": MIRROR_SOURCE,
        "Cache-Control": upstream.ok
          ? p.includes("/revc/") || p.includes("/vc-data/")
            ? "public, max-age=2592000, immutable"
            : "public, max-age=604800"
          : "no-store",
      };
      const ct = upstream.headers.get("content-type");
      if (ct) headers["Content-Type"] = ct;
      for (const h of ["content-range", "accept-ranges"] as const) {
        const v = upstream.headers.get(h);
        if (v) headers[h] = v;
      }

      // CSS: pequeno e transformado (urls absolutas -> espelho); sem length fixo.
      if (upstream.ok && ct && ct.toLowerCase().includes("text/css")) {
        const css = await upstream.text();
        return new Response(rewriteCss(css), { status: 200, headers });
      }

      if (upstream.ok) {
        const cl = upstream.headers.get("content-length");
        if (cl && upstream.status === 200) headers["Content-Length"] = cl;
      }

      return new Response(upstream.ok ? upstream.body : null, {
        status: upstream.status,
        headers,
      });
    } catch (error) {
      const reason = error instanceof Error && error.name === "AbortError" ? "timeout" : "erro";
      return new Response(`Falha ao espelhar ${MIRROR_SOURCE}${p}: ${reason}`, {
        status: 502,
        headers: CORS,
      });
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * GET de fallback (rota raiz $): caminhos espelhados viram proxy;
 * qualquer outro caminho não encontrado vira 404 de verdade (notFound()).
 */
export function mirrorFallbackGet({ request }: { request: Request }) {
  const pathname = new URL(request.url).pathname;
  const hits = MIRROR_PREFIXES.filter((pre) => pathname === pre || pathname.startsWith(pre + "/"));
  if (hits.length > 0) {
    const prefix = hits.sort((a, b) => b.length - a.length)[0];
    return streamMirror(prefix)({ request });
  }
  throw notFound();
}
