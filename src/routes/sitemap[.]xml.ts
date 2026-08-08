import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PREMIUM_TOOLS } from "@/lib/premium-tools";

const BASE_URL = "https://sos01.com.br";

// Rotas nao indexaveis (privadas, internas, erro)
const EXCLUDED = new Set(["/admin", "/auth", "/dashboard", "/perfil"]);

/** Converte nomes de arquivo de rota em caminhos publicos, automaticamente. */
function discoverRoutePaths(): string[] {
  const files = Object.keys(import.meta.glob("./**/*.tsx"));
  const paths = new Set<string>();

  for (const file of files) {
    const name = file.replace(/^\.\//, "").replace(/\.tsx$/, "");
    if (name === "__root" || name.startsWith("api.") || name.includes("$")) continue;

    let path = "/" + name.split(".").join("/");
    path = path.replace(/\/index$/, "");
    if (path === "") path = "/";
    if (EXCLUDED.has(path)) continue;

    // Ignora rotas de layout puro (ex.: /blog quando existe /blog/index)
    paths.add(path);
  }

  // /blog e layout + index: ambos resolvem para /blog, o Set ja remove duplicatas
  return [...paths];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const routePaths = discoverRoutePaths();
        const toolPaths = PREMIUM_TOOLS.filter((t) => t.status === "ready").map(
          (t) => `/ferramenta/${t.slug}`,
        );

        const all = [...new Set([...routePaths, ...toolPaths])].sort((a, b) =>
          a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b),
        );

        const urls = all.map(
          (p) => `  <url>\n    <loc>${BASE_URL}${p === "/" ? "/" : p}</loc>\n  </url>`,
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=UTF-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
