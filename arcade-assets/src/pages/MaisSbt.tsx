import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Tv, ArrowLeft, ExternalLink } from "lucide-react";
import ServiceEditorialContent from "@/components/ServiceEditorialContent";
import LegalNotice from "@/components/LegalNotice";

const SBT_URL = "https://mais.sbt.com.br/";

export default function MaisSbt() {
  // Redirect in the same tab so Google OAuth login works (Google blocks iframes,
  // and new tabs get blocked by pop-up blockers / lose user gesture context).
  useEffect(() => {
    window.location.replace(SBT_URL);
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
          +SBT
        </h1>
        <p className="text-[#E8EEF5]/80 text-sm mb-7 leading-relaxed">
          Redirecionando você para o +SBT. Se nada acontecer em alguns segundos, use o botão abaixo.
        </p>
        <LegalNotice kind="video" />
        <a
          href={SBT_URL}
          rel="noopener nofollow"
          className="btn-3d inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#FFD93D] text-[#0E4A7B] font-silkscreen uppercase tracking-wider text-base hover:brightness-110 transition-all"
        >
          <ExternalLink className="w-5 h-5" aria-hidden="true" />
          Abrir +SBT
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
        title="Como acessar o +SBT pelo SOS01"
        paragraphs={[
          "O +SBT é a plataforma digital oficial do SBT para assistir a uma seleção de programas, novelas, séries, desenhos e transmissões disponibilizadas pela emissora. Esta página do SOS01 funciona como um acesso rápido ao serviço, útil para quem quer chegar ao catálogo sem procurar o endereço em mecanismos de busca. O conteúdo, a programação e as condições de acesso são definidos pelo próprio +SBT e podem variar ao longo do tempo ou conforme a localização do visitante.",
          "Ao entrar nesta página, você é encaminhado para o endereço oficial do +SBT na mesma aba. Essa escolha permite que etapas de identificação oferecidas pela plataforma funcionem corretamente e evita bloqueios comuns de janelas ou conteúdos incorporados. Se o encaminhamento não ocorrer, use o botão “Abrir +SBT”. No destino, escolha o conteúdo disponível e siga as orientações exibidas pelo serviço. O SOS01 não pede sua senha, não recebe os dados da conta e não hospeda os vídeos apresentados.",
          "Para uma navegação segura, confira sempre o endereço do site antes de fornecer qualquer informação pessoal. A disponibilidade gratuita de episódios, canais e transmissões depende das regras e licenças da plataforma oficial. Alguns títulos podem exigir identificação, conter publicidade ou sair do catálogo sem aviso ao SOS01. Se você procura outras opções gratuitas, explore também o acesso à Pluto TV, os jogos online e as ferramentas para tarefas rápidas. Assim, cada recurso continua separado e você escolhe somente o serviço de que precisa. O acesso funciona em navegadores modernos de celulares, tablets e computadores, sem instalação adicional.",
        ]}
        currentPath="/mais-sbt"
        currentLabel="+SBT"
        links={[
          { label: "Pluto TV", to: "/iptv" },
          { label: "IPTV 1.0", to: "/player" },
          { label: "Jogos online", to: "/jogos" },
          { label: "Todas as ferramentas", to: "/ferramentas" },
        ]}
      />
    </main>
  );
}
