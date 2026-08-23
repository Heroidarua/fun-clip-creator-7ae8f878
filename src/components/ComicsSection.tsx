import { useEffect, useMemo, useState, useRef } from "react";
import { Search, ShieldCheck, X, Swords, Trophy, RotateCcw, Download, Loader2, Share2, Maximize, Minimize, ZoomIn, Eye, EyeOff, Palette } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { toPng, toJpeg } from 'html-to-image';
import download from 'downloadjs';
import { toast } from "sonner";

const API_URL = "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json";
const PAGE_SIZE = 24;

type Hero = {
  id: number;
  name: string;
  slug: string;
  powerstats: Record<string, number>;
  appearance: { gender?: string; race?: string | null; height?: string[]; weight?: string[] };
  biography: {
    fullName?: string;
    publisher?: string | null;
    alignment?: string;
    aliases?: string[];
    firstAppearance?: string;
    placeOfBirth?: string;
  };
  work?: { occupation?: string; base?: string };
  connections?: { groupAffiliation?: string; relatives?: string };
  images?: { xs: string; sm: string; md: string; lg: string };
};

const PUBLISHERS = [
  { value: "all", label: "TODAS" },
  { value: "Marvel Comics", label: "MARVEL" },
  { value: "DC Comics", label: "DC" },
  { value: "Dark Horse Comics", label: "DARK HORSE" },
  { value: "Image Comics", label: "IMAGE" },
];

const ALIGNMENTS = [
  { value: "all", label: "TODOS" },
  { value: "good", label: "HERÓIS" },
  { value: "bad", label: "VILÕES" },
  { value: "neutral", label: "NEUTROS" },
];

const STAT_LABELS: Record<string, string> = {
  intelligence: "Inteligência",
  strength: "Força",
  speed: "Velocidade",
  durability: "Resistência",
  power: "Poder",
  combat: "Combate",
};

const TRANSLATIONS: Record<string, string> = {
  // Genders
  Male: "Masculino",
  Female: "Feminino",
  // Races
  Human: "Humano",
  "Mutant": "Mutante",
  "Radiation": "Radiação",
  "Cyborg": "Cyborg",
  "Android": "Androide",
  "Alien": "Alienígena",
  "Inhuman": "Inumano",
  "God / Eternal": "Deus / Eterno",
  "New God": "Novo Deus",
  "Asgardian": "Asgardiano",
  "Kryptonian": "Kriptoniano",
  "Atlantean": "Atlante",
  "Symbiote": "Simbionte",
  "Vampire": "Vampiro",
  "Zombie": "Zumbi",
  "Metahuman": "Meta-humano",
  "Demon": "Demônio",
  "Angel": "Anjo",
  // Alignments
  good: "Herói",
  bad: "Vilão",
  neutral: "Neutro",
};

const DUEL_THEMES = [
  { id: 'retro', label: 'RETRO', class: 'theme-retro' },
  { id: 'modern', label: 'MODERN', class: 'theme-modern' },
  { id: 'comic', label: 'COMIC', class: 'theme-comic' },
  { id: 'cyberpunk', label: 'CYBER', class: 'theme-cyberpunk' },
];

const t = (text?: string | null) => {
  if (!text) return "—";
  if (text === "-" || text.toLowerCase() === "n/a") return "—";

  // Mapeamento manual para termos comuns
  const commonTranslations: Record<string, string> = {
    "No relatives": "Sem parentes",
    "Formerly": "Anteriormente",
    "active": "ativo",
    "unknown": "desconhecido",
  };

  let translated = TRANSLATIONS[text] || text;

  // Se ainda estiver em inglês e for uma lista ou frase curta
  if (translated === text) {
    Object.entries(commonTranslations).forEach(([eng, pt]) => {
      translated = translated.replace(new RegExp(eng, "gi"), pt);
    });
  }

  return translated;
};

// Hook para tradução via IA (opcional, mas vamos usar um mapeamento mais robusto)
const translateText = (text?: string | null) => {
  if (!text || text === "-" || text.toLowerCase() === "n/a") return "—";
  
  // Como o volume de dados é grande e dinâmico da API, 
  // vamos focar em traduzir os campos principais e deixar os detalhes técnicos.
  // Para ocupação e grupos, faremos um mapeamento dos termos mais frequentes.
  
  const terms: Record<string, string> = {
    "Journalist": "Jornalista",
    "Reporter": "Repórter",
    "Student": "Estudante",
    "Adventurer": "Aventureiro",
    "Hero": "Herói",
    "Criminal": "Criminoso",
    "Assassin": "Assassino",
    "Mercenary": "Mercenário",
    "Soldier": "Soldado",
    "Scientist": "Cientista",
    "Doctor": "Médico",
    "Billionaire": "Bilionário",
    "Inventor": "Inventor",
    "King": "Rei",
    "Queen": "Rainha",
    "Prince": "Príncipe",
    "Princess": "Princesa",
    "God": "Deus",
    "Goddess": "Deusa",
    "Warrior": "Guerreiro",
    "Vigilante": "Vigilante",
    "Mutant": "Mutante",
    "Alien": "Alienígena",
    "Detective": "Detetive",
    "Police Officer": "Policial",
    "Lawyer": "Advogado",
    "Leader": "Líder",
    "Member of": "Membro de",
    "Founding member": "Membro fundador",
    "Justice League": "Liga da Justiça",
    "Avengers": "Vingadores",
    "X-Men": "X-Men",
    "Fantastic Four": "Quarteto Fantástico",
    "Suicide Squad": "Esquadrão Suicida",
    "Teen Titans": "Jovens Titãs",
    "Defenders": "Defensores",
    "Inhumans": "Inumanos",
    "Guardians of the Galaxy": "Guardiões da Galáxia",
    "Sinister Six": "Sexteto Sinistro",
    "Brotherhood of Mutants": "Irmandade de Mutantes",
    "Hydra": "Hidra",
    "S.H.I.E.L.D.": "S.H.I.E.L.D.",
    "A.I.M.": "I.D.E.I.A.",
    "B.P.R.D.": "B.P.R.D.",
    "Daily Planet": "Planeta Diário",
    "Stark Industries": "Indústrias Stark",
    "Wayne Enterprises": "Empresas Wayne",
    "Gotham City": "Cidade de Gotham",
    "Metropolis": "Metrópolis",
    "New York": "Nova York",
    "Earth": "Terra",
    "Mars": "Marte",
    "Space": "Espaço",
    "Professional": "Profissional",
    "Freelance": "Autônomo",
    "Pilot": "Piloto",
    "Photographer": "Fotógrafo",
    "None": "Nenhum",
    "Unknown": "Desconhecido",
  };

  let result = text;
  Object.entries(terms).forEach(([eng, pt]) => {
    // Substitui palavras inteiras para evitar erros
    const regex = new RegExp(`\\b${eng}\\b`, "gi");
    result = result.replace(regex, pt);
  });

  return result;
};

const publisherClass = (pub?: string | null) => {
  if (!pub) return "text-muted-foreground";
  if (pub.includes("Marvel")) return "text-[#ec1d24]";
  if (pub.includes("DC")) return "text-[#0476f2]";
  return "text-accent";
};

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='200' height='300' fill='%23161b22'/%3E%3C/svg%3E";

const ComicsSection = () => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [publisher, setPublisher] = useState("all");
  const [alignment, setAlignment] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Hero | null>(null);
  const [duelMode, setDuelMode] = useState(false);
  const [duelFighters, setDuelFighters] = useState<[Hero | null, Hero | null]>([null, null]);
  const [showDuelResult, setShowDuelResult] = useState(false);
  const [isGeneratingClip, setIsGeneratingClip] = useState(false);
  const [clipFormat, setClipFormat] = useState<"png" | "jpg">("png");
  const [clipScale, setClipScale] = useState(2);
  const [clipFit, setClipFit] = useState<"contain" | "cover" | "zoom">("contain");
  const [clipTheme, setClipTheme] = useState<"retro" | "modern" | "comic" | "cyberpunk">("retro");
  const [showGuides, setShowGuides] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("sos01.com.br");
  const [watermarkPos, setWatermarkPos] = useState<"bottom" | "top" | "center">("bottom");
  const [watermarkOpacity, setWatermarkOpacity] = useState(60);
  const [fighterPositions, setFighterPositions] = useState<[{x: number, y: number}, {x: number, y: number}]>([{x: 0, y: 0}, {x: 0, y: 0}]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap implementation
  useEffect(() => {
    if (showDuelResult && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          setShowDuelResult(false);
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [showDuelResult]);

  useEffect(() => {
    if (showDuelResult) {
      const updateSize = () => {
        const el = document.getElementById('duel-combat-result');
        if (el) {
          const rect = el.getBoundingClientRect();
          setDimensions({
            width: Math.round(rect.width * clipScale),
            height: Math.round(rect.height * clipScale)
          });
        }
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [showDuelResult, clipScale, clipFit, clipTheme]);

  const generateClipData = async () => {
    const element = document.getElementById('duel-combat-result');
    if (!element) return null;

    try {
      setIsGeneratingClip(true);
      
      // Ocultar os botões temporariamente para a captura
      const actionButtons = element.querySelector('.clip-action-buttons');
      const closeButton = element.querySelector('.clip-close-button');
      const configSection = element.querySelector('.clip-config-section');
      const guides = element.querySelector('.clip-guides');
      const watermark = element.querySelector('.clip-watermark');
      
      if (actionButtons) (actionButtons as HTMLElement).style.display = 'none';
      if (closeButton) (closeButton as HTMLElement).style.display = 'none';
      if (configSection) (configSection as HTMLElement).style.display = 'none';
      if (guides) (guides as HTMLElement).style.display = 'none';
      if (watermark && !showWatermark) (watermark as HTMLElement).style.display = 'none';

      const options = {
        quality: 1,
        backgroundColor: clipTheme === 'comic' ? '#fefce8' : 
                         clipTheme === 'modern' ? '#0a0a0a' : 
                         clipTheme === 'cyberpunk' ? '#000000' : '#ffffff',
        pixelRatio: clipScale,
        style: {
          borderRadius: '0px',
          backgroundColor: clipTheme === 'comic' ? '#fefce8' : 
                         clipTheme === 'modern' ? '#0a0a0a' : 
                         clipTheme === 'cyberpunk' ? '#000000' : '#ffffff',
          color: clipTheme === 'comic' ? '#000000' : '',
        },
      };

      const dataUrl = clipFormat === 'png' 
        ? await toPng(element, options) 
        : await toJpeg(element, options);

      // Restaurar os elementos
      if (actionButtons) (actionButtons as HTMLElement).style.display = 'flex';
      if (closeButton) (closeButton as HTMLElement).style.display = 'flex';
      if (configSection) (configSection as HTMLElement).style.display = 'block';
      if (guides) (guides as HTMLElement).style.display = 'block';
      if (watermark) (watermark as HTMLElement).style.display = 'block';

      return dataUrl;
    } catch (err) {
      console.error('Erro ao gerar clip:', err);
      toast.error("Erro ao gerar o fun-clip");
      return null;
    } finally {
      setIsGeneratingClip(false);
    }
  };

  const handleDownloadClip = async () => {
    const dataUrl = await generateClipData();
    if (dataUrl) {
      download(dataUrl, `fun-clip-duelo-${duelFighters[0]?.name}-vs-${duelFighters[1]?.name}.${clipFormat}`);
      toast.success("Fun-clip baixado com sucesso!");
    }
  };

  const handleShareClip = async () => {
    const dataUrl = await generateClipData();
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `fun-clip.${clipFormat}`, { type: `image/${clipFormat === 'png' ? 'png' : 'jpeg'}` });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Fun-Clip Duelo SOS01',
          text: `Confira o resultado desse duelo épico entre ${duelFighters[0]?.name} e ${duelFighters[1]?.name} no SOS01!`,
        });
      } else {
        // Fallback para download se não suportar partilha de ficheiros
        download(dataUrl, `fun-clip-duelo-${duelFighters[0]?.name}-vs-${duelFighters[1]?.name}.${clipFormat}`);
        toast.info("Compartilhamento não disponível, download iniciado.");
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      toast.error("Erro ao compartilhar o fun-clip");
    }
  };

  const calculateTotalStats = (hero: Hero) => {
    return Object.values(hero.powerstats || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  };

  const handleSelectForDuel = (hero: Hero) => {
    setDuelFighters(prev => {
      // Se o herói já está selecionado, remove ele
      if (prev[0]?.id === hero.id) return [null, prev[1]];
      if (prev[1]?.id === hero.id) return [prev[0], null];
      
      // Caso contrário, adiciona no primeiro espaço vazio
      if (!prev[0]) return [hero, prev[1]];
      if (!prev[1]) return [prev[0], hero];
      
      // Se ambos estão ocupados, substitui o segundo
      return [prev[0], hero];
    });
    // Reset positions when fighters change
    setFighterPositions([{x: 0, y: 0}, {x: 0, y: 0}]);
  };

  const resetDuel = () => {
    setDuelFighters([null, null]);
    setShowDuelResult(false);
    setFighterPositions([{x: 0, y: 0}, {x: 0, y: 0}]);
  };

  useEffect(() => {
    let active = true;
    fetch(API_URL)
      .then((r) => r.json())
      .then((data: Hero[]) => {
        if (!active) return;
        setHeroes(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return heroes.filter((hero) => {
      if (term) {
        const haystack = [
          hero.name,
          hero.biography?.fullName ?? "",
          hero.biography?.publisher ?? "",
          (hero.biography?.aliases ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (publisher !== "all" && hero.biography?.publisher !== publisher) return false;
      if (alignment !== "all" && hero.biography?.alignment !== alignment) return false;
      return true;
    });
  }, [heroes, search, publisher, alignment]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [search, publisher, alignment]);

  return (
    <section className="relative py-12 px-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2 className="font-pixel text-lg sm:text-xl md:text-2xl text-primary neon-text mb-2">
              ⚡ SUPER-HERÓIS
            </h2>
            <p className="font-pixel text-[8px] sm:text-[10px] text-muted-foreground max-w-xl mx-auto">
              731+ PERSONAGENS DA MARVEL, DC, DARK HORSE, IMAGE E MAIS
            </p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary/10 border border-primary/40 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="font-pixel text-[8px] sm:text-[10px] text-primary">
                CONSULTA GRÁTIS · SEM CADASTRO
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Filtros */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, editora ou apelido..."
                className="w-full pl-9 pr-3 py-2 bg-background border-2 border-primary/30 focus:border-primary rounded font-inter text-sm text-foreground outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {PUBLISHERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPublisher(p.value)}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[10px] border-2 rounded transition-all ${
                    publisher === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-primary/30 hover:border-primary hover:text-primary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {ALIGNMENTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAlignment(a.value)}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[10px] border-2 rounded transition-all ${
                    alignment === a.value
                      ? "bg-accent text-background border-accent"
                      : "bg-background text-muted-foreground border-accent/30 hover:border-accent hover:text-accent"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setDuelMode(!duelMode);
                if (!duelMode) resetDuel();
              }}
              className={`flex items-center gap-2 px-4 py-2 font-pixel text-[8px] sm:text-[10px] border-2 rounded transition-all ${
                duelMode
                  ? "bg-primary text-primary-foreground border-primary animate-pulse"
                  : "bg-background text-primary border-primary/30 hover:border-primary"
              }`}
            >
              <Swords className="w-4 h-4" />
              {duelMode ? "MODO DUELO ATIVO" : "MODO DUELO"}
            </button>
          </div>
        </ScrollReveal>

        {loading && (
          <p className="text-center font-pixel text-[10px] text-muted-foreground py-12">
            CARREGANDO PERSONAGENS...
          </p>
        )}
        {error && (
          <p className="text-center font-pixel text-[10px] text-destructive py-12">
            ERRO AO CARREGAR OS DADOS. TENTE NOVAMENTE MAIS TARDE.
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="font-pixel text-[8px] sm:text-[10px] text-muted-foreground mb-4 text-right">
              {filtered.length} DE {heroes.length} PERSONAGENS
            </p>

            {filtered.length === 0 ? (
              <p className="text-center font-pixel text-[10px] text-muted-foreground py-12">
                NENHUM PERSONAGEM ENCONTRADO.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.slice(0, visible).map((hero) => (
                  <button
                    key={hero.id}
                    onClick={() => {
                      if (duelMode) {
                        handleSelectForDuel(hero);
                      } else {
                        setSelected(hero);
                      }
                    }}
                    className={`group text-left bg-background border-2 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                      duelMode 
                        ? (duelFighters.some(f => f?.id === hero.id) ? "border-primary scale-[0.98] ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : "border-primary/20 grayscale-[0.5] hover:grayscale-0")
                        : "border-primary/30 hover:border-primary"
                    }`}
                  >
                    <img
                      src={hero.images?.sm ?? FALLBACK_IMG}
                      alt={hero.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                      className="w-full h-48 sm:h-60 object-cover bg-muted"
                    />
                    <div className="p-3">
                      <h3 className="font-pixel text-[9px] sm:text-[10px] text-primary truncate">
                        {hero.name}
                      </h3>
                      <p
                        className={`font-inter text-[11px] mt-1 truncate ${publisherClass(hero.biography?.publisher)}`}
                      >
                        {hero.biography?.publisher || "Desconhecida"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2 font-inter text-[10px] text-muted-foreground">
                        <span className="px-1.5 py-0.5 border border-primary/20 rounded">
                          💪 {hero.powerstats?.strength ?? "?"}
                        </span>
                        <span className="px-1.5 py-0.5 border border-primary/20 rounded">
                          🧠 {hero.powerstats?.intelligence ?? "?"}
                        </span>
                        <span className="px-1.5 py-0.5 border border-primary/20 rounded">
                          ⚡ {hero.powerstats?.speed ?? "?"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {visible < filtered.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="px-6 py-2.5 font-pixel text-[10px] bg-primary text-primary-foreground border-2 border-primary rounded hover:opacity-90 transition-opacity"
                >
                  CARREGAR MAIS
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Duel Selection Bar */}
      {duelMode && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] w-[95%] max-w-xl bg-background/95 backdrop-blur-md border-2 border-primary/40 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-10 ring-1 ring-primary/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex gap-3 flex-1 items-center justify-center">
              {[0, 1].map((idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full aspect-[3/4] max-h-24 sm:max-h-32 bg-muted border-2 border-dashed border-primary/30 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-inner">
                    {duelFighters[idx] ? (
                      <>
                        <img 
                          src={duelFighters[idx]?.images?.sm} 
                          alt={duelFighters[idx]?.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <button 
                          onClick={() => handleSelectForDuel(duelFighters[idx]!)}
                          className="absolute top-1 right-1 p-1.5 bg-destructive/80 text-white rounded-full hover:bg-destructive transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-40">
                        <Swords className="w-6 h-6 text-primary" />
                        <span className="font-pixel text-[6px] sm:text-[8px] text-muted-foreground uppercase">Herói {idx + 1}</span>
                      </div>
                    )}
                  </div>
                  {duelFighters[idx] && (
                    <span className="font-pixel text-[7px] sm:text-[9px] text-primary truncate w-full text-center">
                      {duelFighters[idx]?.name}
                    </span>
                  )}
                </div>
              ))}
              <div className="font-pixel text-xs text-primary/40 pb-4 shrink-0">VS</div>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              <button
                disabled={!duelFighters[0] || !duelFighters[1]}
                onClick={() => setShowDuelResult(true)}
                className="px-6 py-4 bg-primary text-primary-foreground font-pixel text-[10px] sm:text-xs rounded-xl border-b-4 border-primary-foreground/20 hover:translate-y-[2px] hover:border-b-2 active:translate-y-[4px] active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-b-4 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                LUTAR!
              </button>
              <button
                onClick={resetDuel}
                className="px-4 py-1.5 bg-background text-muted-foreground font-pixel text-[8px] rounded-lg border border-muted-foreground/30 hover:border-destructive hover:text-destructive transition-all flex items-center justify-center gap-1 opacity-70 hover:opacity-100"
              >
                <RotateCcw className="w-3 h-3" />
                RESETAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duel Result Modal */}
      {showDuelResult && duelFighters[0] && duelFighters[1] && (
        <div 
          className="fixed inset-0 z-[1100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="duel-modal-title"
        >
          <div 
            id="duel-combat-result" 
            ref={modalRef}
            className={`relative w-full max-w-5xl transition-all duration-500 m-0 sm:my-8 overflow-hidden p-4 sm:p-12 sm:border-4 sm:rounded-3xl ${
              clipTheme === 'modern' ? 'bg-[#0a0a0a] border-white/10 rounded-[40px] shadow-2xl' :
              clipTheme === 'comic' ? 'bg-yellow-50 border-black border-[6px] shadow-[12px_12px_0_0_#000]' :
              clipTheme === 'cyberpunk' ? 'bg-black border-retro-magenta border-b-[10px] border-r-[10px] shadow-[0_0_40px_rgba(255,0,255,0.2)]' :
              'bg-background border-primary/50 shadow-[0_0_80px_rgba(var(--primary),0.2)]'
            } ${
              clipFit === 'cover' ? 'aspect-video flex flex-col justify-center' : 
              clipFit === 'zoom' ? 'scale-110' : ''
            }`}
          >
            {/* Comic theme texture */}
            {clipTheme === 'comic' && (
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1.5px,transparent_1.5px)] bg-[size:15px_15px] z-0" />
            )}
            
            {/* Capture Guides */}
            {showGuides && (
              <div className="clip-guides absolute inset-0 pointer-events-none z-50 overflow-hidden">
                <div className="absolute top-1/3 w-full h-px bg-primary/20" />
                <div className="absolute top-2/3 w-full h-px bg-primary/20" />
                <div className="absolute left-1/3 h-full w-px bg-primary/20" />
                <div className="absolute left-2/3 h-full w-px bg-primary/20" />
                {/* Rule of thirds labels */}
                <div className="absolute top-2 right-2 font-pixel text-[6px] text-primary/40 uppercase">Guides Active</div>
              </div>
            )}

            <button
              onClick={() => setShowDuelResult(false)}
              aria-label="Fechar resultado do duelo"
              className="clip-close-button absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-destructive z-50 bg-background/80 p-2 rounded-full border border-primary/20 transition-all hover:rotate-90 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center gap-6 sm:gap-12 pt-12 sm:pt-0">
            <div className={`flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-full animate-bounce shadow-lg w-fit mx-auto ${
              clipTheme === 'comic' ? 'bg-white border-black shadow-[4px_4px_0_0_#000]' :
              clipTheme === 'modern' ? 'bg-white/5 border-white/20' :
              clipTheme === 'cyberpunk' ? 'bg-black border-retro-magenta shadow-[0_0_15px_rgba(255,0,255,0.5)]' :
              'bg-primary/20 border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]'
            }`}>
              <Swords className={`w-5 h-5 sm:w-8 sm:h-8 shrink-0 ${clipTheme === 'comic' ? 'text-black' : 'text-primary'}`} />
              <h2 id="duel-modal-title" className={`font-pixel text-base sm:text-4xl tracking-tighter text-center ${
                clipTheme === 'comic' ? 'text-black' : 
                clipTheme === 'modern' ? 'text-white' :
                'text-primary neon-text'
              }`}>
                COMBATE FINAL
              </h2>
              <Swords className={`w-5 h-5 sm:w-8 sm:h-8 shrink-0 ${clipTheme === 'comic' ? 'text-black' : 'text-primary'}`} />
            </div>

              <div className="w-full grid grid-cols-2 gap-3 sm:gap-12 items-start relative">
                {/* Center VS Indicator for Desktop */}
                <div className="hidden lg:flex absolute left-1/2 top-40 -translate-x-1/2 z-20 w-16 h-16 bg-primary/10 border-4 border-primary/50 rounded-full items-center justify-center -rotate-12 shadow-[0_0_30px_rgba(var(--primary),0.3)] pointer-events-none">
                  <span className="font-pixel text-2xl text-primary italic">VS</span>
                </div>

                {/* Fighter 1 Column */}
                <div className="flex flex-col gap-4 sm:gap-8 items-center">
                  <div className={`w-full flex flex-col items-center gap-3 sm:gap-6 p-2 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-1000 ease-out ${
                    calculateTotalStats(duelFighters[0]) >= calculateTotalStats(duelFighters[1]) 
                      ? "bg-primary/10 ring-2 sm:ring-4 ring-primary ring-offset-2 sm:ring-offset-8 ring-offset-background scale-[1.02] sm:scale-105 shadow-[0_0_50px_rgba(var(--primary),0.3)] z-10" 
                      : "opacity-40 grayscale translate-y-4 scale-95"
                  } animate-in fade-in slide-in-from-left duration-700`}>
                    <div className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-primary/20 w-full aspect-[3/4] max-h-48 sm:max-h-80">
                      <img 
                        src={duelFighters[0].images?.lg} 
                        alt={duelFighters[0].name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                      {calculateTotalStats(duelFighters[0]) > calculateTotalStats(duelFighters[1]) && (
                        <div className="absolute top-0 inset-x-0 bg-primary py-1.5 sm:py-3 text-center font-pixel text-[8px] sm:text-xs text-primary-foreground shadow-lg uppercase tracking-[0.2em] animate-pulse z-20">
                          VENCEDOR
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h3 className="font-pixel text-[10px] sm:text-2xl text-primary uppercase tracking-tighter truncate">{duelFighters[0].name}</h3>
                      <p className="font-inter text-[8px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1 sm:mt-2 font-bold opacity-70 truncate">{duelFighters[0].biography?.publisher}</p>
                    </div>

                    <div className={`w-full flex flex-col items-center py-2 sm:py-4 rounded-lg sm:rounded-xl border ${
                      clipTheme === 'comic' ? 'bg-black/5 border-black/20' :
                      clipTheme === 'modern' ? 'bg-white/5 border-white/10' :
                      'bg-primary/5 border-primary/10'
                    }`}>
                      <span className="font-pixel text-[6px] sm:text-[10px] text-muted-foreground mb-0.5 uppercase">Power Rank</span>
                      <span className={`font-pixel text-lg sm:text-4xl animate-in fade-in slide-in-from-left duration-1000 delay-1000 ${
                        clipTheme === 'comic' ? 'text-black' : 'text-primary'
                      }`}>
                        {calculateTotalStats(duelFighters[0])}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fighter 2 Column */}
                <div className="flex flex-col gap-4 sm:gap-8 items-center">
                  <div className={`w-full flex flex-col items-center gap-3 sm:gap-6 p-2 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-1000 ease-out ${
                    calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0]) 
                      ? "bg-primary/10 ring-2 sm:ring-4 ring-primary ring-offset-2 sm:ring-offset-8 ring-offset-background scale-[1.02] sm:scale-105 shadow-[0_0_50px_rgba(var(--primary),0.3)] z-10" 
                      : "opacity-40 grayscale translate-y-4 scale-95"
                  } animate-in fade-in slide-in-from-right duration-700`}>
                    <div className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-primary/20 w-full aspect-[3/4] max-h-48 sm:max-h-80">
                      <img 
                        src={duelFighters[1].images?.lg} 
                        alt={duelFighters[1].name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                      {calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0]) && (
                        <div className="absolute top-0 inset-x-0 bg-primary py-1.5 sm:py-3 text-center font-pixel text-[8px] sm:text-xs text-primary-foreground shadow-lg uppercase tracking-[0.2em] animate-pulse z-20">
                          VENCEDOR
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h3 className="font-pixel text-[10px] sm:text-2xl text-primary uppercase tracking-tighter truncate">{duelFighters[1].name}</h3>
                      <p className="font-inter text-[8px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1 sm:mt-2 font-bold opacity-70 truncate">{duelFighters[1].biography?.publisher}</p>
                    </div>

                    <div className={`w-full flex flex-col items-center py-2 sm:py-4 rounded-lg sm:rounded-xl border ${
                      clipTheme === 'comic' ? 'bg-black/5 border-black/20' :
                      clipTheme === 'modern' ? 'bg-white/5 border-white/10' :
                      'bg-primary/5 border-primary/10'
                    }`}>
                      <span className="font-pixel text-[6px] sm:text-[10px] text-muted-foreground mb-0.5 uppercase">Power Rank</span>
                      <span className={`font-pixel text-lg sm:text-4xl animate-in fade-in slide-in-from-right duration-1000 delay-1000 ${
                        clipTheme === 'comic' ? 'text-black' : 'text-primary'
                      }`}>
                        {calculateTotalStats(duelFighters[1])}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison Row (Span both columns) */}
                <div className="col-span-2 flex flex-col items-center w-full max-w-4xl mx-auto mt-2 sm:mt-4">
                  <div className="lg:hidden mb-4 w-10 h-10 bg-primary/10 border-2 border-primary/50 rounded-full flex items-center justify-center -rotate-12 shadow-[0_0_30px_rgba(var(--primary),0.3)] shrink-0">
                    <span className="font-pixel text-lg text-primary italic">VS</span>
                  </div>

                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-6 sm:gap-y-8">
                    {Object.entries(STAT_LABELS).map(([key, label], index) => {
                      const stat1 = Number(duelFighters[0]!.powerstats[key]) || 0;
                      const stat2 = Number(duelFighters[1]!.powerstats[key]) || 0;
                      const winner = stat1 > stat2 ? 1 : stat2 > stat1 ? 2 : 0;
                      
                      return (
                        <div key={key} className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-end px-1 gap-2">
                            <span className={`font-pixel text-[8px] sm:text-xs transition-colors duration-500 shrink-0 ${winner === 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {winner === 1 && "★ "}{stat1}
                            </span>
                            <span className="font-pixel text-[9px] sm:text-sm text-foreground uppercase text-center flex-1 truncate">{label}</span>
                            <span className={`font-pixel text-[8px] sm:text-xs transition-colors duration-500 shrink-0 ${winner === 2 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {stat2}{winner === 2 && " ★"}
                            </span>
                          </div>
                          
                          <div className={`h-4 sm:h-6 rounded-full flex overflow-hidden border-2 p-[2px] sm:p-[3px] shadow-inner relative group ${
                            clipTheme === 'comic' ? 'bg-black/10 border-black' :
                            clipTheme === 'modern' ? 'bg-white/5 border-white/10' :
                            'bg-muted/20 border-primary/10'
                          }`}>
                            {/* Bar Hero 1 */}
                            <div className="flex-1 h-full flex justify-end overflow-hidden">
                              <div 
                                className={`h-full rounded-l-full transition-all duration-1000 ease-out shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] ${
                                  winner === 1 
                                    ? (clipTheme === 'comic' ? 'bg-black' : clipTheme === 'cyberpunk' ? 'bg-retro-magenta' : 'bg-primary neon-shadow animate-pulse-subtle') 
                                    : 'opacity-20 bg-current'
                                }`}
                                style={{ 
                                  width: showDuelResult ? `${(stat1 / (stat1 + stat2 || 1)) * 100}%` : '0%',
                                  transitionDelay: `${index * 150}ms`
                                }}
                              />
                            </div>
                            
                            {/* Separator / Center Point */}
                            <div className={`w-[2px] z-10 ${clipTheme === 'comic' ? 'bg-black' : 'bg-background/50'}`} />
                            
                            {/* Bar Hero 2 */}
                            <div className="flex-1 h-full flex justify-start overflow-hidden">
                              <div 
                                className={`h-full rounded-r-full transition-all duration-1000 ease-out shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] ${
                                  winner === 2 
                                    ? (clipTheme === 'comic' ? 'bg-black' : clipTheme === 'cyberpunk' ? 'bg-retro-magenta' : 'bg-primary neon-shadow animate-pulse-subtle') 
                                    : 'opacity-20 bg-current'
                                }`}
                                style={{ 
                                  width: showDuelResult ? `${(stat2 / (stat1 + stat2 || 1)) * 100}%` : '0%',
                                  transitionDelay: `${index * 150}ms`
                                }}
                              />
                            </div>

                            {/* Flash effect on animation completion */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                          <div className={`text-center font-inter text-[10px] sm:text-xs italic transition-all duration-700 delay-[${index * 150 + 500}ms] ${showDuelResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            {winner === 1 ? (
                              <span className="text-primary/90">✦ {duelFighters[0]!.name} superior</span>
                            ) : winner === 2 ? (
                              <span className="text-primary/90">✦ {duelFighters[1]!.name} domina</span>
                            ) : (
                              <span className="text-muted-foreground">Empate</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-2 sm:mt-4 text-center bg-primary/5 border-2 border-primary/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-inner relative overflow-hidden">
                <p className="font-inter text-sm sm:text-lg text-foreground/90 leading-relaxed z-10 relative">
                  {calculateTotalStats(duelFighters[0]) > calculateTotalStats(duelFighters[1]) 
                    ? `DOMINÂNCIA TOTAL! Com um arsenal de ${calculateTotalStats(duelFighters[0])} pontos, ${duelFighters[0].name} não deu chances para ${duelFighters[1].name} e triunfa como o supremo guerreiro!`
                    : calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0])
                    ? `VITÓRIA ESMAGADORA! ${duelFighters[1].name} supera as expectativas, alcança ${calculateTotalStats(duelFighters[1])} pontos totais e derrota o lendário ${duelFighters[0].name}!`
                    : "EMPATE LENDÁRIO! Em um confronto onde cada grama de força foi igualada, nenhum dos combatentes cedeu. A batalha termina sem um vencedor definido, mas com o respeito mútuo garantido."
                  }
                </p>

                {/* Watermark */}
                <div className="clip-watermark absolute bottom-2 left-1/2 -translate-x-1/2 opacity-60 z-0 pointer-events-none">
                  <span className={`font-pixel text-[12px] sm:text-[18px] font-bold uppercase tracking-[0.3em] ${clipTheme === 'comic' ? 'text-black/40' : 'text-primary/40'}`}>
                    sos01.com.br
                  </span>
                </div>
                <div className={`clip-config-section mt-6 p-4 border rounded-2xl w-full max-w-lg mx-auto ${clipTheme === 'comic' ? 'bg-black/5 border-black/20' : 'bg-primary/10 border-primary/20'}`}>
                  <h4 className="font-pixel text-[10px] text-primary mb-3 text-center uppercase tracking-wider">CONFIGURAÇÕES DO FUN-CLIP</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2 text-center">
                      <span id="label-formato" className="font-pixel text-[8px] text-muted-foreground uppercase">Formato</span>
                      <div className="flex justify-center gap-2" role="group" aria-labelledby="label-formato">
                        {['png', 'jpg'].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setClipFormat(fmt as any)}
                            aria-pressed={clipFormat === fmt}
                            aria-label={`Selecionar formato ${fmt.toUpperCase()}`}
                            className={`px-3 py-1 rounded-md font-pixel text-[9px] transition-all ${clipFormat === fmt ? 'bg-primary text-primary-foreground' : 'bg-background border border-primary/20 text-muted-foreground'}`}
                          >
                            {fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <span id="label-resolucao" className="font-pixel text-[8px] text-muted-foreground uppercase">Resolução</span>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-center gap-2" role="group" aria-labelledby="label-resolucao">
                          {[1, 2, 3].map((s) => (
                            <button
                              key={s}
                              onClick={() => setClipScale(s)}
                              aria-pressed={clipScale === s}
                              aria-label={`Selecionar resolução ${s}x`}
                              className={`px-3 py-1 rounded-md font-pixel text-[9px] transition-all ${clipScale === s ? 'bg-primary text-primary-foreground' : 'bg-background border border-primary/20 text-muted-foreground'}`}
                            >
                              {s}X
                            </button>
                          ))}
                        </div>
                        <span className="font-pixel text-[7px] text-primary/60 italic">
                          {dimensions.width} x {dimensions.height} PX
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <span id="label-enquadramento" className="font-pixel text-[8px] text-muted-foreground uppercase">Enquadramento</span>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-center gap-2" role="group" aria-labelledby="label-enquadramento">
                          <button
                            onClick={() => setClipFit('contain')}
                            aria-pressed={clipFit === 'contain'}
                            aria-label="Enquadramento: Centralizado"
                            title="Centralizado"
                            className={`p-2 rounded-md transition-all ${clipFit === 'contain' ? 'bg-primary text-primary-foreground' : 'bg-background border border-primary/20 text-muted-foreground'}`}
                          >
                            <Minimize className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setClipFit('cover')}
                            aria-pressed={clipFit === 'cover'}
                            aria-label="Enquadramento: Manter Proporção"
                            title="Manter Proporção"
                            className={`p-2 rounded-md transition-all ${clipFit === 'cover' ? 'bg-primary text-primary-foreground' : 'bg-background border border-primary/20 text-muted-foreground'}`}
                          >
                            <Maximize className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setClipFit('zoom')}
                            aria-pressed={clipFit === 'zoom'}
                            aria-label="Enquadramento: Zoom"
                            title="Zoom"
                            className={`p-2 rounded-md transition-all ${clipFit === 'zoom' ? 'bg-primary text-primary-foreground' : 'bg-background border border-primary/20 text-muted-foreground'}`}
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowGuides(!showGuides)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-pixel transition-colors ${showGuides ? 'bg-primary/20 text-primary border border-primary/40' : 'text-muted-foreground border border-transparent'}`}
                          >
                            {showGuides ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {showGuides ? 'GUIAS ON' : 'GUIAS OFF'}
                          </button>
                          <button
                            onClick={() => setShowWatermark(!showWatermark)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-pixel transition-colors ${showWatermark ? 'bg-primary/20 text-primary border border-primary/40' : 'text-muted-foreground border border-transparent'}`}
                          >
                            {showWatermark ? <ShieldCheck className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            MARCA D'ÁGUA
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-3 space-y-2 text-center border-t border-primary/10 pt-3">
                      <span id="label-tema" className="font-pixel text-[8px] text-muted-foreground uppercase flex items-center justify-center gap-2">
                        <Palette className="w-3 h-3" />
                        Temas Visuais
                      </span>
                      <div className="flex justify-center flex-wrap gap-2" role="group" aria-labelledby="label-tema">
                        {DUEL_THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setClipTheme(theme.id as any)}
                            aria-pressed={clipTheme === theme.id}
                            className={`px-4 py-1.5 rounded-lg font-pixel text-[9px] transition-all border-2 ${
                              clipTheme === theme.id 
                                ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                                : 'bg-background border-primary/20 text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="clip-action-buttons mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
                  <button
                    onClick={handleDownloadClip}
                    disabled={isGeneratingClip}
                    aria-label="Baixar Fun-Clip"
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-accent text-accent-foreground font-pixel text-[10px] sm:text-xs rounded-xl border-b-4 border-accent-foreground/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--accent),0.3)] flex items-center gap-2"
                  >
                    {isGeneratingClip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    BAIXAR CLIP
                  </button>
                  <button
                    onClick={handleShareClip}
                    disabled={isGeneratingClip}
                    aria-label="Compartilhar Fun-Clip"
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-retro-magenta text-white font-pixel text-[10px] sm:text-xs rounded-xl border-b-4 border-black/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--retro-magenta),0.3)] flex items-center gap-2"
                  >
                    {isGeneratingClip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                    COMPARTILHAR
                  </button>
                  <button
                    onClick={resetDuel}
                    aria-label="Iniciar nova batalha"
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-primary text-primary-foreground font-pixel text-[10px] sm:text-xs rounded-xl border-b-4 border-primary-foreground/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  >
                    NOVA BATALHA
                  </button>
                  <button
                    onClick={() => setShowDuelResult(false)}
                    aria-label="Fechar e voltar à lista de heróis"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-background text-muted-foreground font-pixel text-[10px] sm:text-xs rounded-xl border-2 border-muted-foreground/20 hover:text-foreground transition-all"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-2 border-primary/40 rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              aria-label="Fechar"
              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
              <img
                src={selected.images?.lg ?? FALLBACK_IMG}
                alt={selected.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                }}
                className="w-40 h-52 object-cover rounded-lg shrink-0 bg-muted"
              />
              <div className="min-w-0">
                <h3 className="font-pixel text-sm sm:text-base text-primary">{selected.name}</h3>
                <p className="font-inter text-xs text-muted-foreground mt-1">
                  {selected.biography?.fullName || "Identidade desconhecida"}
                </p>
                <p
                  className={`font-inter text-sm font-semibold mt-2 ${publisherClass(selected.biography?.publisher)}`}
                >
                  {selected.biography?.publisher || "Editora desconhecida"}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1 mt-2 font-inter text-xs text-muted-foreground">
                  <p>
                    Gênero: {t(selected.appearance?.gender)}
                  </p>
                  <p>
                    Raça: {t(selected.appearance?.race)}
                  </p>
                  <p>
                    Alinhamento: {t(selected.biography?.alignment)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="font-pixel text-[8px] text-muted-foreground mb-2">PODERES</h4>
              <div className="flex flex-col gap-2">
                {Object.entries(selected.powerstats ?? {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-24 font-inter text-xs text-muted-foreground">
                      {STAT_LABELS[key] ?? key}
                    </span>
                    <div className="flex-1 h-2.5 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary rounded transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-inter text-xs text-foreground">
                      {Number.isFinite(Number(value)) ? value : "?"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-5 font-inter text-xs text-foreground/80">
              <div>
                <h4 className="font-pixel text-[8px] text-muted-foreground mb-1">PRIMEIRA APARIÇÃO</h4>
                <p>{selected.biography?.firstAppearance || "—"}</p>
              </div>
              <div>
                <h4 className="font-pixel text-[8px] text-muted-foreground mb-1">LOCAL DE NASCIMENTO</h4>
                <p>{selected.biography?.placeOfBirth || "—"}</p>
              </div>
              <div>
                <h4 className="font-pixel text-[8px] text-muted-foreground mb-1">OCUPAÇÃO</h4>
                <p>{translateText(selected.work?.occupation)}</p>
              </div>
              <div>
                <h4 className="font-pixel text-[8px] text-muted-foreground mb-1">GRUPOS</h4>
                <p>{translateText(selected.connections?.groupAffiliation)}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-pixel text-[8px] text-muted-foreground mb-1">APELIDOS</h4>
                <p>{(selected.biography?.aliases ?? []).join(", ") || "—"}</p>
              </div>
            </div>
          </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                  <button
                    onClick={() => {
                      setDuelMode(true);
                      handleSelectForDuel(selected);
                      setSelected(null);
                      toast.success(`${selected.name} selecionado para o duelo!`);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground font-pixel text-[8px] sm:text-[10px] rounded border-b-2 border-primary-foreground/20 hover:translate-y-[1px] hover:border-b-0 transition-all flex items-center gap-2"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    LUTAR
                  </button>
                </div>
              </div>
      )}
    </section>
  );
};

export default ComicsSection;
