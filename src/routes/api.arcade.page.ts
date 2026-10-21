import { createFileRoute } from "@tanstack/react-router";
import { UPSTREAM_UA } from "../lib/arcade-mirror";

/**
 * Página de jogo do parceiro servida no nosso domínio para o player inline.
 * Baixa o HTML de https://wasmarcade.com/<p> e:
 *  - remove qualquer CSP embutida no HTML deles (a nossa já controla o documento);
 *  - troca origens absolutas ("https://wasmarcade.com/..." e "//wasmarcade.com/...") pelo espelho;
 *  - reescreve atributos src/href/content raiz-absolutos ("/assets/...", "/emulation/...") para o espelho;
 *  - injeta um script que redireciona fetch/XHR/src criados em runtime para o espelho
 *    e desativa o service worker do parceiro (que tentaria registrar no nosso domínio).
 * Dentro do iframe tudo fica same-origin: sem X-Frame-Options na frente, sem hotlink 403.
 */
const SOURCE = "https://wasmarcade.com";
const MIRROR = "/wasm-mirror";

const HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

const INJECT = `
<script>
(function () {
  var S = "https://wasmarcade.com";
  var P = "//wasmarcade.com";
  var M = "/wasm-mirror";
  function encPath(u) {
    return M + u.split("/").map(encodeURIComponent).join("/");
  }
  function rw(u) {
    if (typeof u !== "string" || !u.length) return u;
    if (u.indexOf(M) === 0) return u;
    if (u.indexOf(S) === 0) return encPath(u.slice(S.length));
    if (u.indexOf(P) === 0) return encPath(u.slice(P.length));
    if (u.charAt(0) === "/") return encPath(u);
    if (u.charAt(0) !== "#" && u.indexOf(":") < 0) return encPath("/" + u);
    return u;
  }
  var _fetch = window.fetch ? window.fetch.bind(window) : null;
  if (_fetch) {
    window.fetch = function (input, init) {
      try {
        if (typeof input === "string") input = rw(input);
        else if (input && typeof input === "object" && typeof input.url === "string") {
          var nu = rw(input.url);
          if (nu !== input.url) { try { input = new Request(nu, input); } catch (e) {} }
        }
      } catch (e) {}
      return _fetch(input, init);
    };
  }
  try {
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u) {
      try { arguments[1] = rw(u); } catch (e) {}
      return _open.apply(this, arguments);
    };
    var _sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (n, v) {
      try { if ((n === "src" || n === "href") && typeof v === "string") v = rw(v); } catch (e) {}
      return _sa.call(this, n, v);
    };
    var types = ["HTMLScriptElement","HTMLLinkElement","HTMLImageElement","HTMLSourceElement","HTMLAudioElement","HTMLVideoElement"];
    for (var i = 0; i < types.length; i++) {
      var proto = window[types[i]];
      if (!proto) continue;
      var props = types[i] === "HTMLLinkElement" ? ["href"] : ["src"];
      for (var j = 0; j < props.length; j++) {
        (function (name) {
          var d = Object.getOwnPropertyDescriptor(proto, name);
          if (!d || !d.set || !d.configurable) return;
          Object.defineProperty(proto, name, {
            configurable: true, enumerable: true,
            get: function () { return d.get.call(this); },
            set: function (v) { try { d.set.call(this, rw(v)); } catch (e) {} }
          });
        })(props[j]);
      }
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register = function () {
        return Promise.reject(new Error("service worker desativado no espelho"));
      };
    }
  } catch (e) {}
})();
</script>
`;

function esc(p: string): string {
  // codifica segmento por segmento para preservar as barras do caminho
  return MIRROR + p.split("/").map(encodeURIComponent).join("/");
}

function rewrite(html: string): string {
  let out = html.replace(
    /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    "",
  );

  // origens absolutas entre aspas: "https://wasmarcade.com/x" ou "//wasmarcade.com/x"
  out = out.replace(/"(?:https?:)?\/\/wasmarcade\.com[^"]*"/g, (m: string) => {
    const inner = m.slice(1, -1);
    const rest = inner.replace(/^(?:https?:)?\/\/wasmarcade\.com/i, "");
    return '"' + esc(rest.startsWith("/") ? rest : "/" + rest) + '"';
  });

  // atributos raiz-absolutos: src="/assets/index.js", href="/emulation/...", content="/og/x.jpg"
  // (o guard evita re-embalar valores já reescritos pela regra de origem)
  out = out.replace(
    /((?:src|href|content|poster)\s*=\s*)"(\/[^"]*)"/gi,
    (_m: string, a: string, v: string) =>
      v.startsWith(MIRROR) ? _m : a + '"' + esc(v) + '"',
  );

  // srcset/imageSrcSet: cada URL da lista é reescrita individualmente
  out = out.replace(/(srcset|imagesrcset)\s*=\s*"([^"]*)"/gi, (_m: string, a: string, v: string) => {
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    const remapped = parts.map((s) => {
      const bits = s.split(/\s+/);
      const url = bits[0];
      if (!url || url.startsWith(MIRROR) || url.startsWith("data:")) return s;
      return esc(url.startsWith("/") ? url : "/" + url) + (bits.length > 1 ? " " + bits.slice(1).join(" ") : "");
    });
    return a + '="' + remapped.join(", ") + '"';
  });

  // atributos relativos do bundle Vite: src="assets/chunk.js"
  out = out.replace(
    /((?:src|href)\s*=\s*)"((?:assets|fonts|img|media)\/[A-Za-z0-9._\-/]+)"/gi,
    (_m: string, a: string, v: string) => a + '"' + esc("/" + v) + '"',
  );

  // injeta o patch logo após a abertura de <head>
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, (_m: string, attrs: string) => `<head${attrs}>\n${INJECT}`);
  } else {
    out = INJECT + out;
  }

  return out;
}

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
            headers: { accept: "text/html,*/*", referer: SOURCE + "/", "user-agent": UPSTREAM_UA },
          });

          if (!upstream.ok) {
            const text = await upstream.text().catch(() => "");
            return new Response(text, {
              status: upstream.status,
              headers: { ...HEADERS, "Cache-Control": "no-store" },
            });
          }

          const html = await upstream.text();
          return new Response(rewrite(html), {
            status: 200,
            headers: {
              ...HEADERS,
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-cache",
              "X-Mirror-Source": SOURCE,
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
