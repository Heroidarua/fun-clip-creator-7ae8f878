import { Shield, Code, Globe, Users } from "lucide-react";

const TechnicalInfoSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Segurança e Privacidade",
      description: "Não armazenamos seus dados pessoais. Os vídeos são processados em tempo real e não ficam em nossos servidores."
    },
    {
      icon: Code,
      title: "Como Funciona",
      description: "Nossa tecnologia extrai o link direto do vídeo do TikTok e Instagram, removendo automaticamente a marca d'água sem comprometer a qualidade."
    },
    {
      icon: Globe,
      title: "Compatibilidade Universal",
      description: "Funciona em todos os navegadores modernos: Chrome, Firefox, Safari, Edge. Compatible com Windows, Mac, iOS e Android."
    },
    {
      icon: Users,
      title: "Uso Responsável",
      description: "Incentivamos o download apenas de vídeos para uso pessoal. Respeite os direitos autorais e dê crédito aos criadores originais."
    }
  ];

  return (
    <section id="sobre" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-inter">
            Por que escolher o sos01.com.br ?
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
            Desenvolvido com foco na segurança, qualidade e facilidade de uso. 
            Conheça os diferenciais que fazem do sos01 a melhor opção para download de vídeos.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover-lift h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-foreground font-inter">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-sm font-inter">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Seção adicional com informações legais */}
        <div className="mt-16 bg-card border border-border rounded-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground font-inter">
            Informações Legais e Limitações
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground font-inter">
            <div>
              <h4 className="font-semibold text-foreground mb-2">✅ Permitido:</h4>
              <ul className="space-y-1">
                <li>• Download para uso pessoal</li>
                <li>• Backup de seus próprios vídeos</li>
                <li>• Vídeos públicos do TikTok e Instagram</li>
                <li>• Conteúdo livre de direitos autorais</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">❌ Não permitido:</h4>
              <ul className="space-y-1">
                <li>• Redistribuição comercial</li>
                <li>• Violação de direitos autorais</li>
                <li>• Download de conteúdo privado</li>
                <li>• Uso indevido do material baixado</li>
              </ul>
            </div>
          </div>
          
          <p className="text-center mt-6 text-xs text-muted-foreground">
            O sos01 é uma ferramenta técnica que facilita o acesso a conteúdo público. 
            O usuário é responsável pelo uso adequado e legal do material baixado.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TechnicalInfoSection;
