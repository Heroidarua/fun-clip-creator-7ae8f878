import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteSearch from "@/components/SiteSearch";
import ToolsIndex from "@/components/ToolsIndex";
import { ArrowUpRight } from "lucide-react";
import { buildSeo } from "@/lib/seo";
import { searchSite, POPULAR_QUERIES, SEARCH_INDEX } from "@/lib/search-index";

type BuscaSearch = { q: string };

export const Route = createFileRoute("/busca")({
  validateSearch: (search: Record<string, unknown>): BuscaSearch => ({
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
  }),
  component: BuscaPage,
  head: ({ match }) => {
    const q = (match.search as BuscaSearch)?.q ?? "";
    if (q) {
      return buildSeo({
        path: `/busca?q=${encodeURIComponent(q)}`,
        title: `Resultados para "${q}" | Busca SOS01`,
        description: `Ferramentas, jogos e guias do SOS01 relacionados a "${q}".`,
        noindex: true,
      });
    }
    return buildSeo({
      path: "/busca",
      title: "Busca — encontre ferramentas, jogos e guias | SOS01",
      description:
        "Pesquise entre todas as ferramentas gratuitas, categorias, jogos e artigos do SOS01 e vá direto para o que precisa.",
      keywords: ["buscar ferramentas online", "pesquisa sos01", "encontrar ferramenta gratuita"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Busca", path: "/busca" },
      ],
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SOS01",
          url: "https://sos01.com.br",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://sos01.com.br/busca?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
      ],
    });
  },
});

function BuscaPage() {
  const { q } = Route.useSearch();
  const results = q.trim() ? searchSite(q, 40) : [];

  return (
    <div className="min-h-screen bg-background font-orbitron">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs
          items={[
            { name: "Início", path: "/" },
            { name: "Busca", path: "/busca" },
          ]}
        />

        <h1 className="font-pixel text-lg sm:text-xl text-primary">
          {q ? `Resultados para “${q}”` : "Buscar no SOS01"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {q
            ? `${results.length} resultado(s) entre ${SEARCH_INDEX.length} páginas indexadas.`
            : `Pesquise entre ${SEARCH_INDEX.length} ferramentas, categorias, jogos e guias.`}
        </p>

        <div className="mt-6">
          <SiteSearch initialQuery={q} autoFocus />
        </div>

        {q ? (
          results.length ? (
            <ul className="mt-8 space-y-3">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    to={result.path}
                    className="group block rounded-xl border-2 border-border bg-card p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-sm font-bold text-foreground group-hover:text-primary">
                        {result.title}
                      </h2>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {result.type}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{result.description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                      sos01.com.br{result.path} <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-xl border-2 border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum resultado para “{q}”. Tente outro termo:
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {POPULAR_QUERIES.map((term) => (
                  <Link
                    key={term}
                    to="/busca"
                    search={{ q: term }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Buscas populares
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {POPULAR_QUERIES.map((term) => (
                <Link
                  key={term}
                  to="/busca"
                  search={{ q: term }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}

        <ToolsIndex title="Explore todas as páginas por categoria" />
      </main>
      <Footer />
    </div>
  );
}
