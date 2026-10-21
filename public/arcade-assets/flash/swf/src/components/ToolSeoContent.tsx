import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, FileType2 } from "lucide-react";
import { relatedToolsFor, toolPath, getCategory, categoryPath, type ToolSeo } from "@/config/seo";

/**
 * Conteúdo editorial exibido abaixo da ferramenta: explicação, passo a passo,
 * recursos, formatos, FAQ visível e links internos para ferramentas relacionadas.
 * O texto vem do catálogo central (src/config/seo.ts), específico por ferramenta.
 */
export default function ToolSeoContent({ tool }: { tool: ToolSeo }) {
  const related = relatedToolsFor(tool.slug);
  const category = getCategory(tool.category);

  return (
    <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground">
      <section>
        <h2 className="mb-3 font-pixel text-sm text-foreground">
          O que é o {tool.name}
        </h2>
        <p>{tool.intro}</p>
      </section>

      <section>
        <h2 className="mb-3 font-pixel text-sm text-foreground">Como usar</h2>
        <ol className="space-y-2">
          {tool.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm border border-primary/40 text-[10px] font-bold text-primary">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 font-pixel text-sm text-foreground">Principais recursos</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {tool.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      {tool.formats?.length ? (
        <section>
          <h2 className="mb-3 font-pixel text-sm text-foreground">Formatos compatíveis</h2>
          <ul className="flex flex-wrap gap-2">
            {tool.formats.map((format) => (
              <li
                key={format}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 text-xs text-foreground/80"
              >
                <FileType2 className="h-3 w-3" aria-hidden="true" />
                {format}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tool.faq.length ? (
        <section>
          <h2 className="mb-3 font-pixel text-sm text-foreground">Perguntas frequentes</h2>
          <div className="space-y-4">
            {tool.faq.map((item) => (
              <div key={item.question} className="rounded-sm border border-border bg-card/50 p-4">
                <h3 className="mb-1 text-sm font-semibold text-foreground">{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-pixel text-sm text-foreground">Ferramentas relacionadas</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                to={toolPath(item.slug)}
                className="group inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        {category && (
          <p className="mt-4">
            Veja todas as{" "}
            <Link to={categoryPath(category.id)} className="text-primary underline underline-offset-4">
              ferramentas de {category.label.toLowerCase()}
            </Link>{" "}
            ou volte para o{" "}
            <Link to="/ferramentas" className="text-primary underline underline-offset-4">
              catálogo completo
            </Link>
            .
          </p>
        )}
        {tool.articles?.length ? (
          <ul className="mt-4 space-y-1">
            {tool.articles.map((article) => (
              <li key={article.to}>
                <Link to={article.to} className="text-primary underline underline-offset-4">
                  {article.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}