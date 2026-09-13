import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Tv, ArrowLeft, ExternalLink } from "lucide-react";
import ServiceEditorialContent from "@/components/ServiceEditorialContent";

const PLUTO_URL = "https://pluto.tv/br/live-tv/655e5c4d2c46f3000877a54b";

export default function Iptv() {
  useEffect(() => {
    window.location.replace(PLUTO_URL);
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div
        className="max-w-md w-full text-center p-8 sm:p-10 rounded-2xl border-2 border-[#28B6FF]/60 bg-[#0E4A7B]/40 backdrop-blur"
        style={{ boxShadow: "0 0 32px rgba(40,182,255,0.35), inset 0 0 24px rgba(182,109,255,0.15)" }}
      >
        <div
          className="mx-auto w-20 h-20 rounded-2xl border-2 border-[#28B6FF] flex items-center justify-center mb-5"
          style={{ boxShadow: "0 0 24px rgba(40,182,255,0.6)" }}
        >
          <Tv className="w-10 h-10 text-[#28B6FF]" aria-hidden="true" />
        </div>
        <h1
          className="text-3xl sm:text-4xl text-[#F5F9FF] mb-3"
          style={{ fontFamily: "'VT323', monospace", textShadow: "0 0 10px rgba(40,182,255,0.7)" }}
        >
          IPTV — Pluto TV
        </h1>
        <p className="text-[#E8EEF5]/80 text-sm mb-7 leading-relaxed">
          Redirecionando você para a Pluto TV. Se nada acontecer em alguns segundos, use o botão abaixo.
        </p>
        <a
          href={PLUTO_URL}
          rel="noopener nofollow"
          className="btn-3d inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#FFD93D] text-[#0E4A7B] font-silkscreen uppercase tracking-wider text-base hover:brightness-110 transition-all"
        >
          <ExternalLink className="w-5 h-5" aria-hidden="true" />
          Abrir Pluto TV
        </a>
        <Link
          to="/"
          className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-silkscreen uppercase tracking-wider text-[#28B6FF] hover:text-[#B66DFF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Voltar ao SOS01
        </Link>
      </div>
      <ServiceEditorialContent
        title="Como assistir à Pluto TV pelo SOS01"
        paragraphs={[
          "A página IPTV do SOS01 oferece um caminho simples para acessar a programação gratuita da Pluto TV no Brasil. O serviço reúne canais ao vivo organizados por temas e uma seleção de filmes, séries, desenhos, documentários e programas sob demanda. O acesso acontece no site oficial da plataforma, sem que o SOS01 solicite cadastro, senha ou dados de pagamento. A disponibilidade de canais e títulos pode mudar conforme decisões da própria Pluto TV, a região do visitante e os direitos de exibição de cada conteúdo.",
          "Ao abrir esta página, o navegador encaminha você para a experiência oficial da Pluto TV. Caso o redirecionamento automático não aconteça, o botão “Abrir Pluto TV” faz o mesmo percurso manualmente. Depois, basta escolher um canal da grade ao vivo ou procurar um título no catálogo disponível. Uma conexão estável ajuda a reduzir pausas durante a reprodução. O SOS01 funciona apenas como atalho de acesso e não hospeda, retransmite ou controla os vídeos exibidos pelo serviço externo.",
          "IPTV é uma forma de distribuir programação de televisão pela internet, mas isso não significa que toda lista encontrada online seja autorizada. Nesta página, o destino é uma plataforma oficial e gratuita, que exibe publicidade para financiar o catálogo. Evite informar credenciais em páginas desconhecidas ou instalar arquivos prometendo liberar canais pagos. Para outras atividades no navegador, você também pode conhecer os jogos gratuitos, explorar a visualização da Terra da NASA ou usar as ferramentas online reunidas pelo SOS01. O catálogo pode ser consultado em computadores, celulares e tablets compatíveis.",
        ]}
        currentPath="/iptv"
        currentLabel="Pluto TV"
        links={[
          { label: "IPTV 1.0", to: "/player" },
          { label: "Jogos online", to: "/jogos" },
          { label: "NASA em tempo real", to: "/nasa" },
          { label: "Todas as ferramentas", to: "/ferramentas" },
        ]}
      />
    </main>
  );
}
