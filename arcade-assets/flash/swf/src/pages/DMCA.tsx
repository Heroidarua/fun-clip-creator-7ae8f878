import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Mail, AlertTriangle, FileText, CheckCircle } from "lucide-react";

const DMCA = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground font-inter">
              Política de Direitos Autorais (DMCA)
            </h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-base leading-relaxed">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-base leading-relaxed">
                  O sos01 respeita os direitos de propriedade intelectual de terceiros e espera que seus usuários façam o mesmo. Esta política descreve nosso procedimento para notificações de violação de direitos autorais conforme a Lei de Direitos Autorais do Milênio Digital (DMCA).
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                1. Natureza do Serviço
              </h2>
              <p>
                O sos01 é uma plataforma de utilidades digitais que fornece ferramentas para acessar conteúdos publicamente disponíveis na internet. <strong>Não hospedamos, armazenamos ou distribuímos qualquer conteúdo de mídia em nossos servidores.</strong> Nossa plataforma atua exclusivamente como uma interface técnica que processa URLs fornecidas pelos usuários.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                2. Responsabilidade do Usuário
              </h2>
              <p>
                O usuário é o único responsável por:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Garantir que possui os direitos necessários ou autorização para acessar qualquer conteúdo</li>
                <li>Respeitar os termos de serviço das plataformas de origem</li>
                <li>Utilizar o conteúdo acessado em conformidade com as leis de direitos autorais aplicáveis</li>
                <li>Dar os devidos créditos aos criadores originais do conteúdo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                3. Procedimento de Notificação DMCA
              </h2>
              <p>
                Se você acredita que seu trabalho protegido por direitos autorais foi utilizado de forma inadequada através de nossa plataforma, envie uma notificação formal para:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-3">
                <p className="font-medium text-foreground">
                  Email: <a href="mailto:contatosos01@gmail.com" className="text-primary hover:underline">contatosos01@gmail.com</a>
                </p>
                <p className="text-sm mt-2">Assunto: Notificação DMCA - [Descrição breve]</p>
              </div>
              <p className="mt-4">
                A notificação deve incluir:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Identificação da obra protegida que alega ter sido violada</li>
                <li>Descrição detalhada do material alegadamente infrator</li>
                <li>Informações de contato do reclamante (nome, endereço, telefone, email)</li>
                <li>Declaração de boa-fé de que o uso não é autorizado</li>
                <li>Declaração de que as informações são precisas, sob pena de perjúrio</li>
                <li>Assinatura física ou eletrônica do titular dos direitos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                4. Nossa Resposta
              </h2>
              <p>
                Ao receber uma notificação DMCA válida, tomaremos as seguintes medidas:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Análise da reclamação dentro de 5 dias úteis</li>
                <li>Bloqueio do acesso ao conteúdo específico, se aplicável</li>
                <li>Notificação ao usuário responsável, quando identificável</li>
                <li>Documentação do processo para fins legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Contra-Notificação
              </h2>
              <p>
                Se você acredita que seu conteúdo foi removido por engano, pode enviar uma contra-notificação incluindo:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Sua assinatura física ou eletrônica</li>
                <li>Identificação do material removido e sua localização anterior</li>
                <li>Declaração sob pena de perjúrio de que a remoção foi por erro</li>
                <li>Seu nome, endereço, telefone e consentimento à jurisdição</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Política de Reincidência
              </h2>
              <p>
                Reservamo-nos o direito de encerrar o acesso de usuários que sejam identificados como infratores reincidentes de direitos autorais, em conformidade com a legislação aplicável.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Isenção de Responsabilidade
              </h2>
              <p>
                O sos01 não se responsabiliza pelo uso que os usuários fazem dos conteúdos acessados através de nossa plataforma. Todo conteúdo permanece de propriedade de seus respectivos criadores e detentores de direitos.
              </p>
            </section>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-foreground mb-2">Aviso Importante</h3>
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

export default DMCA;
