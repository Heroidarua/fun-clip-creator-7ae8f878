import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://sos01.com.br";

// Rotas públicas do SOS01
const routes: string[] = [
  "/",

  // Institucional
  "/sobre",
  "/como-usar",
  "/contato",
  "/privacidade",
  "/termos",
  "/dmca",
  "/precos",

  // Conteúdo
  "/ferramentas",
  "/jogos",
  "/jogos-java",

  // Blog
  "/blog",
  "/blog/biblioteca-quadrinhos",
  "/blog/como-baixar-videos-kwai",
  "/blog/como-baixar-videos-tiktok-sem-marca",
  "/blog/como-baixar-videos-youtube",
  "/blog/como-extrair-audio-tiktok",
  "/blog/como-nasceu-sos01",
  "/blog/como-usar-downloaders",
  "/blog/dicas-criadores-conteudo",
  "/blog/ferramentas-gratuitas",
  "/blog/guia-completo-sos01",
  "/blog/jogos-retro-gratis",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().split("T")[0];

        const urls = routes
          .map((path) => {
            const priority = path === "/" ? "1.0" : "0.8";
            const changefreq = path === "/" ? "daily" : "weekly";

            return `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
          })
          .join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
