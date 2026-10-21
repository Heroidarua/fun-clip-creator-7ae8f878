import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { toolPath } from "@/config/seo";

type RelatedLink = { label: string; to: string };

const DEFAULT_LINKS: RelatedLink[] = [
  { label: "Converter MP4 para MP3", to: toolPath("conversor-mp4-mp3") },
  { label: "Removedor de fundo de imagem", to: toolPath("removedor-de-fundo") },
  { label: "Gerador de QR Code", to: toolPath("gerador-qrcode") },
  { label: "Gerador de senhas fortes", to: toolPath("gerador-de-senha") },
  { label: "Tradutor automático", to: toolPath("tradutor") },
  { label: "Jogos retrô grátis", to: "/jogos" },
];

/** Bloco de links internos ("Ferramentas relacionadas") para reforço de SEO. */
export default function RelatedTools({
  title = "Ferramentas relacionadas",
  links = DEFAULT_LINKS,
}: {
  title?: string;
  links?: RelatedLink[];
}) {
  return (
    <nav aria-label={title} className="mt-10 rounded-sm border-2 border-secondary/50 bg-card/50 p-5">
      <h2 className="font-silkscreen text-xs uppercase tracking-widest text-primary">{title}</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
