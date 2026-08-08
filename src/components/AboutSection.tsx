import developerPhoto from "@/assets/developer-photo.jpg";
import { Mail, Gamepad2 } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="relative py-16 sm:py-20 bg-background overflow-hidden">
      {/* Futuristic Grid Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Horizontal scan line */}
        <div 
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          style={{ top: '30%', animation: 'scanMove 8s linear infinite' }}
        />
        <div 
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          style={{ top: '70%', animation: 'scanMove 12s linear infinite reverse' }}
        />
      </div>
      
      {/* Corner tech accents */}
      <div className="absolute top-8 left-8 w-20 h-20 border-t border-l border-primary/20 rounded-tl-sm opacity-40" />
      <div className="absolute top-8 right-8 w-20 h-20 border-t border-r border-primary/20 rounded-tr-sm opacity-40" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-b border-l border-primary/20 rounded-bl-sm opacity-40" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-b border-r border-primary/20 rounded-br-sm opacity-40" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/5 border border-primary/20 rounded-full mb-4 backdrop-blur-sm">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="font-pixel text-[10px] text-primary tracking-[0.2em] uppercase">Player 1</span>
          </div>
          <h2 className="font-pixel text-xl sm:text-2xl text-foreground mb-2">
            QUEM <span className="text-primary">CRIOU</span>
          </h2>
          <p className="text-muted-foreground font-orbitron text-sm">O desenvolvedor por trás do sos01</p>
        </div>
        
        {/* Developer Card */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            {/* Outer glow border */}
            <div className="absolute -inset-px bg-gradient-to-br from-primary/30 via-primary/5 to-accent/30 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]" />
            
            <div className="relative bg-card/90 backdrop-blur-xl border border-primary/10 rounded-xl p-6 sm:p-8
                            shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]
                            group-hover:shadow-[0_0_60px_-12px_hsl(var(--primary)/0.25)]
                            transition-all duration-700">
              
              {/* Tech corner brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/40 rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-accent/40 rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-accent/40 rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/40 rounded-br-sm" />

              {/* Data stream lines */}
              <div className="absolute top-3 left-8 right-8 h-px bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0" />
              <div className="absolute bottom-3 left-8 right-8 h-px bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0" />
              
              {/* Photo Container */}
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Holographic ring */}
                  <div className="absolute -inset-5 rounded-lg border border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" 
                       style={{ animation: 'holoRing 4s ease-in-out infinite' }} />
                  
                  {/* Photo Frame */}
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44">
                    {/* Gradient border */}
                    <div className="absolute -inset-[2px] bg-gradient-to-br from-primary via-primary/50 to-accent rounded-lg" />
                    
                    {/* Photo */}
                    <img 
                      src={developerPhoto} 
                      alt="Matheus Marinho - Desenvolvedor do sos01" loading="lazy" decoding="async"
                      className="relative w-full h-full object-cover rounded-lg"
                    />
                    
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent rounded-lg pointer-events-none" />
                    
                    {/* DEV Badge */}
                    <div className="absolute -top-3 -right-3 bg-primary px-3 py-1 rounded-md
                                    border border-primary-foreground/20
                                    shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
                      <span className="font-pixel text-[8px] text-primary-foreground tracking-wider">DEV</span>
                    </div>
                  </div>
                </div>
                
                {/* Name */}
                <h3 className="font-pixel text-base sm:text-lg text-primary mb-2 text-center
                               drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]">
                  MATHEUS MARINHO
                </h3>
                
                {/* Title Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/20 rounded-full mb-4 backdrop-blur-sm">
                  <span className="font-pixel text-[8px] text-accent tracking-wider">FUNDADOR & DESENVOLVEDOR</span>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground font-orbitron text-sm text-center mb-6 leading-relaxed">
                  Desenvolvedor web brasileiro, criador do sos01.com.br — uma plataforma 100% gratuita 
                  que reúne ferramentas de download sos01, utilitários com IA, jogos retrô e quadrinhos. 
                  Apaixonado por tecnologia, nostalgia gamer e por criar o ecossistema sos01.com.br.
                </p>
                
                {/* Social Link */}
                <div className="flex justify-center">
                  <a 
                    href="mailto:contatosos01@gmail.com"
                    className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full 
                               flex items-center justify-center
                               hover:bg-primary hover:border-primary
                               hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]
                               transition-all duration-300 group/mail"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4 text-primary group-hover/mail:text-primary-foreground transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom tech line */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
            <div className="w-1.5 h-1.5 bg-primary/50 rounded-full shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
            <div className="h-px w-8 bg-primary/20" />
            <div className="w-1.5 h-1.5 bg-accent/50 rounded-full shadow-[0_0_6px_hsl(var(--accent)/0.4)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/30" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanMove {
          0% { opacity: 0; transform: translateY(-100px); }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(100px); }
        }
        @keyframes holoRing {
          0%, 100% { transform: scale(1); opacity: 0; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
