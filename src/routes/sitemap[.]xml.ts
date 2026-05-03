import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://fun-clip-creator.lovable.app";

const routes = [
  "/",
  "/sobre",
  "/contato",
  "/ferramentas",
  "/jogos",
  "/jogos-java",
  "/hub",
  "/como-usar",
  "/blog",
  "/blog/biblioteca-quadrinhos",
  "/blog/como-baixar-videos-kwai",
  "/blog/como-baixar-videos-tiktok-sem-marca",
  "/blog/como-baixar-videos-youtube",
  "/blog/como-extrair-audio-tiktok",
  "/blog/como-nasceu-clipsave",
  "/blog/como-usar-downloaders",
  "/blog/dicas-criadores-conteudo",
  "/blog/ferramentas-gratuitas",
  "/blog/guia-completo-clipsave",
  "/blog/jogos-retro-gratis",
  "/termos",
  "/privacidade",
  "/dmca",
];

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