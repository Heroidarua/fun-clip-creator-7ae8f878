#!/usr/bin/env node
/**
 * Validacao de build do public/sitemap.xml.
 *
 * 1) Sempre: verifica se o arquivo existe e se o XML e bem-formado
 *    (declaracao, urlset com namespace, tags balanceadas, <loc> validos,
 *     sem duplicatas, sem caracteres nao escapados).
 * 2) Opcional: se SITEMAP_CHECK_URL (ou 1o argumento) estiver definido,
 *    faz um HEAD/GET no ambiente de deploy e exige HTTP 200 + content-type XML.
 *
 * Uso:
 *   node scripts/check-sitemap.mjs
 *   node scripts/check-sitemap.mjs https://sos01.com.br
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const FILE = resolve(process.cwd(), "public/sitemap.xml");
const errors = [];
const fail = (m) => errors.push(m);

function parseWellFormed(xml) {
  // Declaracao XML
  if (!/^\uFEFF?<\?xml\s+version="1\.0"\s+encoding="UTF-8"\s*\?>/.test(xml)) {
    fail('Falta a declaracao <?xml version="1.0" encoding="UTF-8"?> na primeira linha.');
  }
  // Namespace do urlset
  if (!/<urlset[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(xml)) {
    fail('<urlset> sem o namespace xmlns="http://www.sitemaps.org/schemas/sitemap/0.9".');
  }
  // Tags balanceadas (parser minimalista com pilha)
  const stack = [];
  const tagRe = /<\/?([A-Za-z_][\w.:-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(xml)) !== null) {
    const raw = m[0];
    const name = m[1];
    const selfClosing = m[3] === "/";
    if (raw.startsWith("</")) {
      const open = stack.pop();
      if (open !== name) fail(`Tag mal fechada: esperado </${open ?? "?"}> mas veio </${name}>.`);
    } else if (!selfClosing) {
      stack.push(name);
    }
  }
  if (stack.length) fail(`Tags nao fechadas: ${stack.join(", ")}.`);

  // Remove tags/declaracoes e checa & solto no texto
  const text = xml.replace(/<[^>]*>/g, "");
  const badAmp = text.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9A-Fa-f]+);)/g);
  if (badAmp) fail(`Caractere "&" nao escapado encontrado ${badAmp.length}x (use &amp;).`);
  if (/<(?![?!\/A-Za-z])/.test(xml)) fail('Caractere "<" nao escapado no conteudo (use &lt;).');
}

function validateEntries(xml) {
  const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  if (urlBlocks.length === 0) return fail("Sitemap vazio: nenhum bloco <url> encontrado.");

  const seen = new Set();
  for (const [, block] of urlBlocks) {
    const loc = block.match(/<loc>([^<]*)<\/loc>/)?.[1]?.trim();
    if (!loc) {
      fail("Bloco <url> sem <loc>.");
      continue;
    }
    let parsed;
    try {
      parsed = new URL(loc);
    } catch {
      fail(`<loc> nao e uma URL absoluta valida: ${loc}`);
      continue;
    }
    if (!/^https?:$/.test(parsed.protocol)) fail(`<loc> com protocolo invalido: ${loc}`);
    if (seen.has(loc)) fail(`URL duplicada no sitemap: ${loc}`);
    seen.add(loc);

    const lastmod = block.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]?.trim();
    if (lastmod && Number.isNaN(Date.parse(lastmod))) fail(`<lastmod> invalido (${lastmod}) em ${loc}`);

    const priority = block.match(/<priority>([^<]*)<\/priority>/)?.[1]?.trim();
    if (priority && !(Number(priority) >= 0 && Number(priority) <= 1)) {
      fail(`<priority> fora do intervalo 0.0-1.0 (${priority}) em ${loc}`);
    }

    const changefreq = block.match(/<changefreq>([^<]*)<\/changefreq>/)?.[1]?.trim();
    const valid = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (changefreq && !valid.includes(changefreq)) fail(`<changefreq> invalido (${changefreq}) em ${loc}`);
  }
  return urlBlocks.length;
}

async function checkHttp(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, "")}/sitemap.xml`;
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "follow" });
    }
    if (res.status !== 200) {
      fail(`${url} respondeu HTTP ${res.status} (esperado 200).`);
      return;
    }
    const type = res.headers.get("content-type") || "";
    if (!/xml/i.test(type)) fail(`${url} respondeu 200 mas com content-type "${type}" (esperado XML).`);
    else console.log(`✔ ${url} → HTTP 200 (${type})`);
  } catch (err) {
    fail(`Nao foi possivel acessar ${url}: ${err.message}`);
  }
}

async function main() {
  if (!existsSync(FILE)) {
    fail("public/sitemap.xml nao encontrado. Rode `npm run generate:sitemap` antes do build.");
  } else {
    const xml = readFileSync(FILE, "utf8");
    parseWellFormed(xml);
    const count = validateEntries(xml);
    if (count) console.log(`✔ public/sitemap.xml bem-formado com ${count} URLs.`);
  }

  const target = process.argv[2] || process.env.SITEMAP_CHECK_URL;
  if (target) await checkHttp(target);
  else console.log("ℹ Verificacao HTTP ignorada (defina SITEMAP_CHECK_URL para ativar).");

  if (errors.length) {
    console.error(`\n✖ Validacao do sitemap falhou (${errors.length} erro(s)):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("\n✅ Sitemap validado com sucesso.");
}

main();
