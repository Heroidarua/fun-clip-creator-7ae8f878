import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArcadeRuffle from "@/components/ArcadeRuffle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, ExternalLink, Info, Joystick, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ARCADE_COUNTS,
  ARCADE_GAMES,
  SYSTEM_META,
  SYSTEM_ORDER,
} from "@/data/arcade";
import type { ArcadeGame, ArcadeSystem } from "@/data/arcade";

const PAGE_SIZE = 60;
const PLACEHOLDER = "/placeholder.svg";

function swfProxyPath(id: string): string {
  return "/api/arcade/proxy?p=" + encodeURIComponent("/flash/swf/" + id + ".swf");
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className="rounded-full px-4"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default function ArcadePage() {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState<ArcadeSystem | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [open, setOpen] = useState<ArcadeGame | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCADE_GAMES.filter((g) => {
      if (system !== "all" && g.system !== system) return false;
      if (!q) return true;
      if (g.title.toLowerCase().includes(q)) return true;
      return (g.tags ?? []).some((t) => t.toLowerCase().includes(q));
    });
  }, [query, system]);

  const shown = filtered.slice(0, visible);

  const pickSystem = (s: ArcadeSystem | "all") => {
    setSystem(s);
    setVisible(PAGE_SIZE);
  };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 md:pt-10">
        {/* Hero */}
        <section className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-transparent to-secondary/40 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
              <Joystick className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Arcade — {ARCADE_COUNTS.all} jogos grátis
              </h1>
              <p className="text-sm text-muted-foreground">
                Neo Geo, Capcom, Clássicos de fliperama, PC em WASM e Flash. Sem download, sem cadastro.
              </p>
            </div>
          </div>
        </section>

        {/* Busca + filtros */}
        <section className="mb-6 space-y-3">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Buscar jogo… (ex.: Street Fighter, GTA, Sonic)"
              className="pl-9"
              aria-label="Buscar jogo"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={system === "all"} onClick={() => pickSystem("all")}>
              Todos ({ARCADE_COUNTS.all})
            </Chip>
            {SYSTEM_ORDER.map((s) => (
              <Chip key={s} active={system === s} onClick={() => pickSystem(s)}>
                {SYSTEM_META[s].label} ({ARCADE_COUNTS[s]})
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando {shown.length} de {filtered.length} jogos
          </p>
        </section>

        {/* Grade */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="font-semibold">Nenhum jogo encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente outro termo ou remova os filtros.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map((g) => (
              <button
                key={g.id}
                onClick={() => setOpen(g)}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <img
                    src={g.thumb}
                    alt={g.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.dataset.fb) {
                        t.dataset.fb = "1";
                        t.src = PLACEHOLDER;
                      }
                    }}
                  />
                  <span className="absolute left-2 top-2">
                    <Badge variant="secondary" className="backdrop-blur-sm">
                      {SYSTEM_META[g.system].label}
                    </Badge>
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">{g.title}</p>
                  {(g.year || g.tags?.length) && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[g.year, g.tags?.slice(0, 2).join(", ")].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </section>
        )}

        {shown.length < filtered.length && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Mostrar mais jogos
            </Button>
          </div>
        )}

        {/* Legal */}
        <section className="mt-12 space-y-2 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4" /> Direitos autorais e retirada
          </h2>
          <p>
            Esta aba é um <strong>arquivo de fã</strong>: catalogamos e reproduzimos os jogos
            publicados pelo parceiro{" "}
            <a
              href="https://wasmarcade.com"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-foreground"
            >
              WASM Arcade
            </a>{" "}
            para que fiquem acessíveis junto com o resto da coleção do SOS01. Capas, builds e
            motores continuam hospedados no servidor deles.
          </p>
          <p>
            Todos os jogos pertencem aos seus respectivos detentores de direitos autorais. Confira{" "}
            <a
              href="https://wasmarcade.com/copyright"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-foreground"
            >
              a página de copyright do parceiro
            </a>{" "}
            ou envie pedidos de retirada para{" "}
            <a href="mailto:contact@wasmarcade.com" className="underline hover:text-foreground">
              contact@wasmarcade.com
            </a>{" "}
            ou pela nossa página{" "}
            <Link to="/dmca" className="underline hover:text-foreground">
              DMCA
            </Link>.
          </p>
        </section>
      </main>
      <Footer />

      {/* Diálogo do jogo */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>
                  {SYSTEM_META[open.system].label} • coleção parceira WASM Arcade
                </DialogDescription>
              </DialogHeader>
              {open.swf ? (
                <>
                  <ArcadeRuffle swfUrl={swfProxyPath(open.id)} />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      SWF carregado via proxy do nosso domínio (sem CORS na origem).
                    </p>
                    <Button asChild size="sm" variant="ghost">
                      <a href={open.url} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="mr-2 h-4 w-4" /> Jogar na origem
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <img
                    src={open.thumb}
                    alt={open.title}
                    className="max-h-72 w-auto rounded-lg border border-border"
                  />
                  {open.desc && <p className="text-sm text-muted-foreground">{open.desc}</p>}
                  {open.year && <p className="text-sm">Ano: {open.year}</p>}
                  <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    Os builds WASM/MAME deste sistema ainda rodam no servidor do parceiro. O modo
                    inline (100% no nosso domínio) está na fila da próxima versão.
                  </p>
                  <Button asChild>
                    <a href={open.url} target="_blank" rel="noreferrer noopener">
                      <ExternalLink className="mr-2 h-4 w-4" /> Jogar no servidor do parceiro
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
