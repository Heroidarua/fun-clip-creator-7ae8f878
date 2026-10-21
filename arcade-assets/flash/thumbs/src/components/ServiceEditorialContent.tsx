import { Link } from "@tanstack/react-router";
import Breadcrumbs from "@/components/Breadcrumbs";

type EditorialLink = {
  label: string;
  to: string;
};

type ServiceEditorialContentProps = {
  title: string;
  paragraphs: string[];
  links: EditorialLink[];
  currentPath: string;
  currentLabel: string;
};

export default function ServiceEditorialContent({
  title,
  paragraphs,
  links,
  currentPath,
  currentLabel,
}: ServiceEditorialContentProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 text-foreground">
      <Breadcrumbs items={[{ name: "Início", path: "/" }, { name: currentLabel, path: currentPath }]} />
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <nav aria-label="Conteúdo relacionado" className="mt-6">
        <h3 className="mb-3 font-semibold">Explore também</h3>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="text-primary underline underline-offset-4">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}