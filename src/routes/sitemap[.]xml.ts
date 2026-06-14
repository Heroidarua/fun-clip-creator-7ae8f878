import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://fun-clip-creator.lovable.app";

// Privadas/internas que NÃO devem aparecer no sitemap
const EXCLUDE = new Set(["/admin", "/auth", "/perfil", "/hub"]);
const EXCLUDE_PREFIXES = ["/api/", "/api."];

function discoverRoutes(): string[] {
  // Vite faz a varredura no build — qualquer arquivo novo em src/routes/ entra automaticamente
  // Only page routes — exclude API routes, generated/internal files, and the sitemap itself.
  // Excluding api.* avoids Rollup warnings about dynamic+static imports of the same module.
  const files = import.meta.glob(
    [
      "/src/routes/**/*.{ts,tsx}",
      "!/src/routes/api.*",
      "!/src/routes/api/**",
      "!/src/routes/__*",
      "!/src/routes/sitemap*",
    ],
    { eager: false },
  );

  const paths = new Set<string>(["/"]);

  for (const filePath of Object.keys(files)) {
    // Ex: /src/routes/blog.como-usar-downloaders.tsx
    let name = filePath
      .replace("/src/routes/", "")
      .replace(/\.(ts|tsx)$/, "");

    // Ignora arquivos especiais
    if (
      name.startsWith("__") ||
      name.startsWith("_") ||
      name.endsWith(".lazy") ||
      name.includes("[.]") || // ex: sitemap[.]xml
      name === "index"
    ) {
      if (name === "index") paths.add("/");
      continue;
    }

    // Convenção flat: pontos viram barras (blog.foo -> blog/foo)
    // Remove sufixo .index (blog.index -> blog)
    name = name.replace(/\.index$/, "");
    const route = "/" + name.replace(/\./g, "/");

    if (EXCLUDE.has(route)) continue;
    if (EXCLUDE_PREFIXES.some((p) => route.startsWith(p))) continue;
    // Pula rotas dinâmicas ($param, $)
    if (route.includes("$")) continue;

    paths.add(route);
  }

  return Array.from(paths).sort();
}

const routes = discoverRoutes();

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().split("T")[0];
        const urls = routes
          .map(
            (path) =>
              `  <url><loc>${BASE_URL}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${path === "/" ? "daily" : "weekly"}</changefreq><priority>${path === "/" ? "1.0" : "0.7"}</priority></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});