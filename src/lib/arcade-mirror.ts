import { notFound } from "@tanstack/react-router";
import { localCandidates } from "./arcade-local";

/**
 * Espelho em caminho real do parceiro WASM Arcade.
 * Cada prefixo espelhado (ex.: /wasm-mirror, /games, /revc) faz um GET nosso
 * servir o mesmo caminho em wasmarcade.com, em streaming. O caminho real
 * (em vez de ?p=) faz os imports relativos dos módulos e os assets injetados
 * em runtime (scripts do motor, WASM, dados, fontes) resolverem corretamente.
 */
export const MIRROR_SOURCE = "https://wasmarcade.com";

// O edge do parceiro filtra o tráfego do nosso worker (pedidos "de máquina"
// chegam como 403/404 nalguns paths). Todos os espelhos saem com o conjunto
// completo de cabeçalhos de um browser desktop. identity = sem compressão,
// então o body pode passar direto para frente sem decodificar.
export const UPSTREAM_HEADERS: Record<string, string> = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "*/*",
  "accept-encoding": "identity",
  "accept-language": "en-US,en;q=0.9",
  referer: MIRROR_SOURCE + "/",
  "sec-fetch-dest": "script",
  "sec-fetch-mode": "no-cors",
  "sec-fetch-site": "cross-site",
};

// Prefixos que o motor dos jogos pede em runtime com caminho absoluto.
export const MIRROR_PREFIXES = [
  "/wasm-mirror",
  "/games",
  "/gta3sky",
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

// Aceita caracteres válidos de path de URL, inclusive % (segmentos codificados
// pelo espelho, ex.: espaços/acentos viram %20). ".." segue bloqueado abaixo.
const SAFE = /^\/[A-Za-z0-9._\-/%+~(),!&=@']+$/;

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

// Onda 3: as ROMs moram no nosso bucket R2 (Cloudflare). Servimos daqui
// primeiro; o parceiro vira reserva cega se faltar algo no bucket.
export const R2_ROMS_BASE = "https://sos01-roms.523b77a14a08cedb4c6136a7f27ed57e.r2.dev";

/** Tenta servir /emulation/roms/* do nosso R2 (suporta Range). Null = nao tem la. */
export async function tryR2Roms(p: string, search: string, request: Request): Promise<Response | null> {
  if (!p.startsWith("/emulation/roms/")) return null;
  try {
    const h: Record<string, string> = { ...UPSTREAM_HEADERS };
    const range = request.headers.get("range");
    if (range) h["range"] = range;
    const r2 = await fetch(R2_ROMS_BASE + p + search, { headers: h });
    if (r2.status !== 200 && r2.status !== 206) return null;
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "X-Arcade-Source": "r2",
      "Cache-Control": "public, max-age=2592000, immutable",
    };
    const ct = r2.headers.get("content-type");
    if (ct) headers["Content-Type"] = ct;
    for (const hh of ["content-range", "accept-ranges"] as const) {
      const v = r2.headers.get(hh);
      if (v) headers[hh] = v;
    }
    const cl = r2.headers.get("content-length");
    if (cl && r2.status === 200) headers["Content-Length"] = cl;
    return new Response(r2.body, { status: r2.status, headers });
  } catch {
    return null; // R2 fora do ar -> cai no parceiro
  }
}

/** Monta o handler GET de uma rota espelho para o prefixo informado. */
export function streamMirror(prefix: string) {
  return async ({ request }: { request: Request }) => {
    const u = new URL(request.url);
    // Só o /wasm-mirror é um prefixo artificial: ele sai do caminho antes de
    // pedir à origem. Os demais prefixos (/assets, /games, /flash...) fazem
    // parte do caminho real no parceiro e precisam ser mantidos.
    let p = prefix === "/wasm-mirror" ? u.pathname.slice(prefix.length) : u.pathname;
    try {
      p = decodeURIComponent(p);
    } catch {
      // mantém bruto se não for encoded
    }
    if (p === "" || p === "/") p = "/";
    if (!SAFE.test(p) || p.includes("//") || p.includes("..") || p.length > 400) {
      return Response.json({ error: "Caminho inválido" }, { status: 400, headers: CORS });
    }

    // Onda 1: o que ja tem na despensa local sai daqui, sem tocar na origem.
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

    // Onda 3: ROMs primeiro no nosso R2; parceiro so como reserva.
    const fromR2 = await tryR2Roms(p, u.search, request);
    if (fromR2) return fromR2;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 300_000);
    try {
      const upHeaders: Record<string, string> = { ...UPSTREAM_HEADERS };
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
