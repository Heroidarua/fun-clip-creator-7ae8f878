const SOURCE = "https://wasmarcade.com";
const MIRROR = "/wasm-mirror";

const INJECT = `
<script>
(function () {
  var S = "https://wasmarcade.com";
  var P = "//wasmarcade.com";
  var M = "/wasm-mirror";
  function rw(u) {
    if (typeof u !== "string" || !u.length) return u;
    if (u.charAt(0) === "#") return u;
    try {
      var url = new URL(u, location.href);
      if (url.origin !== S && url.origin !== location.origin) return u;
      if (url.pathname.indexOf(M + "/") === 0) return url.pathname + url.search + url.hash;
      return M + url.pathname + url.search + url.hash;
    } catch (e) { return u; }
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
  const url = new URL(p, SOURCE);
  return MIRROR + url.pathname + url.search + url.hash;
}

export function rewriteArcadeHtml(html: string, path: string, nonce: string): string {
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

  out = out.replace(/<script\b[^>]*static\.cloudflareinsights\.com[^>]*>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<(script|style)\b([^>]*)>/gi, (_match, tag: string, attrs: string) =>
    `<${tag}${attrs.replace(/\snonce\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")} nonce="${nonce}">`,
  );
  const locationScript = `<script nonce="${nonce}">history.replaceState(null,"",${JSON.stringify(path).replaceAll("<", "\\u003c")});</script>`;
  return out.replace(/<head[^>]*>/i, (head) => head + locationScript);
}

