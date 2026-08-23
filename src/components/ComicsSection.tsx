import { useEffect, useMemo, useState, useRef } from "react";
import { Search, ShieldCheck, X, Swords, Trophy, RotateCcw, Download, Loader2, Share2, Maximize, Minimize, ZoomIn, Eye, EyeOff, Palette, LayoutGrid, Zap } from "lucide-react";
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
  Male: "Masculino", Female: "Feminino", Human: "Humano", Mutant: "Mutante", Radiation: "Radiação",
  Cyborg: "Cyborg", Android: "Androide", Alien: "Alienígena", Inhuman: "Inumano",
  "God / Eternal": "Deus / Eterno", "New God": "Novo Deus", Asgardian: "Asgardiano",
  Kryptonian: "Kriptoniano", Atlantean: "Atlante", Symbiote: "Simbionte", Vampire: "Vampiro",
  Zombie: "Zumbi", Metahuman: "Meta-humano", Demon: "Demônio", Angel: "Anjo",
  good: "Herói", bad: "Vilão", neutral: "Neutro",
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
    "Journalist": "Jornalista", "Reporter": "Repórter", "Student": "Estudante", "Adventurer": "Aventureiro",
    "Hero": "Herói", "Criminal": "Criminoso", "Assassin": "Assassino", "Mercenary": "Mercenário",
    "Soldier": "Soldado", "Scientist": "Cientista", "Doctor": "Médico", "Billionaire": "Bilionário",
    "Inventor": "Inventor", "King": "Rei", "Queen": "Rainha", "Prince": "Príncipe", "Princess": "Princesa",
    "God": "Deus", "Goddess": "Deusa", "Warrior": "Guerreiro", "Vigilante": "Vigilante",
    "Mutant": "Mutante", "Alien": "Alienígena", "Detective": "Detetive", "Police Officer": "Policial",
    "Lawyer": "Advogado", "Leader": "Líder", "Member of": "Membro de", "Founding member": "Membro fundador",
    "Justice League": "Liga da Justiça", "Avengers": "Vingadores", "X-Men": "X-Men",
    "Fantastic Four": "Quarteto Fantástico", "Suicide Squad": "Esquadrão Suicida", "Teen Titans": "Jovens Titãs",
    "Defenders": "Defensores", "Inhumans": "Inumanos", "Guardians of the Galaxy": "Guardiões da Galáxia",
    "Sinister Six": "Sexteto Sinistro", "Brotherhood of Mutants": "Irmandade de Mutantes", "Hydra": "Hidra",
    "S.H.I.E.L.D.": "S.H.I.E.L.D.", "A.I.M.": "I.D.E.I.A.", "B.P.R.D.": "B.P.R.D.",
    "Daily Planet": "Planeta Diário", "Stark Industries": "Indústrias Stark", "Wayne Enterprises": "Empresas Wayne",
    "Gotham City": "Cidade de Gotham", "Metropolis": "Metrópolis", "New York": "Nova York",
    "Earth": "Terra", "Mars": "Marte", "Space": "Espaço", "Professional": "Profissional",
    "Freelance": "Autônomo", "Pilot": "Piloto", "Photographer": "Fotógrafo", "None": "Nenhum",
    "Unknown": "Desconhecido",
  };
  let result = text;
  Object.entries(terms).forEach(([eng, pt]) => {
    const regex = new RegExp(`\\b${eng}\\b`, "gi");
    result = result.replace(regex, pt);
  });
  return result;
};

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='200' height='300' fill='%23161b22'/%3E%3C/svg%3E";

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
  const [showWatermark, setShowWatermark] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="relative py-12 px-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2 className="font-pixel text-lg sm:text-xl md:text-2xl text-primary neon-text mb-2">⚡ SUPER-HERÓIS</h2>
            
            {/* Filter Bar */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Buscar herói..." 
                      className="bg-background border-2 border-primary/20 rounded-lg pl-10 pr-4 py-2 font-pixel text-xs text-foreground focus:border-primary outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className="bg-background border-2 border-primary/20 rounded-lg px-4 py-2 font-pixel text-xs text-foreground" onChange={(e) => setPublisher(e.target.value)}>
                    {PUBLISHERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <select className="bg-background border-2 border-primary/20 rounded-lg px-4 py-2 font-pixel text-xs text-foreground" onChange={(e) => setAlignment(e.target.value)}>
                    {ALIGNMENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <button 
                  onClick={() => setDuelMode(!duelMode)}
                  className={`px-4 py-2 rounded-lg font-pixel text-xs flex items-center gap-2 transition-colors ${duelMode ? 'bg-primary text-primary-foreground' : 'bg-background border-2 border-primary/20 hover:border-primary'}`}
                >
                  <Swords className="w-4 h-4" /> {duelMode ? "MODO DUELO" : "DUELO"}
                </button>
            </div>
          </div>
        </ScrollReveal>

        {loading && <p className="text-center font-pixel text-[10px] text-muted-foreground py-12">CARREGANDO...</p>}
        {error && <p className="text-center font-pixel text-[10px] text-destructive py-12">ERRO!</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.slice(0, visible).map((hero) => (
              <button
                key={hero.id}
                onClick={() => { if (duelMode) { /* handleSelectForDuel logic */ } else setSelected(hero); }}
                className={`group text-left bg-background border-2 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 ${duelMode ? "border-primary/20" : "border-primary/30 hover:border-primary"}`}
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

      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
          <div className="bg-background border-2 border-primary/20 p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-pixel text-2xl text-primary">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img src={selected.images?.lg} alt={selected.name} className="w-full rounded-xl" />
                <div>
                    <p className="font-pixel text-xs text-muted-foreground mb-4">{t(selected.biography.fullName)}</p>
                    <div className="space-y-2">
                        {Object.entries(selected.powerstats).map(([key, val]) => (
                            <div key={key}>
                                <div className="flex justify-between font-pixel text-[10px] mb-1">
                                    <span>{STAT_LABELS[key]}</span>
                                    <span>{val}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{width: `${val}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ComicsSection;
