import { createFileRoute } from "@tanstack/react-router";
import { PREMIUM_TOOLS } from "@/lib/premium-tools";

type Entry = {
  path: string;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: string;
};

const SITE_URL = "https://sos01.com.br";

const staticEntries: Entry[] = [
  // Página inicial
  {
    path: "/",
    changefreq: "daily",
    priority: "1.0",
  },

  // Conteúdo principal
  {
    path: "/ferramentas",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/jogos",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/jogos-java",
    changefreq: "weekly",
    priority: "0.7",
  },
  {
    path: "/player",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/iptv",
    changefreq: "weekly",
    priority: "0.7",
  },
  {
    path: "/mais-sbt",
    changefreq: "weekly",
    priority: "0.7",
  },
  {
    path: "/nasa",
    changefreq: "monthly",
    priority: "0.6",
  },

  // Institucional
  {
    path: "/sobre",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/como-usar",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/contato",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/precos",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/privacidade",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/termos",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/dmca",
    changefreq: "yearly",
    priority: "0.3",
  },

  // Blog
  {
    path: "/blog",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/blog/biblioteca-quadrinhos",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/como-baixar-videos-kwai",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/como-baixar-videos-tiktok-sem-marca",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/como-baixar-videos-youtube",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/como-extrair-audio-tiktok",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/como-nasceu-clipsave",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/blog/como-usar-downloaders",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/dicas-criadores-conteudo",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/ferramentas-gratuitas",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/guia-completo-clipsave",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/blog/jogos-retro-gratis",
    changefreq: "monthly",
    priority: "0.7",
  },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }

  return path;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Adiciona automaticamente as ferramentas premium
        // que estejam prontas para uso.
        const toolEntries: Entry[] = PREMIUM_TOOLS
          .filter((tool) => tool.status === "ready")
          .map((tool) => ({
            path: `/ferramenta/${tool.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          }));

        // Remove possíveis duplicatas.
        const allEntries = [...staticEntries, ...toolEntries];

        const uniqueEntries = Array.from(
          new Map(
            allEntries.map((entry) => [
              normalizePath(entry.path),
              {
                ...entry,
                path: normalizePath(entry.path),
              },
            ]),
          ).values(),
        );

        const lastmod = new Date().toISOString().split("T")[0];

        const urls = uniqueEntries
          .map((entry) => {
            const loc = `${SITE_URL}${entry.path}`;

            return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
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
```
