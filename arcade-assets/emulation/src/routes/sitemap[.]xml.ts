import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { INDEXABLE_TOOL_SLUGS } from "@/lib/tools-registry";
import { TOOL_CATEGORIES, SITE_CONFIG } from "@/config/seo";

const BASE_URL = SITE_CONFIG.url;

// Rotas nao indexaveis (privadas, internas, erro)
const EXCLUDED = new Set(["/admin", "/auth", "/dashboard", "/perfil", "/not-found"]);

/** Converte nomes de arquivo de rota em caminhos publicos, automaticamente. */
function discoverRoutePaths(): string[] {
  const files = Object.keys(import.meta.glob("./**/*.tsx"));
  const paths = new Set<string>();

  for (const file of files) {
    const name = file.replace(/^\.\//, "").replace(/\.tsx$/, "");
    if (name === "__root" || name.startsWith("api.") || name.includes("$")) continue;

    let path = "/" + name.split(".").join("/");
    // Segmentos com sufixo "_" (rotas nao aninhadas) nao aparecem na URL final
    path = path.replace(/_(?=\/)/g, "");
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
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

        const routePaths = discoverRoutePaths();
        const toolPaths = INDEXABLE_TOOL_SLUGS.map((slug) => `/ferramenta/${slug}`);
        const categoryPaths = TOOL_CATEGORIES.map((c) => `/categoria/${c.id}`);

        const all = [...new Set([...routePaths, ...toolPaths, ...categoryPaths])].sort((a, b) =>
          a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b),
        );

        // Prioridade e frequência por tipo de página.
        const meta = (p: string): { priority: string; changefreq: string } => {
          if (p === "/") return { priority: "1.0", changefreq: "daily" };
          if (p === "/ferramentas" || p === "/jogos") return { priority: "0.9", changefreq: "weekly" };
          if (p.startsWith("/ferramenta/")) return { priority: "0.8", changefreq: "weekly" };
          if (p.startsWith("/blog")) return { priority: "0.7", changefreq: "monthly" };
          return { priority: "0.6", changefreq: "monthly" };
        };

        const urls = all.map((p) => {
          const { priority, changefreq } = meta(p);
          return [
            `  <url>`,
            `    <loc>${baseUrl}${p === "/" ? "/" : p}</loc>`,
            `    <changefreq>${changefreq}</changefreq>`,
            `    <priority>${priority}</priority>`,
            `  </url>`,
          ].join("\n");
        });

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
