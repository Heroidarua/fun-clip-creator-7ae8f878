import { useMemo, useState } from "react";
import { Book, ExternalLink, Filter, ShieldCheck } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import batmanGif from "@/assets/batman-walking.gif";
import supermanGif from "@/assets/superman-pixel.gif";

type Category = "Todos" | "HQ" | "Mangá" | "Domínio Público" | "Indie";

type Source = {
  name: string;
  url: string;
  category: Exclude<Category, "Todos">;
  emoji: string;
  tagline: string;
  description: string;
  highlight?: string;
};

const SOURCES: Source[] = [
  {
    name: "MANGA Plus",
    url: "https://mangaplus.shueisha.co.jp/",
    category: "Mangá",
    emoji: "🎌",
    tagline: "Shueisha oficial",
    description: "One Piece, Jujutsu Kaisen, MHA, Chainsaw Man — capítulos oficiais grátis.",
    highlight: "OFICIAL",
  },
  {
    name: "Viz Shonen Jump",
    url: "https://www.viz.com/shonenjump",
    category: "Mangá",
    emoji: "📕",
    tagline: "Jump em inglês",
    description: "Capítulo mais recente + 3 primeiros de cada série, grátis e oficial.",
    highlight: "OFICIAL",
  },
  {
    name: "Webtoons",
    url: "https://www.webtoons.com/",
    category: "HQ",
    emoji: "📱",
    tagline: "Webcomics coreanos",
    description: "Milhares de séries originais em PT-BR, atualizações semanais.",
    highlight: "PT-BR",
  },
  {
    name: "Tapas",
    url: "https://tapas.io/",
    category: "Indie",
    emoji: "🎨",
    tagline: "HQs independentes",
    description: "Catálogo enorme de webcomics indie em inglês, leitura grátis.",
  },
  {
    name: "GlobalComix",
    url: "https://globalcomix.com/",
    category: "Indie",
    emoji: "🌎",
    tagline: "Biblioteca global",
    description: "Editoras indie + clássicos liberados gratuitamente.",
  },
  {
    name: "Marvel Comics",
    url: "https://www.marvel.com/comics/discover/443/free-digital-comics",
    category: "HQ",
    emoji: "🦸",
    tagline: "Free Digital Comics",
    description: "Seleção rotativa de HQs Marvel grátis para ler online.",
    highlight: "OFICIAL",
  },
  {
    name: "DC Universe Infinite",
    url: "https://www.dc.com/comics",
    category: "HQ",
    emoji: "🦇",
    tagline: "DC oficial",
    description: "Edições selecionadas grátis + catálogo de personagens.",
    highlight: "OFICIAL",
  },
  {
    name: "Internet Archive Comics",
    url: "https://archive.org/details/comics",
    category: "Domínio Público",
    emoji: "🏛️",
    tagline: "Golden Age",
    description: "Action Comics, Detective Comics e clássicos pré-1964. Download liberado.",
    highlight: "LEGAL",
  },
  {
    name: "Digital Comic Museum",
    url: "https://digitalcomicmuseum.com/",
    category: "Domínio Público",
    emoji: "📜",
    tagline: "CBR/CBZ grátis",
    description: "Milhares de HQs em domínio público para download direto.",
    highlight: "LEGAL",
  },
];

const CATEGORIES: Category[] = ["Todos", "HQ", "Mangá", "Domínio Público", "Indie"];

const ComicsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todos");

  const filtered = useMemo(
    () => (selectedCategory === "Todos" ? SOURCES : SOURCES.filter((s) => s.category === selectedCategory)),
    [selectedCategory],
  );

  return (
    <section className="relative py-12 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="relative text-center mb-8">
            <img
              src={batmanGif}
              alt="Animação pixelada do Batman caminhando, ícone de quadrinhos clássicos da DC" loading="lazy" decoding="async"
              className="absolute left-0 sm:left-6 -top-4 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]"
              style={{ imageRendering: "pixelated" }}
            />
            <img
              src={supermanGif}
              alt="Animação pixelada do Superman em voo, representando mangás e HQs na SOS01" loading="lazy" decoding="async"
              className="absolute right-0 sm:right-6 -top-4 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_10px_rgba(0,100,255,0.5)]"
              style={{ imageRendering: "pixelated" }}
            />
            <h2 className="font-pixel text-lg sm:text-xl md:text-2xl text-primary neon-text mb-2">
              📚 CENTRAL DE QUADRINHOS
            </h2>
            <p className="font-pixel text-[8px] sm:text-[10px] text-muted-foreground max-w-xl mx-auto">
              SERVIÇOS OFICIAIS E LEGAIS COM LEITURA GRATUITA
            </p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary/10 border border-primary/40 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="font-pixel text-[8px] sm:text-[10px] text-primary">
                100% LEGAL · SEM CADASTRO NA SOS/01
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Filtros */}
        <ScrollReveal>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-primary mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[10px] border-2 rounded transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(40,182,255,0.5)]"
                    : "bg-background text-muted-foreground border-primary/30 hover:border-primary hover:text-primary"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid de fontes */}
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((src) => (
              <a
                key={src.name}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col p-4 bg-background border-2 border-primary/30 hover:border-primary rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(40,182,255,0.3)]"
              >
                {src.highlight && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 bg-primary text-primary-foreground font-pixel text-[7px] sm:text-[8px] rounded">
                    {src.highlight}
                  </span>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl sm:text-4xl">{src.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-pixel text-[10px] sm:text-xs text-primary group-hover:neon-text truncate">
                      {src.name}
                    </h3>
                    <p className="font-pixel text-[7px] sm:text-[8px] text-muted-foreground mt-1">
                      {src.tagline}
                    </p>
                  </div>
                </div>

                <p className="font-inter text-xs sm:text-sm text-foreground/80 leading-relaxed flex-1">
                  {src.description}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/20">
                  <span className="font-pixel text-[7px] sm:text-[8px] text-accent">
                    {src.category.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 font-pixel text-[8px] sm:text-[10px] text-primary group-hover:translate-x-1 transition-transform">
                    ABRIR
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </ScrollReveal>

        {/* Aviso legal */}
        <ScrollReveal>
          <div className="mt-8 max-w-3xl mx-auto p-4 bg-background/60 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Book className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                A SOS/01 apenas indica plataformas oficiais e gratuitas mantidas por terceiros
                (Shueisha, Viz, Marvel, DC, Internet Archive, Webtoons, Tapas, GlobalComix, Digital
                Comic Museum). Não hospedamos nem distribuímos conteúdo protegido por direitos
                autorais. Cada link abre o site oficial em uma nova aba.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ComicsSection;
