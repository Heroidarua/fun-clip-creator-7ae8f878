#!/usr/bin/env node
/**
 * Valida o sitemap.xml:
 *  - todas as URLs devem retornar HTTP 200
 *  - nenhuma URL privada/interna pode estar listada
 *  - nenhuma URL duplicada
 *
 * Uso: node scripts/validate-sitemap.mjs [baseUrl]
 * Padrao: http://localhost:8080 (dev server)
 */

const BASE = (process.argv[2] || process.env.SITEMAP_BASE || "http://localhost:8080").replace(/\/$/, "");
const PUBLIC_DOMAIN = "https://sos01.com.br";

const PRIVATE_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/auth(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/perfil(\/|$)/,
  /^\/api(\/|$)/,
  /\$/,
  /^\/sitemap\.xml$/,
];

const CONCURRENCY = 8;

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exitCode = 1;
}

async function main() {
  const res = await fetch(`${BASE}/sitemap.xml`, { headers: { "User-Agent": "sitemap-validator" } });
  if (!res.ok) {
    fail(`Nao foi possivel carregar ${BASE}/sitemap.xml (HTTP ${res.status})`);
    return;
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  if (locs.length === 0) return fail("Sitemap vazio: nenhuma <loc> encontrada.");
  console.log(`→ ${locs.length} URLs encontradas em ${BASE}/sitemap.xml`);

  // Duplicatas
  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) fail(`URL duplicada: ${loc}`);
    seen.add(loc);
  }

  // Dominio + rotas privadas
  const paths = [];
  for (const loc of locs) {
    if (!loc.startsWith(PUBLIC_DOMAIN)) fail(`URL fora do dominio oficial: ${loc}`);
    const path = loc.replace(PUBLIC_DOMAIN, "") || "/";
    if (PRIVATE_PATTERNS.some((re) => re.test(path))) fail(`URL privada/interna no sitemap: ${loc}`);
    paths.push(path);
  }

  // Status HTTP
  let index = 0;
  const results = [];
  async function worker() {
    while (index < paths.length) {
      const path = paths[index++];
      const url = `${BASE}${path}`;
      try {
        const r = await fetch(url, { redirect: "manual", headers: { "User-Agent": "sitemap-validator" } });
        results.push({ path, status: r.status });
        if (r.status !== 200) fail(`${path} → HTTP ${r.status}`);
      } catch (err) {
        results.push({ path, status: "ERRO" });
        fail(`${path} → falha de rede: ${err.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = results.filter((r) => r.status === 200).length;
  console.log(`→ ${ok}/${paths.length} URLs responderam HTTP 200`);
  if (process.exitCode) console.error("✖ Validacao do sitemap falhou.");
  else console.log("✔ Sitemap valido: todas as URLs publicas retornam 200.");
}

main().catch((e) => fail(e.message));
