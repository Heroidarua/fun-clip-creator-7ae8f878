import { useState } from "react";
import { Share2, ChevronDown, ChevronUp, Joystick, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import developerPhoto from "@/assets/developer-photo.jpg";
const Footer = () => {
  const [faqOpen, setFaqOpen] = useState(false);
  const [comoUsarOpen, setComoUsarOpen] = useState(false);
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "sos01.com.br - Plataforma de Utilidades Digitais",
          text: "Ferramentas digitais sos01, entretenimento e jogos clássicos - tudo em um só lugar!",
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copiado para a área de transferência!");
    }
  };

  const faqItems = [
    {
      question: "O sos01.com.br é seguro?",
      answer: "Sim! Não armazenamos dados pessoais nem conteúdos de mídia. Sua navegação é privada e anônima."
    },
    {
      question: "Preciso pagar para usar?",
      answer: "Não! Todas as ferramentas, jogos e a biblioteca de quadrinhos são 100% gratuitos. Sem assinatura, sem cadastro."
    },
    {
      question: "O site funciona no celular?",
      answer: "Sim! A plataforma foi otimizada para funcionar perfeitamente em celulares, tablets e computadores."
    },
    {
      question: "O sos01.com.br armazena conteúdo?",
      answer: "Não. O sos01.com.br não hospeda ou armazena qualquer conteúdo de terceiros. Apenas fornecemos ferramentas técnicas do sos01.com.br."
    }
  ];

  const comoUsarSteps = [
    "Escolha a plataforma desejada (TikTok, Instagram, Kwai ou YouTube).",
    "Cole o link do vídeo no campo correspondente.",
    "Clique em 'Buscar' para localizar o conteúdo.",
    "Baixe o vídeo em HD ou extraia apenas o áudio MP3."
  ];

  return (
    <footer className="bg-gradient-arcade border-t-4 border-primary/50 relative overflow-hidden">
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-10"></div>
      
      {/* Arcade glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
      
      <div className="container mx-auto px-4 py-10 sm:py-12 relative z-10">
        {/* Aviso Legal Destacado */}
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-muted-foreground font-orbitron leading-relaxed">
              <strong className="text-foreground">Aviso Legal:</strong> O sos01.com.br não hospeda, armazena ou distribui conteúdo. A plataforma sos01 oferece ferramentas para acesso a conteúdos publicamente disponíveis na internet. O usuário é o único responsável por garantir que possui os direitos necessários sobre qualquer conteúdo utilizado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center shadow-[3px_3px_0_hsl(var(--accent))] border border-foreground/20">
                <Joystick className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-[10px] text-primary">SOS</span>
                <span className="font-pixel text-[10px] text-[hsl(var(--accent))]">01</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed font-orbitron">
              Plataforma 100% gratuita de utilidades digitais: downloads de vídeos, ferramentas com IA, jogos clássicos e quadrinhos.
            </p>
          </div>

          {/* Links Úteis */}
          <div className="md:col-span-1">
            <h3 className="font-pixel text-[10px] text-primary mb-4">NAVEGAÇÃO</h3>
            <div className="space-y-3">
              <Link to="/blog" className="block text-muted-foreground hover:text-primary transition-colors text-sm font-orbitron">
                Blog
              </Link>
              <Link to="/sobre" className="block text-muted-foreground hover:text-primary transition-colors text-sm font-orbitron">
                Sobre Nós
              </Link>
              
              <Collapsible open={comoUsarOpen} onOpenChange={setComoUsarOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-muted-foreground hover:text-primary transition-colors text-sm text-left font-orbitron">
                  Como Usar
                  {comoUsarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 border-l-2 border-primary/30 pl-3">
                  {comoUsarSteps.map((step, index) => (
                    <p key={index} className="text-xs text-muted-foreground/80 font-orbitron">
                      <span className="text-primary font-pixel text-[8px] mr-2">{String(index + 1).padStart(2, '0')}</span>
                      {step}
                    </p>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={faqOpen} onOpenChange={setFaqOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-muted-foreground hover:text-primary transition-colors text-sm text-left font-orbitron">
                  FAQ
                  {faqOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-3 border-l-2 border-primary/30 pl-3">
                  {faqItems.map((item, index) => (
                    <div key={index}>
                      <p className="text-xs font-medium text-foreground font-orbitron">{item.question}</p>
                      <p className="text-xs text-muted-foreground/80 mt-1 font-orbitron">{item.answer}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h3 className="font-pixel text-[10px] text-[hsl(var(--accent))] mb-4">LEGAL</h3>
            <div className="space-y-3">
              <Link to="/termos" className="block text-muted-foreground hover:text-primary transition-colors text-sm font-orbitron">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="block text-muted-foreground hover:text-primary transition-colors text-sm font-orbitron">
                Política de Privacidade
              </Link>
              <Link to="/dmca" className="block text-muted-foreground hover:text-primary transition-colors text-sm font-orbitron">
                Política DMCA
              </Link>
              <Link to="/contato" className="block text-muted-foreground hover:text-primary transition-colors text-sm font-orbitron">
                Contato
              </Link>
            </div>
          </div>

          {/* Compartilhar */}
          <div className="md:col-span-1">
            <h3 className="font-pixel text-[10px] text-[hsl(var(--retro-cyan))] mb-4">SHARE</h3>
            <Button 
              onClick={handleShare}
              variant="outline" 
              size="sm"
              className="w-full border-2 border-primary/50 hover:border-primary bg-transparent hover:bg-primary/10 font-pixel text-[10px] rounded-sm shadow-[3px_3px_0_hsl(var(--primary)/0.3)] hover:shadow-[1px_1px_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Share2 size={14} className="mr-2" />
              COMPARTILHAR
            </Button>
          </div>
        </div>

        <div className="border-t-2 border-primary/20 mt-8 pt-8">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground text-sm font-orbitron">
              © 2025 sos01.com.br. Todos os direitos reservados.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2 font-orbitron text-center max-w-2xl">
              Plataforma de utilidades digitais. Todo conteúdo acessado permanece de propriedade de seus respectivos criadores.
            </p>

            {/* Developer Credit with Photo */}
            <div className="flex items-center gap-3 mt-4 px-4 py-2 bg-card/50 border-2 border-primary/20 rounded-sm">
              <div className="relative w-8 h-8">
                <img 
                  src={developerPhoto} 
                  alt="Avatar de Matheus Marinho, criador da plataforma SOS01" loading="lazy" decoding="async"
                  className="w-full h-full object-cover rounded-sm border-2 border-primary/50"
                />
                <div className="absolute inset-0 scanlines opacity-20 pointer-events-none rounded-sm"></div>
              </div>
              <p className="text-xs font-orbitron">
                Desenvolvido por <span className="font-pixel text-[10px] text-primary">Matheus Marinho</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
