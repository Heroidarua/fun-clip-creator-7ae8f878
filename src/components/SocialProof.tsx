import { Download, Users, Gamepad2, Star, Shield, Clock } from "lucide-react";
import CounterAnimation from "./CounterAnimation";

const SocialProof = () => {
  const stats = [
    {
      icon: Download,
      value: 100000,
      suffix: "+",
      label: "SOS01 Mídias",
      color: "text-primary"
    },
    {
      icon: Users,
      value: 50000,
      suffix: "+", 
      label: "Usuários SOS01",
      color: "text-[hsl(var(--accent))]"
    },
    {
      icon: Gamepad2,
      value: 60,
      suffix: "+",
      label: "Jogos",
      color: "text-[hsl(var(--retro-cyan))]"
    },
    {
      icon: Star,
      value: 4.9,
      suffix: "★",
      label: "Avaliação",
      color: "text-[hsl(var(--retro-yellow))]",
      isDecimal: true
    }
  ];

  const badges = [
    { icon: Shield, text: "100% Seguro" },
    { icon: Clock, text: "Sempre Online" },
    { icon: Download, text: "Sem Limites" }
  ];

  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      {/* Arcade gradient background */}
      <div className="absolute inset-0 bg-gradient-arcade opacity-50"></div>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="pixel-card p-4 sm:p-6 text-center rounded-lg hover-lift group"
            >
              <stat.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
              <div className={`font-pixel text-lg sm:text-2xl ${stat.color} mb-1`}>
                {stat.isDecimal ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <CounterAnimation target={stat.value} suffix={stat.suffix} duration={2000} />
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-orbitron uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="arcade-badge flex items-center gap-2 rounded-sm"
            >
              <badge.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-[10px]">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
