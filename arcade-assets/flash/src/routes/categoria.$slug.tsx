import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ArrowUpRight, Crown } from "lucide-react";
import ToolsIndex from "@/components/ToolsIndex";
import { buildSeo, absoluteUrl } from "@/lib/seo";
import {
  TOOL_CATEGORIES,
  getCategory,
  toolsByCategory,
  toolPath,
  categoryPath,
  isPremiumTool,
  PREMIUM_TOOLS_SEO,
  type ToolCategoryId,
} from "@/config/seo";

export const Route = createFileRoute("/categoria/$slug")({
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="font-pixel text-foreground">Categoria não encontrada</p>
    </div>
  ),
  head: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) return {};
    return buildSeo({
      path: categoryPath(category.id),
      title: `${category.title} | SOS01`,
      description: category.description,
      keywords: [category.label.toLowerCase(), `ferramentas de ${category.label.toLowerCase()}`],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Ferramentas", path: "/ferramentas" },
        { name: category.label, path: categoryPath(category.id) },
      ],
      schema: [
        {
          "@type": "ItemList",
          name: category.title,
          itemListElement: toolsByCategory(category.id as ToolCategoryId).map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: absoluteUrl(toolPath(tool.slug)),
          })),
        },
      ],
    });
  },
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = getCategory(slug);
  if (!category) throw notFound();
  const tools = toolsByCategory(category.id as ToolCategoryId);

  return (
    <div className="min-h-screen bg-background font-orbitron">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs
          items={[
            { name: "Início", path: "/" },
            { name: "Ferramentas", path: "/ferramentas" },
            { name: category.label, path: categoryPath(category.id) },
          ]}
        />

        <h1 className="font-pixel text-lg sm:text-xl text-primary">{category.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>

        <h2 className="mt-8 mb-4 font-pixel text-sm text-foreground">
          Ferramentas desta categoria
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                to={toolPath(tool.slug)}
                className="group block h-full rounded-sm border-2 border-border bg-card p-4 transition-colors hover:border-primary/60"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {tool.name}
                  {isPremiumTool(tool.slug) && (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-500">
                      <Crown className="h-3 w-3" aria-hidden="true" /> Premium
                    </span>
                  )}
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">{tool.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 mb-4 font-pixel text-sm text-foreground">
          Ferramentas premium em destaque
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PREMIUM_TOOLS_SEO.filter((t) => t.slug !== undefined)
            .slice(0, 6)
            .map((tool) => (
              <li key={tool.slug}>
                <Link
                  to={toolPath(tool.slug)}
                  className="group flex items-start gap-2 rounded-sm border border-amber-400/40 bg-amber-400/5 p-3 text-sm text-foreground transition-colors hover:border-amber-400"
                >
                  <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">{tool.name}</strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {tool.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
        </ul>

        <h2 className="mt-10 mb-4 font-pixel text-sm text-foreground">Outras categorias</h2>
        <ul className="flex flex-wrap gap-2">
          {TOOL_CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
            <li key={c.id}>
              <Link
                to={categoryPath(c.id)}
                className="inline-block rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>

        <ToolsIndex title="Todas as ferramentas do SOS01" />
      </main>
      <Footer />
    </div>
  );
}