import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Eye, Lock, Database, Cookie, UserCheck, Mail } from "lucide-react";

const PoliticaDePrivacidade = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground font-inter">
              Política de Privacidade
            </h1>
          </div>
            
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-base leading-relaxed">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 my-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-base leading-relaxed">
                  O sos01 está comprometido com a proteção da sua privacidade. Esta política descreve como tratamos (ou não tratamos) suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                1. Dados Coletados
              </h2>
              <p>
                O sos01 foi projetado com privacidade em mente. <strong>Não coletamos dados pessoais identificáveis</strong> durante o uso regular de nossas ferramentas de mídia. Especificamente:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Não registramos URLs processadas após a conclusão do serviço</li>
                <li>Não armazenamos endereços IP para fins de identificação</li>
                <li>Não criamos perfis de usuário baseados em comportamento</li>
                <li>Não compartilhamos informações com terceiros para fins publicitários</li>
              </ul>
              <p className="mt-4">
                <strong>Nota:</strong> O sos01 é uma plataforma 100% gratuita e não requer cadastro para utilização das ferramentas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                2. Uso das Informações
              </h2>
              <p>
                Quando aplicável, utilizamos informações exclusivamente para:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Fornecer e melhorar nossos serviços gratuitos</li>
                <li>Enviar comunicações essenciais sobre o serviço (quando solicitado)</li>
                <li>Responder a solicitações de suporte</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Compartilhamento de Dados
              </h2>
              <p>
                <strong>Não vendemos, alugamos ou compartilhamos seus dados pessoais</strong> com terceiros para fins de marketing. Podemos compartilhar informações apenas:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos legais ou segurança dos usuários</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-primary" />
                4. Cookies e Tecnologias Similares
              </h2>
              <p>
                Utilizamos cookies essenciais para:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Manter sessões de usuário ativas</li>
                <li>Lembrar preferências básicas de navegação</li>
                <li>Garantir a segurança da plataforma</li>
              </ul>
              <p className="mt-4">
                Não utilizamos cookies de rastreamento de terceiros para fins publicitários.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Retenção de Dados
              </h2>
              <p>
                URLs e conteúdos processados são utilizados apenas durante a sessão e não são armazenados permanentemente. Dados de conta (quando aplicável) são mantidos enquanto a conta estiver ativa ou conforme necessário para cumprir obrigações legais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Segurança
              </h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger informações contra acesso não autorizado, incluindo:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Acesso restrito a sistemas e dados</li>
                <li>Monitoramento de segurança contínuo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                7. Seus Direitos (LGPD)
              </h2>
              <p>
                Conforme a Lei Geral de Proteção de Dados, você tem direito a:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
                <li><strong>Eliminação:</strong> Solicitar exclusão de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Opor-se a tratamentos específicos</li>
              </ul>
              <p className="mt-4">
                Para exercer esses direitos, entre em contato através do email abaixo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Menores de Idade
              </h2>
              <p>
                O sos01 não é direcionado a menores de 13 anos. Não coletamos intencionalmente informações de crianças. Se tomarmos conhecimento de coleta inadvertida, excluiremos os dados imediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                9. Alterações nesta Política
              </h2>
              <p>
                Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas através do site. A data de "Última atualização" no topo indica quando esta política foi revisada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                10. Contato e DPO
              </h2>
              <p>
                Para questões sobre privacidade, exercício de direitos ou reclamações:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-3">
                <p><strong>Email:</strong>{" "}
                  <a href="mailto:contatosos01@gmail.com" className="text-primary hover:underline">
                    contatosos01@gmail.com
                  </a>
                </p>
                <p className="text-sm mt-2">Assunto: Privacidade - [Sua solicitação]</p>
              </div>
              <p className="mt-4 text-sm">
                Responderemos a solicitações dentro de 15 dias úteis, conforme previsto na LGPD.
              </p>
            </section>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-foreground mb-2">Aviso Legal</h3>
              <p className="text-sm">
                O sos01 não hospeda, armazena ou distribui conteúdo. A plataforma apenas oferece ferramentas para acesso a conteúdos publicamente disponíveis na internet. O usuário é o único responsável por garantir que possui os direitos necessários sobre qualquer conteúdo utilizado.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PoliticaDePrivacidade;
