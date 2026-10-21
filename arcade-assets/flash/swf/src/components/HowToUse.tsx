import { Clipboard, Link, Download } from "lucide-react";

const HowToUse = () => {
  const steps = [
    {
      icon: Clipboard,
      title: "COPIE O LINK",
      description: "Acesse TikTok ou Instagram e copie o link do vídeo",
      number: "01"
    },
    {
      icon: Link,
      title: "COLE AQUI",
      description: "Cole o link no campo acima e clique em Procurar",
      number: "02"
    },
    {
      icon: Download,
      title: "BAIXE",
      description: "Escolha vídeo sem marca ou apenas áudio MP3",
      number: "03"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background w-full relative overflow-hidden">
      {/* Arcade lines background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--accent))] to-transparent"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--retro-cyan))] to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="font-pixel text-lg sm:text-xl md:text-2xl mb-4 text-primary neon-text">
            COMO USAR
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 sm:w-12 h-1 bg-primary"></div>
            <div className="w-3 h-3 bg-primary rotate-45"></div>
            <div className="w-8 sm:w-12 h-1 bg-primary"></div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-orbitron">
            Baixe vídeos em 3 passos simples
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}
                
                {/* Step card */}
                <div className="relative bg-card/80 border-2 border-primary/30 rounded-sm p-4 sm:p-6 hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground font-pixel text-[10px]">
                    {step.number}
                  </div>
                  
                  <div className="mb-4 sm:mb-6 pt-2">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="font-pixel text-[10px] sm:text-xs text-[hsl(var(--accent))] mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm font-orbitron">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
