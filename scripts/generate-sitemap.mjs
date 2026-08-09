#!/usr/bin/env node
/**
 * Gera public/sitemap.xml a partir das rotas e ferramentas atuais.
 * Executado automaticamente antes de cada build/deploy.
 *
 * Uso: node scripts/generate-sitemap.mjs [baseUrl]
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASE_URL = (process.argv[2] || process.env.SITE_URL || "https://sos01.com.br").replace(/\/$/, "");

const EXCLUDED = new Set(["/admin", "/auth", "/dashboard", "/perfil", "/not-found"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** Descobre caminhos publicos a partir dos arquivos em src/routes. */
function discoverRoutePaths() {
  const routesDir = join(ROOT, "src/routes");
  const paths = new Set();

  for (const file of walk(routesDir)) {
    if (!file.endsWith(".tsx")) continue;
    const name = relative(routesDir, file).replace(/\\/g, "/").replace(/\.tsx$/, "");
    if (name === "__root" || name.startsWith("api.") || name.startsWith("api/")) continue;
    if (name.includes("$") || name.includes("[")) continue;

    let path = "/" + name.split(/[./]/).join("/");
    path = path.replace(/\/index$/, "");
    if (path === "") path = "/";
    if (EXCLUDED.has(path)) continue;

    paths.add(path);
  }

  return [...paths];
}

/** Extrai slugs prontos ("ready") dos registros de ferramentas. */
function readySlugsFrom(relPath) {
  const src = readFileSync(join(ROOT, relPath), "utf8");
  const chunks = src.split(/\bslug:\s*"/).slice(1);
  const slugs = [];

  for (const chunk of chunks) {
    const slug = chunk.slice(0, chunk.indexOf('"'));
    if (!slug) continue;
    const body = chunk.split(/\bslug:\s*"/)[0];
    const status = body.match(/\bstatus:\s*"(ready|soon)"/);
    if (status && status[1] !== "ready") continue;
    slugs.push(slug);
  }

  return slugs;
}

function categoryIds() {
  const src = readFileSync(join(ROOT, "src/config/seo.ts"), "utf8");
  const block = src.slice(src.indexOf("export const TOOL_CATEGORIES"));
  const end = block.indexOf("\n];");
  return [...block.slice(0, end).matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

const toolSlugs = [
  ...new Set([
    ...readySlugsFrom("src/lib/tools-registry.tsx"),
    ...readySlugsFrom("src/lib/premium-tools.tsx"),
  ]),
];

const all = [
  ...new Set([
    ...discoverRoutePaths(),
    ...toolSlugs.map((s) => `/ferramenta/${s}`),
    ...categoryIds().map((id) => `/categoria/${id}`),
  ]),
].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...all.map((p) => `  <url>\n    <loc>${BASE_URL}${p}</loc>\n  </url>`),
  "</urlset>",
  "",
].join("\n");

writeFileSync(join(ROOT, "public/sitemap.xml"), xml, "utf8");
console.log(`✔ public/sitemap.xml gerado com ${all.length} URLs (${BASE_URL})`);
