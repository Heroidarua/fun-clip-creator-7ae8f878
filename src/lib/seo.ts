/**
 * SEOManager — gerador central de metadados do SOS01 com suporte multilíngue.
 * Usado por todas as rotas via `head: () => buildSeo({ ... })`.
 */

export const SITE = {
  name: "SOS01",
  url: "https://sos01.com.br",
  locales: ["pt", "en", "es", "fr", "de", "it", "ja", "ru", "tr", "hi"],
  defaultLocale: "pt",
  twitter: "@sos01",
  defaultImage:
    "https://storage.googleapis.com/gpt-engineer-file-uploads/W9nvJ5xZlFOuhB2wUyS0coPiyM22/social-images/social-1782694696983-1000953354.webp",
  defaultKeywords: [
    "sos01",
    "sos01.com.br",
    "sos01 player",
    "sos01 iptv",
    "sos01 youtube download",
    "sos01 baixar videos",
    "baixar vídeos",
    "downloader online",
    "ferramentas gratuitas",
    "jogos retrô online",
    "remover metadados sos01",
    "limpar exif online",
    "metadata remover sos01",
  ],
} as const;

export type SeoCrumb = { name: string; path: string };
export type SeoFaq = { question: string; answer: string };

export type SeoInput = {
  /** Caminho absoluto da página, ex.: "/ferramentas" */
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  /** website | article | video.other | product ... */
  type?: string;
  noindex?: boolean;
  breadcrumb?: SeoCrumb[];
  faq?: SeoFaq[];
  /** Schema.org extra (Article, SoftwareApplication, VideoObject...) */
  schema?: Record<string, unknown>[];
  article?: { publishedTime?: string; modifiedTime?: string; section?: string };
};

type MetaTag = Record<string, string>;
type LinkTag = Record<string, string>;
type ScriptTag = Record<string, string>;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Gera trilha de navegação a partir do caminho quando não informada. */
export function autoBreadcrumb(path: string): SeoCrumb[] {
  const segments = path.split("/").filter(Boolean);
  const crumbs: SeoCrumb[] = [{ name: "Início", path: "/" }];
  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    crumbs.push({ name: titleCase(segment), path: acc });
  }
  return crumbs;
}

export function buildSeo(input: SeoInput): {
  meta: MetaTag[];
  links: LinkTag[];
  scripts: ScriptTag[];
} {
  const url = absoluteUrl(input.path);
  const image = input.image ? absoluteUrl(input.image) : SITE.defaultImage;
  const type = input.type ?? "website";
  const keywords = [...(input.keywords ?? []), ...SITE.defaultKeywords];
  const robots = input.noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  // Language detection for meta tags (default to pt)
  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('i18nextLng') || 'pt').split('-')[0] : 'pt';

  const meta: MetaTag[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { name: "keywords", content: Array.from(new Set(keywords)).join(", ") },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { name: "author", content: SITE.name },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: currentLang === 'pt' ? 'pt_BR' : currentLang },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: input.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE.twitter },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: image },
  ];

  if (input.article?.publishedTime) {
    meta.push({ property: "article:published_time", content: input.article.publishedTime });
  }
  if (input.article?.modifiedTime) {
    meta.push({ property: "article:modified_time", content: input.article.modifiedTime });
  }
  if (input.article?.section) {
    meta.push({ property: "article:section", content: input.article.section });
  }

  const links: LinkTag[] = input.noindex ? [] : [{ rel: "canonical", href: url }];

  // Add hreflang tags for all supported languages
  if (!input.noindex) {
    SITE.locales.forEach(lang => {
      links.push({
        rel: "alternate",
        hreflang: lang === 'pt' ? 'pt-BR' : lang,
        href: `${SITE.url}/${lang}${input.path === '/' ? '' : input.path}`
      });
    });
    // Add x-default
    links.push({
      rel: "alternate",
      hreflang: "x-default",
      href: `${SITE.url}${input.path === '/' ? '' : input.path}`
    });
  }

  const graphs: Record<string, unknown>[] = [];

  const crumbs = input.breadcrumb ?? autoBreadcrumb(input.path);
  if (crumbs.length > 1) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    });
  }

  if (input.faq?.length) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: input.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  for (const extra of input.schema ?? []) {
    graphs.push({ "@context": "https://schema.org", ...extra });
  }

  const scripts: ScriptTag[] = graphs.map((graph) => ({
    type: "application/ld+json",
    children: JSON.stringify(graph),
  }));

  return { meta, links, scripts };
}

/** Atalho para páginas de artigo/blog. */
export function buildArticleSeo(
  input: SeoInput & { publishedTime?: string },
): ReturnType<typeof buildSeo> {
  return buildSeo({
    ...input,
    type: "article",
    schema: [
      {
        "@type": "Article",
        headline: input.title,
        description: input.description,
        image: input.image ? absoluteUrl(input.image) : SITE.defaultImage,
        datePublished: input.publishedTime,
        author: { "@type": "Organization", name: SITE.name },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          logo: { "@type": "ImageObject", url: `${SITE.url}/favicon.png` },
        },
        mainEntityOfPage: absoluteUrl(input.path),
      },
      ...(input.schema ?? []),
    ],
  });
}

/** Atalho para páginas de ferramenta (SoftwareApplication). */
export function buildToolSeo(
  input: SeoInput & { toolName?: string },
): ReturnType<typeof buildSeo> {
  return buildSeo({
    ...input,
    schema: [
      {
        "@type": "SoftwareApplication",
        name: input.toolName ?? input.title,
        description: input.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: absoluteUrl(input.path),
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      },
      ...(input.schema ?? []),
    ],
  });
}
