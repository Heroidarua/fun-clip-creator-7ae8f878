import { useEffect, useMemo, useState, useRef } from "react";
import { Search, ShieldCheck, X, Swords, Trophy, RotateCcw, Download, Loader2, Share2, Maximize, Minimize, ZoomIn, Eye, EyeOff, Palette, LayoutGrid } from "lucide-react";
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
  Male: "Masculino",
  Female: "Feminino",
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
  const commonTranslations: Record<string, string> = {
    "No relatives": "Sem parentes",
    "Formerly": "Anteriormente",
    "active": "ativo",
    "unknown": "desconhecido",
  };
  let translated = TRANSLATIONS[text] || text;
  if (translated === text) {
    Object.entries(commonTranslations).forEach(([eng, pt]) => {
      translated = translated.replace(new RegExp(eng, "gi"), pt);
    });
  }
  return translated;
};

const translateText = (text?: string | null) => {
  if (!text || text === "-" || text.toLowerCase() === "n/a") return "—";
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
  const [fighterPositions, setFighterPositions] = useState<[{x: number, y: number}, {x: number, y: number}]>([{x: 0, y: 0}, {x: 0, y: 0}]);
  const modalRef = useRef<HTMLDivElement>(null);

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
      const dataUrl = clipFormat === 'png' 
        ? await toPng(element, { quality: 0.95, backgroundColor: '#000', pixelRatio: clipScale }) 
        : await toJpeg(element, { quality: 0.95, backgroundColor: '#000', pixelRatio: clipScale });
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
        download(dataUrl, `fun-clip-duelo-${duelFighters[0]?.name}-vs-${duelFighters[1]?.name}.${clipFormat}`);
        toast.info("Compartilhamento não disponível, download iniciado.");
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      toast.error("Erro ao compartilhar o fun-clip");
    }
  };

  const calculateTotalStats = (hero: Hero) => Object.values(hero.powerstats || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  const handleSelectForDuel = (hero: Hero) => {
    setDuelFighters(prev => {
      if (prev[0]?.id === hero.id) return [null, prev[1]];
      if (prev[1]?.id === hero.id) return [prev[0], null];
      if (!prev[0]) return [hero, prev[1]];
      if (!prev[1]) return [prev[0], hero];
      return [prev[0], hero];
    });
    setFighterPositions([{x: 0, y: 0}, {x: 0, y: 0}]);
  };

  const resetDuel = () => {
    setDuelFighters([null, null]);
    setShowDuelResult(false);
    setFighterPositions([{x: 0, y: 0}, {x: 0, y: 0}]);
  };

  const autoFrameFighters = () => {
    setFighterPositions([{x: 0, y: 0}, {x: 0, y: 0}]);
    toast.success("Enquadramento resetado!");
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
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return heroes.filter((hero) => {
      if (term) {
        const haystack = [hero.name, hero.biography?.fullName ?? "", hero.biography?.publisher ?? "", (hero.biography?.aliases ?? []).join(" ")].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (publisher !== "all" && hero.biography?.publisher !== publisher) return false;
      if (alignment !== "all" && hero.biography?.alignment !== alignment) return false;
      return true;
    });
  }, [heroes, search, publisher, alignment]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [search, publisher, alignment]);

  return (
    <section className="relative py-12 px-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2 className="font-pixel text-lg sm:text-xl md:text-2xl text-primary neon-text mb-2">
              ⚡ SUPER-HERÓIS
            </h2>
          </div>
        </ScrollReveal>

        {loading && <p className="text-center font-pixel text-[10px] text-muted-foreground py-12">CARREGANDO...</p>}
        {error && <p className="text-center font-pixel text-[10px] text-destructive py-12">ERRO!</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.slice(0, visible).map((hero) => (
              <button
                key={hero.id}
                onClick={() => { if (duelMode) handleSelectForDuel(hero); else setSelected(hero); }}
                className={`group text-left bg-background border-2 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  duelMode 
                    ? (duelFighters.some(f => f?.id === hero.id) ? "border-primary scale-[0.98] ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : "border-primary/20 grayscale-[0.5] hover:grayscale-0")
                    : "border-primary/30 hover:border-primary"
                }`}
              >
                <img src={hero.images?.sm ?? FALLBACK_IMG} alt={hero.name} className="w-full h-48 sm:h-60 object-cover bg-muted" />
                <div className="p-3">
                  <h3 className="font-pixel text-[9px] sm:text-[10px] text-primary truncate">{hero.name}</h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {duelMode && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] w-[95%] max-w-xl bg-background/95 border-2 border-primary/40 rounded-2xl p-4">
           <button onClick={() => setShowDuelResult(true)} className="px-6 py-4 bg-primary text-primary-foreground font-pixel text-[10px] sm:text-xs rounded-xl flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> LUTAR!
          </button>
        </div>
      )}

      {showDuelResult && duelFighters[0] && duelFighters[1] && (
        <div className="fixed inset-0 z-[1100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto" role="dialog">
          <div className="relative w-full max-w-5xl flex flex-col items-center gap-6 m-0 sm:my-8">
            <div 
              id="duel-combat-result" 
              ref={modalRef}
              className={`relative w-full transition-all duration-500 overflow-hidden p-4 sm:p-12 sm:border-4 sm:rounded-3xl ${
                clipTheme === 'modern' ? 'bg-[#0a0a0a] border-white/10 rounded-[40px] shadow-2xl' :
                clipTheme === 'comic' ? 'bg-yellow-50 border-black border-[6px] shadow-[12px_12px_0_0_#000]' :
                clipTheme === 'cyberpunk' ? 'bg-black border-retro-magenta border-b-[10px] border-r-[10px] shadow-[0_0_40px_rgba(255,0,255,0.2)]' :
                'bg-background border-primary/50 shadow-[0_0_80px_rgba(var(--primary),0.2)]'
              } ${
                clipFit === 'cover' ? 'aspect-video flex flex-col justify-center' : 
                clipFit === 'zoom' ? 'scale-110' : ''
              }`}
            >
              {clipTheme === 'comic' && <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1.5px,transparent_1.5px)] bg-[size:15px_15px] z-0" />}
              {showWatermark && (
                <div className="clip-watermark absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-60 select-none text-center w-full">
                  <span className={`font-pixel text-[12px] sm:text-[18px] font-bold ${clipTheme === 'comic' ? 'text-black' : 'text-primary'}`}>sos01.com.br</span>
                </div>
              )}
              {showGuides && (
                <div className="clip-guides absolute inset-0 pointer-events-none z-50 overflow-hidden">
                  <div className="absolute top-1/3 w-full h-px bg-primary/20" />
                  <div className="absolute top-2/3 w-full h-px bg-primary/20" />
                  <div className="absolute left-1/3 h-full w-px bg-primary/20" />
                  <div className="absolute left-2/3 h-full w-px bg-primary/20" />
                </div>
              )}
              
              <div className="flex flex-col items-center gap-12">
                <h2 className="font-pixel text-4xl text-primary neon-text">COMBATE FINAL</h2>
                <div className="grid grid-cols-2 w-full gap-12">
                  <div className="flex flex-col items-center">
                    <img src={duelFighters[0].images?.lg} alt={duelFighters[0].name} className="w-full aspect-[3/4] object-cover rounded-2xl" />
                    <h3 className="text-xl text-primary">{duelFighters[0].name}</h3>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src={duelFighters[1].images?.lg} alt={duelFighters[1].name} className="w-full aspect-[3/4] object-cover rounded-2xl" />
                    <h3 className="text-xl text-primary">{duelFighters[1].name}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl p-6 bg-background/95 border border-primary/20 rounded-2xl z-20">
              <h4 className="font-pixel text-primary mb-4">CONFIGURAÇÕES</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => setClipFormat('png')} className={`p-2 border ${clipFormat === 'png' ? 'bg-primary' : ''}`}>PNG</button>
                <button onClick={() => setClipFormat('jpg')} className={`p-2 border ${clipFormat === 'jpg' ? 'bg-primary' : ''}`}>JPG</button>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={handleDownloadClip} className="px-6 py-3 bg-accent rounded-xl">GERAR CLIP</button>
                <button onClick={() => setShowDuelResult(false)} className="px-6 py-3 bg-background rounded-xl border">FECHAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
          <div className="bg-background border-2 p-6 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-primary">{selected.name}</h3>
            <button onClick={() => setSelected(null)}>FECHAR</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ComicsSection;
