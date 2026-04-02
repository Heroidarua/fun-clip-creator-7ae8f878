import { useState, useMemo } from "react";
import { Book, ExternalLink, X, Maximize2, Minimize2, Filter } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScrollReveal from "./ScrollReveal";
import { useAchievements } from "@/hooks/useAchievements";
import comicsBanner from "@/assets/comics-banner.jpg";
import batmanGif from "@/assets/batman-walking.gif";
import supermanGif from "@/assets/superman-pixel.gif";
import coverSuperman from "@/assets/cover-superman.jpg";
import coverWolverine from "@/assets/cover-wolverine.jpg";
import coverNaruto from "@/assets/cover-naruto.jpg";
import coverOnepiece from "@/assets/cover-onepiece.jpg";
import coverBatman from "@/assets/cover-batman.jpg";
import coverSpiderman from "@/assets/cover-spiderman.jpg";
import coverDragonball from "@/assets/cover-dragonball.jpg";
import coverHulk from "@/assets/cover-hulk.jpg";
import coverDemonslayer from "@/assets/cover-demonslayer.jpg";

const HQFLIX_URL = "https://hqflix.com.br/members?token=eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzdWFyaW9AcHJlbWl1bS5jb20iLCJwbGFubyI6InByZW1pdW0iLCJ0aXBvIjoidml0YWxpY2lvIiwiZGF0YUNvbXByYSI6IjIwMjUtMDktMTFUMDE6MTU6NDMuOTc5WiIsImlhdCI6MTc1NzU1MzM0MywiZXhwIjo0OTExMTUzMzQzLCJqdGkiOiJiMjc0OGI1Mi00ZTkxLTQ1NGUtYmMyMy1lOTViZDJmYmZlNTYiLCJpc3MiOiJtZW1iZXJzLWFyZWEtYXBwIiwiYXVkIjoibWVtYmVycy1hcmVhLXVzZXJzIn0.qNH2JaTa9Sx9aJp85fkzhyI4UwkpM0wvo6SIem7PkF0&utm_source=direto&src=direto&sck=1758050658799_17580506196762";

const COMICS_DATA = [
  { title: "Batman", cover: coverBatman, category: "DC" },
  { title: "Spider-Man", cover: coverSpiderman, category: "Marvel" },
  { title: "Superman", cover: coverSuperman, category: "DC" },
  { title: "Wolverine", cover: coverWolverine, category: "Marvel" },
  { title: "Hulk", cover: coverHulk, category: "Marvel" },
  { title: "Naruto", cover: coverNaruto, category: "Mangá" },
  { title: "One Piece", cover: coverOnepiece, category: "Mangá" },
  { title: "Dragon Ball", cover: coverDragonball, category: "Mangá" },
  { title: "Demon Slayer", cover: coverDemonslayer, category: "Mangá" },
];

const CATEGORIES = ["Todos", "Marvel", "DC", "Mangá"] as const;
type Category = typeof CATEGORIES[number];

const ComicsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todos");
  const { trackComicRead } = useAchievements();

  const filteredComics = useMemo(() => {
    if (selectedCategory === "Todos") return COMICS_DATA;
    return COMICS_DATA.filter(comic => comic.category === selectedCategory);
  }, [selectedCategory]);

  const openLibrary = () => {
    setIsOpen(true);
    trackComicRead();
  };

  const closeLibrary = () => {
    setIsOpen(false);
    setIsFullscreen(false);
  };

  return (
    <section className="relative py-12 px-4 overflow-hidden">
      {/* Background com estilo retro */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Preview de Capas Populares */}
        <ScrollReveal>
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="font-pixel text-lg sm:text-xl md:text-2xl text-primary neon-text mb-2">
                📚 QUADRINHOS POPULARES
              </h2>
              <p className="font-pixel text-[8px] sm:text-[10px] text-muted-foreground">
                ACESSO 100% GRATUITO
              </p>
            </div>

            {/* Filtros de Categoria */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Filter className="w-4 h-4 text-primary mr-1" />
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 font-pixel text-[8px] sm:text-[10px] border-2 rounded transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                      : "bg-background text-muted-foreground border-primary/30 hover:border-primary hover:text-primary"
                  }`}
                >
                  {category === "Marvel" && "🦸 "}
                  {category === "DC" && "🦇 "}
                  {category === "Mangá" && "🎌 "}
                  {category === "Todos" && "📚 "}
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
            
            {/* Grid de Capas */}
            <div className={`grid gap-3 sm:gap-4 ${
              filteredComics.length <= 3 
                ? "grid-cols-3 max-w-md mx-auto" 
                : filteredComics.length <= 6 
                  ? "grid-cols-3 sm:grid-cols-3 md:grid-cols-6 max-w-3xl mx-auto"
                  : "grid-cols-3 sm:grid-cols-3 md:grid-cols-9"
            }`}>
              {filteredComics.map((comic, i) => (
                <div 
                  key={i}
                  onClick={openLibrary}
                  className="group relative overflow-hidden rounded-lg border-2 border-primary/30 hover:border-primary transition-all duration-300 cursor-pointer hover:-translate-y-2"
                >
                  {/* Capa */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                    <img 
                      src={comic.cover}
                      alt={comic.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                  </div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent">
                    <span className={`inline-block rounded px-1.5 py-0.5 font-pixel text-[6px] mb-1 border ${
                      comic.category === "Marvel" 
                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                        : comic.category === "DC"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-pink-500/20 border-pink-500/50 text-pink-400"
                    }`}>
                      {comic.category}
                    </span>
                    <h3 className="font-pixel text-[8px] sm:text-[10px] text-foreground truncate">
                      {comic.title}
                    </h3>
                  </div>
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="absolute inset-0 border-2 border-primary/50 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Indicador de mais conteúdo */}
            <div className="text-center mt-4">
              <span className="font-pixel text-[8px] sm:text-[10px] text-primary animate-pulse">
                ✨ +100.000 TÍTULOS DISPONÍVEIS GRATUITAMENTE
              </span>
            </div>
          </div>
        </ScrollReveal>
        
        {/* Banner Promocional - Versão Gratuita */}
        <ScrollReveal>
          <div className="relative mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse" />
            <div className="relative bg-gradient-to-r from-background via-primary/5 to-background border-4 border-primary rounded-lg p-4 sm:p-6">
              {/* Decoração de cantos */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary" />
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                {/* Ícone animado */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 border-4 border-primary rounded-full flex items-center justify-center">
                    <Book className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-bounce" />
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="text-center sm:text-left">
                  <div className="font-pixel text-[10px] sm:text-xs text-muted-foreground mb-1">
                    🎮 100% GRATUITO
                  </div>
                  <h2 className="font-pixel text-lg sm:text-xl md:text-2xl text-primary neon-text mb-2">
                    +100K QUADRINHOS
                  </h2>
                  <p className="text-muted-foreground font-pixel text-[8px] sm:text-[10px]">
                    HQS, MANGÁS E MUITO MAIS
                  </p>
                </div>
                
                {/* Badge Gratuito */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg" />
                  <div className="relative bg-background border-4 border-primary rounded-lg px-6 py-3 text-center">
                    <div className="font-pixel text-3xl sm:text-4xl text-primary neon-text">GRÁTIS</div>
                    <div className="font-pixel text-[8px] text-accent mt-1 animate-pulse">
                      ✨ SEM CADASTRO
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['📖 HQs Marvel/DC', '🎌 Mangás', '🔞 +18', '🆕 Atualizações'].map((badge, i) => (
                  <span 
                    key={i}
                    className="bg-primary/10 border border-primary/30 rounded px-2 py-1 font-pixel text-[6px] sm:text-[8px] text-primary"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Banner ilustrativo */}
        <ScrollReveal>
          <div className="relative mb-8">
            {/* Batman GIF */}
            <img 
              src={batmanGif} 
              alt="Batman" 
              className="absolute left-0 sm:left-2 -top-12 sm:-top-14 md:-top-16 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 z-20 drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Superman GIF */}
            <img 
              src={supermanGif} 
              alt="Superman" 
              className="absolute right-0 sm:right-2 -top-12 sm:-top-14 md:-top-16 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 z-20 drop-shadow-[0_0_10px_rgba(0,100,255,0.5)]"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="relative rounded-lg overflow-hidden border-4 border-primary/50 hover:border-primary transition-colors cursor-pointer group" onClick={openLibrary}>
              <img 
                src={comicsBanner} 
                alt="Banner de Quadrinhos" 
                className="w-full h-48 sm:h-64 md:h-80 object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/90 px-6 py-3 rounded-full flex items-center gap-2">
                  <Book className="w-5 h-5 text-background" />
                  <span className="font-pixel text-[10px] text-background">ENTRAR NA BIBLIOTECA</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Botão principal */}
        <ScrollReveal>
          <div className="text-center">
            <button
              onClick={openLibrary}
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-pixel text-[10px] sm:text-xs border-4 border-primary hover:bg-primary/80 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]"
            >
              <Book className="w-5 h-5" />
              ACESSAR BIBLIOTECA GRÁTIS
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>
      </div>

      {/* Modal com iframe do HQFlix */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeLibrary()}>
        <DialogContent 
          className={`p-0 bg-background border-2 border-primary overflow-hidden ${
            isFullscreen 
              ? 'max-w-[100vw] w-[100vw] h-[100vh] rounded-none' 
              : 'max-w-6xl w-[95vw] h-[85vh]'
          }`}
        >
          <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-3 border-b-2 border-primary/50 bg-background shrink-0">
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-primary" />
                <h3 className="font-pixel text-[10px] sm:text-xs text-primary">
                  📚 +100K QUADRINHOS E MANGÁS - GRÁTIS
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-primary/20 rounded transition-colors"
                  title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-primary" />
                  )}
                </button>
                <button
                  onClick={closeLibrary}
                  className="p-2 hover:bg-primary/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-black/20">
              <iframe
                src={HQFLIX_URL}
                className="w-full h-full border-0"
                title="Biblioteca de Quadrinhos - HQFlix"
                allow="fullscreen"
                loading="lazy"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ComicsSection;
