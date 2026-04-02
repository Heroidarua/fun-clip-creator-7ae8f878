import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, Target, Shield, Heart, Zap, Globe, Wrench, Gamepad2, BookOpen, Download } from "lucide-react";
import developerPhoto from "@/assets/developer-photo.jpg";

const SobreNos = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground font-inter">
              Sobre o ClipSave
            </h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
              <p className="text-base leading-relaxed text-foreground font-medium">
                O ClipSave é uma plataforma brasileira <strong>100% gratuita</strong> de utilidades digitais, desenvolvida para oferecer ferramentas práticas e acessíveis para o dia a dia na internet. Nenhum cadastro ou pagamento é necessário.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Nossa Missão
              </h2>
              <p>
                Democratizar o acesso a ferramentas digitais de qualidade, oferecendo uma plataforma intuitiva, segura e <strong>totalmente gratuita</strong> para que usuários possam gerenciar seus conteúdos digitais de forma responsável e em conformidade com as leis vigentes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                O Que Oferecemos (Tudo Grátis!)
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Download de Vídeos</h3>
                  </div>
                  <p className="text-sm">
                    Baixe vídeos do TikTok, Instagram, Kwai e YouTube em HD e sem marca d'água. Também é possível extrair apenas o áudio em MP3.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Ferramentas com IA</h3>
                  </div>
                  <p className="text-sm">
                    Gerador de Avatar Pixelado com IA, Removedor de Fundo, Conversor MP4→MP3, Gerador de QR Code, Encurtador de URL, Gerador de Senhas e Marca D'Água.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">+60 Jogos Retrô</h3>
                  </div>
                  <p className="text-sm">
                    Biblioteca completa de jogos clássicos de arcade que rodam diretamente no navegador, sem precisar instalar nada. Nostalgia pura!
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Biblioteca de Quadrinhos</h3>
                  </div>
                  <p className="text-sm">
                    Acesso gratuito a uma vasta coleção de quadrinhos e mangás organizados por categorias: Marvel, DC, Mangá e muito mais.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Nossos Valores
              </h2>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Gratuidade Total:</strong> Todas as funcionalidades são 100% gratuitas. Sem assinaturas, sem planos pagos, sem cadastro obrigatório.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Transparência:</strong> Comunicação clara sobre como nossa plataforma funciona e quais são as responsabilidades dos usuários.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Privacidade:</strong> Não coletamos dados pessoais desnecessários. Sua navegação é segura e anônima.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Respeito aos Criadores:</strong> Incentivamos o uso responsável e ético das ferramentas, sempre respeitando os direitos autorais.
                  </div>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Compromisso Legal
              </h2>
              <p>
                O ClipSave opera em estrita conformidade com as leis brasileiras e internacionais de direitos autorais. Nossa plataforma:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Não hospeda, armazena ou distribui conteúdo protegido por direitos autorais</li>
                <li>Fornece apenas ferramentas técnicas para acesso a conteúdos públicos</li>
                <li>Mantém política ativa de resposta a notificações DMCA</li>
                <li>Educa os usuários sobre uso responsável e ético</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Equipe
              </h2>
              <div className="flex items-center gap-4 mt-4 bg-muted/30 rounded-lg p-4 border border-border">
                <img 
                  src={developerPhoto} 
                  alt="Matheus Marinho - Fundador"
                  className="w-16 h-16 rounded-lg object-cover border-2 border-primary/30"
                />
                <div>
                  <h3 className="font-semibold text-foreground">Matheus Marinho</h3>
                  <p className="text-sm text-muted-foreground">Fundador & Desenvolvedor</p>
                  <p className="text-sm mt-1">
                    Desenvolvedor web brasileiro, criador do ClipSave — uma plataforma 100% gratuita que reúne ferramentas de download, utilitários com IA, jogos retrô e quadrinhos. Apaixonado por tecnologia, nostalgia gamer e por criar soluções que facilitam o dia a dia dos usuários.
                  </p>
                </div>
              </div>
            </section>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-foreground mb-2">Aviso Legal</h3>
              <p className="text-sm">
                O ClipSave não hospeda, armazena ou distribui conteúdo. A plataforma apenas oferece ferramentas para acesso a conteúdos publicamente disponíveis na internet. O usuário é o único responsável por garantir que possui os direitos necessários sobre qualquer conteúdo utilizado.
              </p>
            </div>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Contato</h2>
              <p>
                Para dúvidas, sugestões ou parcerias, entre em contato:
              </p>
              <p className="mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:contatoclipsave@gmail.com" className="text-primary hover:underline">
                  contatoclipsave@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SobreNos;