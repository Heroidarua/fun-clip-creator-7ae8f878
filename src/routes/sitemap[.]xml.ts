import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/seo";
import { PREMIUM_TOOLS } from "@/lib/premium-tools";

type Entry = { path: string; changefreq: string; priority: string };

const staticEntries: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },

  // Conteúdo principal
  { path: "/ferramentas", changefreq: "weekly", priority: "0.9" },
  { path: "/jogos", changefreq: "weekly", priority: "0.9" },
  { path: "/jogos-java", changefreq: "weekly", priority: "0.7" },
  { path: "/player", changefreq: "weekly", priority: "0.8" },
  { path: "/iptv", changefreq: "weekly", priority: "0.7" },
  { path: "/mais-sbt", changefreq: "weekly", priority: "0.7" },
  { path: "/nasa", changefreq: "monthly", priority: "0.6" },
  { path: "/dashboard", changefreq: "weekly", priority: "0.6" },

  // Institucional
  { path: "/sobre", changefreq: "monthly", priority: "0.6" },
  { path: "/como-usar", changefreq: "monthly", priority: "0.7" },
  { path: "/contato", changefreq: "monthly", priority: "0.5" },
  { path: "/precos", changefreq: "monthly", priority: "0.5" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
  { path: "/termos", changefreq: "yearly", priority: "0.3" },
  { path: "/dmca", changefreq: "yearly", priority: "0.3" },

  // Blog
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/blog/biblioteca-quadrinhos", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/como-baixar-videos-kwai", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/como-baixar-videos-tiktok-sem-marca", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/como-baixar-videos-youtube", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/como-extrair-audio-tiktok", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/como-nasceu-clipsave", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/como-usar-downloaders", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/dicas-criadores-conteudo", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/ferramentas-gratuitas", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/guia-completo-clipsave", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/jogos-retro-gratis", changefreq: "monthly", priority: "0.7" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Ferramentas premium entram automaticamente ao serem cadastradas.
        const toolEntries: Entry[] = PREMIUM_TOOLS.filter((tool) => tool.status === "ready").map(
          (tool) => ({ path: `/ferramenta/${tool.slug}`, changefreq: "monthly", priority: "0.6" }),
        );

        const urls = [...staticEntries, ...toolEntries]
          .map(
            (entry) => `
  <url>
    <loc>${SITE.url}${entry.path}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
          )
          .join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
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
