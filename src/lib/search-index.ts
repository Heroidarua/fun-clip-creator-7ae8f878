/**
 * Índice de busca interna do SOS01.
 * Reúne ferramentas, categorias, artigos do blog e páginas institucionais
 * em uma única lista pesquisável — usada tanto na UI quanto na página /busca.
 */
import { TOOLS_SEO, TOOL_CATEGORIES, toolPath, categoryPath } from "@/config/seo";

export type SearchEntryType = "ferramenta" | "categoria" | "artigo" | "pagina";

export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  path: string;
  type: SearchEntryType;
  keywords: string[];
};

const STATIC_PAGES: SearchEntry[] = [
  { id: "p-ferramentas", title: "Todas as ferramentas", description: "Catálogo completo de utilitários gratuitos online.", path: "/ferramentas", type: "pagina", keywords: ["ferramentas", "utilitarios", "catalogo"] },
  { id: "p-jogos", title: "Jogos retrô grátis", description: "Clássicos jogáveis direto no navegador, sem instalar nada.", path: "/jogos", type: "pagina", keywords: ["jogos", "retro", "games", "emulador"] },
  { id: "p-jogos-java", title: "Jogos Java", description: "Coleção de jogos Java antigos para jogar online.", path: "/jogos-java", type: "pagina", keywords: ["java", "j2me", "celular antigo"] },
  { id: "p-nasa", title: "NASA ao vivo", description: "Imagens de satélites e transmissões da NASA em tempo real.", path: "/nasa", type: "pagina", keywords: ["nasa", "espaco", "satelite", "terra"] },
  { id: "p-sbt", title: "+SBT", description: "Assista à programação do +SBT gratuitamente.", path: "/mais-sbt", type: "pagina", keywords: ["sbt", "tv", "ao vivo", "novela"] },
  { id: "p-iptv", title: "Pluto TV", description: "Canais gratuitos de TV pela internet.", path: "/iptv", type: "pagina", keywords: ["iptv", "pluto", "canais", "tv gratis"] },
  { id: "p-player", title: "IPTV 1.0", description: "Player de canais e mídia premium.", path: "/player", type: "pagina", keywords: ["player", "iptv", "canais", "filmes"] },
  { id: "p-blog", title: "Blog", description: "Guias, tutoriais e novidades sobre downloads e ferramentas.", path: "/blog", type: "pagina", keywords: ["blog", "guias", "tutoriais"] },
  { id: "p-como-usar", title: "Como usar o SOS01", description: "Passo a passo para aproveitar todos os recursos da plataforma.", path: "/como-usar", type: "pagina", keywords: ["ajuda", "tutorial", "como usar"] },
  { id: "p-precos", title: "Por que é grátis", description: "Como o SOS01 se mantém: doações voluntárias, sem planos.", path: "/precos", type: "pagina", keywords: ["gratis", "doacao", "pix"] },
  { id: "p-sobre", title: "Sobre nós", description: "Quem somos e o que move o SOS01.", path: "/sobre", type: "pagina", keywords: ["sobre", "equipe", "historia"] },
  { id: "p-contato", title: "Contato", description: "Fale com a equipe do SOS01.", path: "/contato", type: "pagina", keywords: ["contato", "suporte", "email"] },
  { id: "p-privacidade", title: "Política de privacidade", description: "Como tratamos seus dados.", path: "/privacidade", type: "pagina", keywords: ["privacidade", "lgpd", "dados"] },
  { id: "p-termos", title: "Termos de uso", description: "Regras de utilização da plataforma.", path: "/termos", type: "pagina", keywords: ["termos", "uso", "regras"] },
  { id: "p-dmca", title: "DMCA", description: "Política de direitos autorais e remoção de conteúdo.", path: "/dmca", type: "pagina", keywords: ["dmca", "direitos autorais", "copyright"] },
];

const ARTICLES: SearchEntry[] = [
  { id: "a-yt", title: "Como baixar vídeos do YouTube", description: "Guia completo para salvar vídeos do YouTube com qualidade.", path: "/blog/como-baixar-videos-youtube", type: "artigo", keywords: ["youtube", "baixar", "download", "mp4"] },
  { id: "a-tiktok", title: "Como baixar vídeos do TikTok sem marca d'água", description: "Passo a passo para baixar TikToks limpos.", path: "/blog/como-baixar-videos-tiktok-sem-marca", type: "artigo", keywords: ["tiktok", "sem marca dagua", "download"] },
  { id: "a-tiktok-audio", title: "Como extrair áudio do TikTok", description: "Transforme vídeos do TikTok em MP3.", path: "/blog/como-extrair-audio-tiktok", type: "artigo", keywords: ["tiktok", "audio", "mp3"] },
  { id: "a-kwai", title: "Como baixar vídeos do Kwai", description: "Salve vídeos do Kwai no celular ou computador.", path: "/blog/como-baixar-videos-kwai", type: "artigo", keywords: ["kwai", "download", "video"] },
  { id: "a-downloaders", title: "Como usar os downloaders", description: "Tudo sobre os downloaders do SOS01.", path: "/blog/como-usar-downloaders", type: "artigo", keywords: ["downloader", "instagram", "facebook", "pinterest"] },
  { id: "a-ferramentas", title: "Ferramentas gratuitas indispensáveis", description: "Seleção de utilitários online que economizam tempo.", path: "/blog/ferramentas-gratuitas", type: "artigo", keywords: ["ferramentas", "gratis", "produtividade"] },
  { id: "a-jogos", title: "Jogos retrô grátis online", description: "Os melhores clássicos para jogar no navegador.", path: "/blog/jogos-retro-gratis", type: "artigo", keywords: ["jogos", "retro", "online"] },
  { id: "a-quadrinhos", title: "Biblioteca de quadrinhos", description: "Onde ler quadrinhos clássicos gratuitamente.", path: "/blog/biblioteca-quadrinhos", type: "artigo", keywords: ["quadrinhos", "hq", "leitura"] },
  { id: "a-dicas", title: "Dicas para criadores de conteúdo", description: "Boas práticas para produzir e publicar mais rápido.", path: "/blog/dicas-criadores-conteudo", type: "artigo", keywords: ["criadores", "conteudo", "dicas"] },
  { id: "a-guia", title: "Guia completo do SOS01", description: "Todos os recursos da plataforma explicados.", path: "/blog/guia-completo-clipsave", type: "artigo", keywords: ["guia", "sos01", "recursos"] },
  { id: "a-origem", title: "Como nasceu o SOS01", description: "A história por trás do projeto.", path: "/blog/como-nasceu-clipsave", type: "artigo", keywords: ["historia", "sobre", "projeto"] },
];

export const SEARCH_INDEX: SearchEntry[] = [
  ...TOOLS_SEO.map<SearchEntry>((tool) => ({
    id: `t-${tool.slug}`,
    title: tool.name,
    description: tool.description,
    path: toolPath(tool.slug),
    type: "ferramenta",
    keywords: [...tool.keywords, tool.h1, tool.intro],
  })),
  ...TOOL_CATEGORIES.map<SearchEntry>((category) => ({
    id: `c-${category.id}`,
    title: category.title,
    description: category.description,
    path: categoryPath(category.id),
    type: "categoria",
    keywords: [category.label, category.id],
  })),
  ...ARTICLES,
  ...STATIC_PAGES,
];

/** Remove acentos e normaliza para comparação. */
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const TYPE_BOOST: Record<SearchEntryType, number> = {
  ferramenta: 3,
  categoria: 2,
  artigo: 1,
  pagina: 1,
};

export type SearchResult = SearchEntry & { score: number };

/** Busca simples por termos, com pontuação por título, descrição e palavras-chave. */
export function searchSite(query: string, limit = 30): SearchResult[] {
  const terms = normalize(query).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];

  const results: SearchResult[] = [];

  for (const entry of SEARCH_INDEX) {
    const title = normalize(entry.title);
    const description = normalize(entry.description);
    const keywords = normalize(entry.keywords.join(" "));

    let score = 0;
    let matchedAll = true;

    for (const term of terms) {
      let termScore = 0;
      if (title.startsWith(term)) termScore += 12;
      else if (title.includes(term)) termScore += 8;
      if (keywords.includes(term)) termScore += 5;
      if (description.includes(term)) termScore += 3;
      if (termScore === 0) matchedAll = false;
      score += termScore;
    }

    if (!matchedAll || score === 0) continue;
    results.push({ ...entry, score: score + TYPE_BOOST[entry.type] });
  }

  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

/** Sugestões populares exibidas quando a busca está vazia. */
export const POPULAR_QUERIES = [
  "qr code",
  "mp3",
  "remover fundo",
  "pdf",
  "senha",
  "tradutor",
  "ocr",
  "jogos",
] as const;
