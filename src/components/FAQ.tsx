import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FreeFlash from "@/components/FreeFlash";

const FAQ = () => {
  const faqs = [
    {
      question: "O que é o SOS01.com.br?",
      answer: "O SOS01.com.br é uma plataforma 100% gratuita de utilidades digitais que oferece ferramentas para download de vídeos sos01, biblioteca de quadrinhos e mangás, jogos clássicos retrô e utilitários com inteligência artificial — tudo sem cadastro e sem custos."
    },
    {
      question: "Como funcionam as ferramentas de mídia?",
      answer: "Nossas ferramentas processam URLs de conteúdos públicos. Cole o link no campo apropriado, clique em 'Procurar' e, se disponível, poderá acessar o conteúdo. Importante: o usuário é responsável por garantir que possui os direitos necessários sobre qualquer conteúdo."
    },
    {
      question: "O sos01 armazena conteúdos?",
      answer: "Não. O sos01 não hospeda, armazena ou distribui qualquer conteúdo de mídia. Nossa plataforma atua exclusivamente como uma interface técnica para acessar conteúdos públicos de terceiros."
    },
    {
      question: "Como funciona o Gerador de Avatar Pixelado?",
      answer: "O Gerador de Avatar Pixelado usa inteligência artificial para criar avatares em estilo pixel art. Escolha um personagem famoso como template ou personalize do zero selecionando estilo, cor, expressão, acessórios e muito mais. A IA gera uma imagem única que você pode baixar ou compartilhar."
    },
    {
      question: "Os avatares gerados são gratuitos?",
      answer: "Sim! O Gerador de Avatar Pixelado é totalmente gratuito. Você pode criar quantos avatares quiser, salvá-los na galeria local e compartilhá-los em diversas redes sociais."
    },
    {
      question: "Como usar o Conversor MP4 para MP3?",
      answer: "Selecione um arquivo de vídeo MP4 do seu dispositivo e nossa ferramenta extrairá automaticamente o áudio em formato MP3. O processamento é feito localmente no seu navegador, garantindo privacidade."
    },
    {
      question: "Como funciona o Encurtador de URL?",
      answer: "Cole qualquer URL longa no campo e nossa ferramenta gerará um link curto e fácil de compartilhar. Os links encurtados são permanentes e rastreáveis."
    },
    {
      question: "O Removedor de Fundo usa IA?",
      answer: "Sim! O Removedor de Fundo utiliza inteligência artificial avançada para detectar e remover automaticamente o fundo de suas imagens, deixando apenas o objeto principal com transparência."
    },
    {
      question: "Para que serve o Gerador de Thumbnails?",
      answer: "O Gerador de Thumbnails permite criar miniaturas profissionais para seus vídeos do YouTube, redes sociais e outros projetos. Adicione texto, ajuste cores e exporte em tamanhos otimizados."
    },
    {
      question: "Como criar um QR Code personalizado?",
      answer: "Digite a URL ou texto desejado, escolha as cores e tamanho, e nosso gerador criará um QR Code único. Você pode baixar a imagem e usar onde quiser."
    },
    {
      question: "O que faz a ferramenta Marca D'Água?",
      answer: "A ferramenta de Marca D'Água permite adicionar texto ou logo sobre suas imagens para proteger seus direitos autorais ou adicionar branding. Ajuste posição, opacidade e estilo da marca."
    },
    {
      question: "Como usar o Gerador de Senhas?",
      answer: "Defina o comprimento desejado e escolha quais tipos de caracteres incluir (letras, números, símbolos). A ferramenta gera senhas fortes e aleatórias instantaneamente."
    },
    {
      question: "Como acessar a biblioteca de quadrinhos?",
      answer: "A biblioteca de quadrinhos e mangás é 100% gratuita! Basta acessar a seção de Quadrinhos na página principal, escolher uma categoria (Marvel, DC ou Mangá) e clicar para abrir a biblioteca completa. Não precisa de cadastro nem assinatura."
    },
    {
      question: "Quais conteúdos estão na biblioteca de quadrinhos?",
      answer: "Nossa biblioteca conta com mais de 100 mil HQs e mangás organizados por categorias, incluindo super-heróis Marvel e DC, mangás populares como One Piece, Naruto e Dragon Ball, além de quadrinhos brasileiros. Tudo gratuito e sem limite de leitura."
    },
    {
      question: "A biblioteca de quadrinhos sos01 é realmente gratuita?",
      answer: "Sim! A biblioteca de quadrinhos e mangás do sos01.com.br é 100% gratuita. Não cobramos nenhuma assinatura ou taxa. Você pode ler quantos quadrinhos quiser, quando quiser, sem pagar nada no sos01."
    },
    {
      question: "Preciso respeitar direitos autorais?",
      answer: "Sim. Todos os conteúdos acessados através do sos01 mantêm os direitos autorais de seus criadores originais. O usuário é responsável por utilizar os conteúdos em conformidade com as leis de propriedade intelectual e dar os devidos créditos aos criadores."
    },
    {
      question: "É legal usar o sos01?",
      answer: "O sos01 oferece ferramentas legais para acesso a conteúdos públicos. No entanto, a responsabilidade pelo uso adequado é do usuário. Recomendamos utilizar apenas conteúdos sobre os quais você possua direitos ou autorização."
    },
    {
      question: "Quais jogos estão disponíveis?",
      answer: "Disponibilizamos uma seleção de jogos clássicos que rodam diretamente no navegador, oferecendo uma experiência nostálgica e gratuita."
    },
    {
      question: "O site funciona em dispositivos móveis?",
      answer: "Sim. A plataforma foi desenvolvida para funcionar de forma otimizada em celulares, tablets e computadores."
    },
    {
      question: "Preciso instalar algum aplicativo?",
      answer: "Não é necessário instalar nada. Todas as funcionalidades estão disponíveis diretamente no navegador web."
    },
    {
      question: "Como reportar violação de direitos autorais?",
      answer: "Se você é detentor de direitos autorais e acredita que houve uso inadequado, consulte nossa Política DMCA e envie uma notificação formal para contatosos01@gmail.com."
    },
    {
      question: "Vocês coletam dados pessoais?",
      answer: "O sos01 foi projetado com privacidade em mente. Não coletamos dados pessoais durante o uso regular das ferramentas. Para mais detalhes, consulte nossa Política de Privacidade."
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-background relative overflow-hidden">
      {/* Retro corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary/30"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary/30"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary/30"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary/30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-pixel text-lg sm:text-xl md:text-2xl mb-4 text-[hsl(var(--retro-cyan))] neon-text">
            FAQ
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 sm:w-12 h-1 bg-[hsl(var(--retro-cyan))]"></div>
            <div className="w-3 h-3 bg-[hsl(var(--retro-cyan))] rotate-45"></div>
            <div className="w-8 sm:w-12 h-1 bg-[hsl(var(--retro-cyan))]"></div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-orbitron">
            Perguntas Frequentes
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card/60 border-2 border-border hover:border-primary/50 rounded-sm overflow-hidden transition-all duration-300"
              >
                <AccordionTrigger className="px-4 sm:px-6 py-4 text-left text-foreground hover:text-primary font-orbitron text-sm sm:text-base hover:no-underline group">
                  <span className="flex items-center gap-3">
                    <span className="font-pixel text-[10px] text-primary opacity-60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-4 text-muted-foreground leading-relaxed text-sm font-orbitron border-t border-border/50">
                  <div className="pt-4">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        {/* Flash running below FAQ */}
        <div className="relative h-16 mt-8">
          <FreeFlash />
        </div>
      </div>
    </section>
  );
};

export default FAQ;
