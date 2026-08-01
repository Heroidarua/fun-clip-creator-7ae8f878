import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

type RelatedLink = { label: string; to: string };

const DEFAULT_LINKS: RelatedLink[] = [
  { label: "Downloader de TikTok", to: "/" },
  { label: "Downloader de Instagram", to: "/" },
  { label: "Downloader de YouTube", to: "/" },
  { label: "Converter MP4 para MP3", to: "/ferramentas" },
  { label: "Gerador de QR Code", to: "/ferramentas" },
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
