export default function ToolStatusBadge({ premium = false, soon = false }: { premium?: boolean; soon?: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-sm border border-border bg-card px-2 py-1 text-[10px] font-bold text-foreground">
      {soon ? "Em breve" : premium ? "Premium · grátis" : "Grátis"}
    </span>
  );
}