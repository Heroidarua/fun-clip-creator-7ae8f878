import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { TOOL_CATEGORIES, TOOLS_SEO, toolPath, categoryPath, toolsByCategory, isPremiumTool } from "@/config/seo";

/**
 * Índice de links internos reais para todas as páginas de ferramenta,
 * agrupadas por categoria. Melhora a descoberta pelo usuário e evita
 * páginas órfãs para os buscadores.
 */
export default function ToolsIndex({
  title = "Todas as ferramentas por categoria",
  headingLevel = "h2",
}: {
  title?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <section className="mt-12 border-t border-border pt-8">
      <Heading className="font-pixel text-sm text-foreground">{title}</Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        {TOOLS_SEO.length} ferramentas gratuitas, cada uma com sua própria página, explicação de uso
        e perguntas frequentes.
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_CATEGORIES.map((category) => {
          const tools = toolsByCategory(category.id);
          if (!tools.length) return null;
          return (
            <div key={category.id}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
                <Link to={categoryPath(category.id)} className="hover:underline">
                  {category.label}
                </Link>
              </h3>
              <ul className="mt-3 space-y-1.5">
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      to={toolPath(tool.slug)}
                      className="group inline-flex items-start gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <ArrowUpRight
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        {tool.name}
                        {isPremiumTool(tool.slug) && (
                          <span className="ml-1.5 rounded-sm border border-amber-400/60 bg-amber-400/10 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-500">
                            Premium
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}