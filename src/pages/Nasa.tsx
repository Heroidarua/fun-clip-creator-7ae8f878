import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import ServiceEditorialContent from "@/components/ServiceEditorialContent";

const Nasa = () => {
  return (
    <main className="bg-background text-foreground">
      <iframe
        src="https://eyes.nasa.gov/apps/earth/#/satellites?rate=1"
        title="NASA Eyes on the Earth — Satellites"
        allowFullScreen
        style={{
          display: "block",
          width: "100%",
          height: "100vh",
          border: 0,
          background: "#000",
          zIndex: 9999,
        }}
      />
      <ServiceEditorialContent
        title="Explore satélites e a Terra com a NASA"
        paragraphs={[
          "A página NASA do SOS01 incorpora o Eyes on the Earth, uma experiência oficial que apresenta a Terra em três dimensões e permite acompanhar missões e satélites de observação. Ela é indicada para estudantes, professores, curiosos por ciência e qualquer pessoa interessada em entender como instrumentos espaciais ajudam a observar o planeta. A visualização e os dados vêm da NASA; o SOS01 apenas oferece um caminho direto para abrir a experiência no navegador, sem alterar as informações apresentadas.",
          "Use o mouse, o toque ou os controles exibidos pela aplicação para girar o globo, aproximar regiões e selecionar satélites. Os elementos disponíveis podem incluir órbitas, missões e camadas relacionadas à observação terrestre. Como se trata de uma experiência tridimensional, o carregamento pode exigir mais memória e processamento do aparelho. Se a tela ficar lenta, feche outras abas, reduza o número de elementos ativos ou recarregue a página em uma conexão estável. O botão discreto “Sair” retorna ao SOS01.",
          "As posições e visualizações servem principalmente para exploração educativa e podem combinar dados observados, modelos e animações. Elas não devem substituir fontes especializadas em decisões de navegação, segurança ou previsão imediata. Para aprofundar um assunto, consulte as explicações e páginas de cada missão dentro do ambiente oficial da NASA. No SOS01, você também encontra experiências relacionadas a céu, raios, terremotos, aviões e navios, além de ferramentas gratuitas para tarefas cotidianas, todas acessíveis separadamente pelo navegador. A fonte original continua sendo a referência para detalhes científicos e atualizações das missões.",
        ]}
        currentPath="/nasa"
        currentLabel="NASA"
        links={[
          { label: "Ver o céu", to: "/ferramenta/ceu" },
          { label: "Rastreador de terremotos", to: "/ferramenta/terremotos" },
          { label: "Rastreador de aviões", to: "/ferramenta/avioes" },
          { label: "Todas as ferramentas", to: "/ferramentas" },
        ]}
      />
      <Link
        to="/"
        aria-label="Voltar para a página inicial do SOS/01"
        title="Sair · SOS/01"
        className="nasa-exit-btn"
      >
        <Home size={16} aria-hidden />
        <span className="nasa-exit-label">Sair · SOS/01</span>
      </Link>
      <style>{`
        :root {
          --nasa-safe-top: env(safe-area-inset-top, 0px);
          --nasa-safe-right: env(safe-area-inset-right, 0px);
          --nasa-safe-bottom: env(safe-area-inset-bottom, 0px);
          --nasa-safe-left: env(safe-area-inset-left, 0px);
          /* Extra offset to clear native browser chrome (URL bar, status bar) */
          --nasa-chrome-offset: 14px;
        }
        .nasa-exit-btn {
          position: fixed;
          left: calc(var(--nasa-safe-left) + var(--nasa-chrome-offset));
          bottom: calc(var(--nasa-safe-bottom) + var(--nasa-chrome-offset));
          z-index: 10000;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: 38px;
          height: 38px;
          padding: 0;
          border-radius: 999px;
          background: rgba(10, 14, 28, 0.55);
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          text-decoration: none;
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 4px 16px -4px rgba(0,0,0,0.6);
          overflow: hidden;
          justify-content: center;
          opacity: 0.55;
          transition: opacity .25s ease, width .3s ease, background .25s ease, padding .3s ease;
        }
        .nasa-exit-btn:hover, .nasa-exit-btn:focus-visible {
          opacity: 1;
          width: 138px;
          padding: 0 14px;
          justify-content: flex-start;
          background: linear-gradient(135deg, rgba(40,182,255,0.85), rgba(182,109,255,0.85));
        }
        .nasa-exit-label {
          opacity: 0;
          max-width: 0;
          white-space: nowrap;
          transition: opacity .2s ease, max-width .3s ease;
        }
        .nasa-exit-btn:hover .nasa-exit-label,
        .nasa-exit-btn:focus-visible .nasa-exit-label {
          opacity: 1;
          max-width: 120px;
        }
        @media (max-width: 640px) {
          .nasa-exit-btn {
            opacity: 0.7;
            width: 36px;
            height: 36px;
            /* On mobile, keep clear of NASA's bottom toolbar by sitting just above safe-area */
            left: calc(var(--nasa-safe-left) + 12px);
            bottom: calc(var(--nasa-safe-bottom) + 18px);
          }
        }
        /* Landscape phones: notch on the side, top bar shorter */
        @media (max-width: 900px) and (orientation: landscape) {
          .nasa-exit-btn {
            left: calc(var(--nasa-safe-left) + 14px);
            bottom: calc(var(--nasa-safe-bottom) + 10px);
          }
        }
        /* PWA / standalone display — no browser chrome, can sit closer to edge */
        @media (display-mode: standalone) {
          .nasa-exit-btn {
            left: calc(var(--nasa-safe-left) + 8px);
            bottom: calc(var(--nasa-safe-bottom) + 8px);
          }
        }
      `}</style>
    </main>
  );
};

export default Nasa;