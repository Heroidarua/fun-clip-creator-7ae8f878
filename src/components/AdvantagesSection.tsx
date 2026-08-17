import { Zap, Sparkles, Gift, Gamepad2 } from "lucide-react";

const AdvantagesSection = () => {
  const advantages = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "RÁPIDO",
      description: "Downloads em segundos",
      color: "text-[hsl(var(--retro-yellow))]",
      borderColor: "border-[hsl(var(--retro-yellow))]",
      shadowColor: "shadow-[0_0_20px_hsl(var(--retro-yellow)/0.3)]"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "SEM MARCA",
      description: "Vídeos em HD limpos",
      color: "text-[hsl(var(--retro-cyan))]",
      borderColor: "border-[hsl(var(--retro-cyan))]",
      shadowColor: "shadow-[0_0_20px_hsl(var(--retro-cyan)/0.3)]"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "2700+ JOGOS",
      description: "Arcade retrô grátis",
      color: "text-[hsl(var(--accent))]",
      borderColor: "border-[hsl(var(--accent))]",
      shadowColor: "shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "SOS01 GRÁTIS",
      description: "Tudo sem pagar nada",
      color: "text-primary",
      borderColor: "border-primary",
      shadowColor: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-background relative overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {advantages.map((advantage, index) => (
            <div 
              key={index}
              className={`relative p-4 sm:p-6 text-center rounded-sm bg-card/80 border-2 ${advantage.borderColor} ${advantage.shadowColor} hover:scale-105 transition-all duration-200 group`}
            >
              {/* Corner decorations */}
              <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${advantage.borderColor}`}></div>
              <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${advantage.borderColor}`}></div>
              <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${advantage.borderColor}`}></div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${advantage.borderColor}`}></div>
              
              <div className={`flex justify-center mb-3 sm:mb-4 ${advantage.color} group-hover:scale-110 transition-transform`}>
                {advantage.icon}
              </div>
              <h2 className={`font-pixel text-[10px] sm:text-xs ${advantage.color} mb-2`}>
                {advantage.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-orbitron">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
