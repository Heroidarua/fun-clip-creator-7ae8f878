import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, X, Swords, Trophy, RotateCcw } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

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
  };

  const resetDuel = () => {
    setDuelFighters([null, null]);
    setShowDuelResult(false);
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
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-background border-4 border-primary/50 rounded-2xl p-6 sm:p-10 shadow-[0_0_50px_rgba(var(--primary),0.3)]">
            <button
              onClick={() => setShowDuelResult(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive z-10 bg-background/50 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-2 px-6 py-2 bg-primary/20 border-2 border-primary rounded-full animate-bounce">
                <Trophy className="w-6 h-6 text-primary" />
                <h2 className="font-pixel text-lg sm:text-2xl text-primary neon-text">
                  DUELO ÉPICO!
                </h2>
                <Trophy className="w-6 h-6 text-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 w-full items-start">
                {/* Fighter 1 */}
                <div className={`flex flex-col items-center gap-4 transition-all duration-700 ${
                  calculateTotalStats(duelFighters[0]) > calculateTotalStats(duelFighters[1]) 
                    ? "scale-105" 
                    : "opacity-70 grayscale-[0.5]"
                }`}>
                  <div className={`relative rounded-xl overflow-hidden border-4 ${
                    calculateTotalStats(duelFighters[0]) > calculateTotalStats(duelFighters[1]) ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.5)]" : "border-muted-foreground/30"
                  }`}>
                    <img src={duelFighters[0].images?.lg} alt={duelFighters[0].name} className="w-48 h-64 sm:w-64 sm:h-80 object-cover" />
                    {calculateTotalStats(duelFighters[0]) > calculateTotalStats(duelFighters[1]) && (
                      <div className="absolute top-0 inset-x-0 bg-primary py-1 text-center font-pixel text-[10px] text-primary-foreground">VENCEDOR</div>
                    )}
                  </div>
                  <h3 className="font-pixel text-sm sm:text-lg text-primary text-center">{duelFighters[0].name}</h3>
                  <div className="w-full space-y-2">
                    {Object.entries(duelFighters[0].powerstats).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-[10px] font-inter">
                        <span className="text-muted-foreground">{STAT_LABELS[key]}</span>
                        <div className="flex-1 mx-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${val}%` }} />
                        </div>
                        <span className={Number(val) > Number(duelFighters[1]!.powerstats[key]) ? "text-primary font-bold" : "text-foreground"}>
                          {val}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
                      <span className="font-pixel text-[8px] text-muted-foreground">TOTAL</span>
                      <span className="font-pixel text-lg text-primary">{calculateTotalStats(duelFighters[0])}</span>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 border-4 border-primary/40 rounded-full flex items-center justify-center rotate-12">
                    <span className="font-pixel text-2xl sm:text-4xl text-primary animate-pulse">VS</span>
                  </div>
                </div>

                {/* Fighter 2 */}
                <div className={`flex flex-col items-center gap-4 transition-all duration-700 ${
                  calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0]) 
                    ? "scale-105" 
                    : "opacity-70 grayscale-[0.5]"
                }`}>
                  <div className={`relative rounded-xl overflow-hidden border-4 ${
                    calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0]) ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.5)]" : "border-muted-foreground/30"
                  }`}>
                    <img src={duelFighters[1].images?.lg} alt={duelFighters[1].name} className="w-48 h-64 sm:w-64 sm:h-80 object-cover" />
                    {calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0]) && (
                      <div className="absolute top-0 inset-x-0 bg-primary py-1 text-center font-pixel text-[10px] text-primary-foreground">VENCEDOR</div>
                    )}
                  </div>
                  <h3 className="font-pixel text-sm sm:text-lg text-primary text-center">{duelFighters[1].name}</h3>
                  <div className="w-full space-y-2">
                    {Object.entries(duelFighters[1].powerstats).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-[10px] font-inter">
                        <span className={Number(val) > Number(duelFighters[0]!.powerstats[key]) ? "text-primary font-bold" : "text-foreground"}>
                          {val}
                        </span>
                        <div className="flex-1 mx-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${val}%` }} />
                        </div>
                        <span className="text-muted-foreground text-right">{STAT_LABELS[key]}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
                      <span className="font-pixel text-lg text-primary">{calculateTotalStats(duelFighters[1])}</span>
                      <span className="font-pixel text-[8px] text-muted-foreground">TOTAL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center bg-primary/10 border-2 border-primary/30 p-4 rounded-xl max-w-lg w-full">
                <p className="font-inter text-sm text-foreground/90 italic">
                  {calculateTotalStats(duelFighters[0]) > calculateTotalStats(duelFighters[1]) 
                    ? `Com uma pontuação total de ${calculateTotalStats(duelFighters[0])}, ${duelFighters[0].name} derrota ${duelFighters[1].name} em um combate lendário!`
                    : calculateTotalStats(duelFighters[1]) > calculateTotalStats(duelFighters[0])
                    ? `Em uma reviravolta impressionante, ${duelFighters[1].name} supera ${duelFighters[0].name} com ${calculateTotalStats(duelFighters[1])} pontos!`
                    : "Um empate técnico! Ambos os guerreiros demonstraram um poder equivalente e a batalha termina sem um vencedor claro."
                  }
                </p>
                <button
                  onClick={resetDuel}
                  className="mt-6 px-8 py-3 bg-primary text-primary-foreground font-pixel text-xs rounded-lg border-2 border-primary hover:scale-105 transition-transform"
                >
                  NOVO DUELO
                </button>
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
        </div>
      )}
    </section>
  );
};

export default ComicsSection;
