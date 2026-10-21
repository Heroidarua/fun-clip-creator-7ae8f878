import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, ArrowRight } from "lucide-react";
import { searchSite, POPULAR_QUERIES } from "@/lib/search-index";

/**
 * Campo de busca interna com sugestões instantâneas.
 * Ao enviar, navega para /busca?q=... (resultados renderizados no servidor).
 */
export default function SiteSearch({
  initialQuery = "",
  autoFocus = false,
  placeholder = "Buscar ferramentas, jogos e guias…",
  className = "",
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => searchSite(query, 6), [query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const submit = (value: string) => {
    const term = value.trim();
    if (!term) return;
    setOpen(false);
    navigate({ to: "/busca", search: { q: term } });
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-2 focus-within:border-primary transition-colors"
      >
        <Search className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="site-search" className="sr-only">
          Buscar no SOS01
        </label>
        <input
          id="site-search"
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          maxLength={80}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Limpar busca"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Buscar
        </button>
      </form>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border-2 border-border bg-card p-2 shadow-xl">
          {query.trim().length > 1 ? (
            suggestions.length ? (
              <ul className="space-y-1">
                {suggestions.map((result) => (
                  <li key={result.id}>
                    <Link
                      to={result.path}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {result.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {result.description}
                        </span>
                      </div>
                      <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {result.type}
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => submit(query)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-muted"
                  >
                    Ver todos os resultados <ArrowRight className="w-3 h-3" />
                  </button>
                </li>
              </ul>
            ) : (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                Nada encontrado para “{query}”.
              </p>
            )
          ) : (
            <div className="px-2 py-2">
              <p className="px-1 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                Buscas populares
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_QUERIES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => submit(term)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
