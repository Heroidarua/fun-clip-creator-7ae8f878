import { useLocation, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/** Ferramentas mais procuradas — mantém o visitante no site em vez de perdê-lo. */
const TOP_TOOLS = [
  { slug: "gerador-qrcode", name: "Gerador de QR Code" },
  { slug: "conversor-mp4-mp3", name: "Conversor MP4 → MP3" },
  { slug: "removedor-de-fundo", name: "Removedor de Fundo" },
  { slug: "gerador-de-senha", name: "Gerador de Senha" },
  { slug: "imagem-para-pdf", name: "Imagem para PDF" },
  { slug: "tradutor", name: "Tradutor" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-2xl w-full">
          <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Página não encontrada</p>
          <p className="text-muted-foreground mb-8">A página que você está procurando não existe ou foi movida.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
            {TOP_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                to="/ferramenta/$slug"
                params={{ slug: tool.slug }}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {tool.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Voltar para Home
            </Link>
            <Link
              to="/ferramentas"
              className="inline-flex items-center justify-center px-6 py-3 border border-border font-medium rounded-lg hover:border-primary transition-colors"
            >
              Ver todas as ferramentas
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
