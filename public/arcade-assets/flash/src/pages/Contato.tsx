import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Clock, CheckCircle, Shield, AlertTriangle } from "lucide-react";

const Contato = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-inter">
              Central de Atendimento
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nossa equipe está disponível para esclarecer dúvidas e oferecer suporte
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Informações de Contato */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <Mail className="w-6 h-6 text-accent mr-3" />
                  <h3 className="text-xl font-semibold text-foreground">Email de Suporte</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Para dúvidas técnicas, sugestões, notificações DMCA ou solicitações:
                </p>
                <a 
                  href="mailto:contatosos01@gmail.com"
                  className="text-primary hover:text-primary/80 font-medium text-lg transition-colors"
                >
                  contatoclipsave@gmail.com
                </a>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-accent mr-3" />
                  <h3 className="text-xl font-semibold text-foreground">Tempo de Resposta</h3>
                </div>
                <p className="text-muted-foreground">
                  Respondemos em até <strong className="text-foreground">48 horas úteis</strong>. 
                  Para questões urgentes ou notificações DMCA, inclua "[URGENTE]" ou "[DMCA]" no assunto.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <MessageCircle className="w-6 h-6 text-accent mr-3" />
                  <h3 className="text-xl font-semibold text-foreground">Tipos de Suporte</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Dúvidas sobre funcionamento da plataforma</li>
                  <li>• Problemas técnicos</li>
                  <li>• Notificações de direitos autorais (DMCA)</li>
                  <li>• Solicitações de privacidade (LGPD)</li>
                  <li>• Sugestões de melhorias</li>
                  <li>• Parcerias e contato comercial</li>
                </ul>
              </div>
            </div>

            {/* FAQ e Dicas */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Antes de entrar em contato
                </h3>
                <p className="text-muted-foreground mb-4">
                  Verifique se sua dúvida já está respondida:
                </p>
                
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">A ferramenta não está funcionando</h4>
                    <p className="text-sm text-muted-foreground">
                      Verifique sua conexão, tente atualizar a página ou limpar o cache do navegador. Alguns conteúdos podem estar indisponíveis temporariamente.
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Conteúdo não disponível</h4>
                    <p className="text-sm text-muted-foreground">
                      Verifique se o conteúdo é público e acessível. Conteúdos privados ou restritos não podem ser processados.
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Dúvidas sobre funcionalidades</h4>
                    <p className="text-sm text-muted-foreground">
                      Todas as ferramentas, jogos e a biblioteca de quadrinhos são 100% gratuitos. Não cobramos nada!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold text-foreground">Dica para atendimento mais rápido</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ao enviar um email, inclua: dispositivo utilizado, navegador, descrição detalhada do problema 
                  e prints de tela se aplicável. Isso nos ajuda a resolver mais rapidamente!
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-3">
                  <Shield className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold text-foreground">Notificações DMCA</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para questões de direitos autorais, consulte nossa{" "}
                  <a href="/dmca" className="text-primary hover:underline">Política DMCA</a>{" "}
                  para informações sobre como enviar uma notificação formal.
                </p>
              </div>
            </div>
          </div>

          {/* Aviso Legal */}
          <div className="mt-12">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Aviso Legal</h3>
                  <p className="text-sm text-muted-foreground">
                    O sos01 não hospeda, armazena ou distribui conteúdo. A plataforma apenas oferece ferramentas para acesso a conteúdos publicamente disponíveis na internet. O usuário é o único responsável por garantir que possui os direitos necessários sobre qualquer conteúdo utilizado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-8">
            <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Compromisso com o Usuário
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
                O sos01 é uma plataforma desenvolvida com foco na experiência do usuário, 
                transparência e conformidade legal. Valorizamos cada feedback recebido.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-background border border-border rounded-full px-4 py-2 text-muted-foreground">
                  🛡️ Navegação Segura
                </span>
                <span className="bg-background border border-border rounded-full px-4 py-2 text-muted-foreground">
                  📧 Suporte Dedicado
                </span>
                <span className="bg-background border border-border rounded-full px-4 py-2 text-muted-foreground">
                  🔒 Privacidade Garantida
                </span>
                <span className="bg-background border border-border rounded-full px-4 py-2 text-muted-foreground">
                  ⚖️ Conformidade Legal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contato;
