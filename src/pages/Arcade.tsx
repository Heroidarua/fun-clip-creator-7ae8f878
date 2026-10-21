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
import { useEffect, useMemo, useState } from "react";
import {
  ARCADE_COUNTS,
  ARCADE_GAMES,
  SYSTEM_META,
  SYSTEM_ORDER,
} from "@/data/arcade";
import type { ArcadeGame, ArcadeSystem } from "@/data/arcade";

const PAGE_SIZE = 60;
const PLACEHOLDER = "/placeholder.svg";

// O site do parceiro bloqueia hotlink com Referer de fora (403), então as capas
// também passam pelo nosso proxy same-origin (que envia o referer deles).
const thumbUrl = (u?: string) => {
  if (!u) return "";
  if (u.startsWith("https://wasmarcade.com/")) {
    return "/api/arcade/proxy?p=" + encodeURIComponent(u.slice("https://wasmarcade.com".length));
  }
  return u;
};

function swfProxyPath(id: string): string {
  return "/api/arcade/proxy?p=" + encodeURIComponent("/flash/swf/" + id + ".swf");
}

// Página de jogo do parceiro espelhada no nosso domínio (player inline).
function pageProxySrc(g: ArcadeGame): string {
  const src = g.url ?? "";
  const path = src.startsWith("https://wasmarcade.com") ? src.slice("https://wasmarcade.com".length) : src;
  return "/api/arcade/page?p=" + encodeURIComponent(path);
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
  const [playing, setPlaying] = useState<ArcadeGame | null>(null);

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

  // fecha o player com Escape e trava o scroll da página enquanto ele abre
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlaying(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [playing]);

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
                Neo Geo, Capcom, Clássicos de fliperama, PC em WASM e Flash — jogando direto aqui
                no SOS01, sem download e sem cadastro.
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
                onClick={() => (g.swf ? setOpen(g) : setPlaying(g))}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  <img
                    src={thumbUrl(g.thumb)}
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
            motores são reproduzidos aqui no SOS01 por um espelho same-origin dos assets deles.
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

      {/* Player inline: página do jogo espelhada no nosso domínio */}
      {playing && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black"
          role="dialog"
          aria-modal="true"
          aria-label={`Jogando ${playing.title}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black px-3 py-2 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Joystick className="h-4 w-4 shrink-0 text-primary" />
              <p className="truncate text-sm font-semibold text-white">{playing.title}</p>
              <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
                {SYSTEM_META[playing.system].label}
                {playing.year ? ` • ${playing.year}` : ""}
              </Badge>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                <a href={"/api/arcade/page?p=" + encodeURIComponent(playing.url.replace(/^https?:\/\/wasmarcade\.com/, ""))} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Origem
                </a>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => setPlaying(null)}
                aria-label="Fechar jogador"
              >
                &#x2715;
              </Button>
            </div>
          </div>
          <iframe
            key={playing.id}
            src={pageProxySrc(playing)}
            title={playing.title}
            className="w-full flex-1 border-0 bg-black"
            allow="autoplay; fullscreen; gamepad; pointer-lock"
            allowFullScreen
          />
        </div>
      )}

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
                    src={thumbUrl(open.thumb)}
                    alt={open.title}
                    className="max-h-72 w-auto rounded-lg border border-border"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.dataset.fb) {
                        t.dataset.fb = "1";
                        t.src = PLACEHOLDER;
                      }
                    }}
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
