import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, Mail, Trophy } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground font-inter">
              Termos de Uso
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
                  Ao acessar e utilizar o ClipSave, você declara ter lido, compreendido e concordado com estes Termos de Uso. Caso não concorde com qualquer disposição, solicitamos que não utilize nossa plataforma.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                1. Aceitação dos Termos
              </h2>
              <p>
                Estes Termos de Uso constituem um acordo legal entre você ("Usuário") e o ClipSave ("Plataforma"). O uso continuado de nossos serviços implica na aceitação integral destes termos, incluindo eventuais atualizações.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Descrição do Serviço
              </h2>
              <p>
                O ClipSave é uma plataforma de utilidades digitais que oferece:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Ferramentas técnicas para acesso a conteúdos publicamente disponíveis na internet</li>
                <li>Interface de entretenimento com jogos clássicos gratuitos</li>
                <li>Biblioteca gratuita de quadrinhos e mangás</li>
                <li>Ferramentas de utilidade com inteligência artificial</li>
              </ul>
              <p className="mt-4">
                <strong>Importante:</strong> O ClipSave não hospeda, armazena ou distribui qualquer conteúdo de mídia. Nossa plataforma atua exclusivamente como uma interface técnica.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                3. Uso Permitido
              </h2>
              <p>O Usuário está autorizado a utilizar o ClipSave para:</p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Acessar conteúdos públicos para uso pessoal e não comercial</li>
                <li>Utilizar ferramentas de entretenimento disponibilizadas</li>
                <li>Acessar conteúdos sobre os quais possua direitos ou autorização expressa</li>
                <li>Finalidades educacionais e de pesquisa, quando aplicável</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                4. Uso Proibido
              </h2>
              <p>É expressamente vedado ao Usuário:</p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Utilizar conteúdos acessados para fins comerciais sem autorização dos titulares</li>
                <li>Violar direitos autorais, marcas registradas ou outros direitos de propriedade intelectual</li>
                <li>Redistribuir, revender ou sublicenciar conteúdos de terceiros</li>
                <li>Utilizar a plataforma para atividades ilegais ou prejudiciais</li>
                <li>Tentar contornar medidas de segurança ou acessar sistemas não autorizados</li>
                <li>Utilizar bots, scrapers ou ferramentas automatizadas não autorizadas</li>
                <li>Remover atribuições de autoria ou créditos de criadores originais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Direitos Autorais e Propriedade Intelectual
              </h2>
              <p>
                O ClipSave respeita os direitos de propriedade intelectual de terceiros. Todo conteúdo acessado através de nossa plataforma permanece de propriedade de seus respectivos criadores e detentores de direitos.
              </p>
              <p className="mt-3">
                <strong>O Usuário reconhece e concorda que:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>É o único responsável por verificar se possui os direitos necessários para acessar e utilizar qualquer conteúdo</li>
                <li>Deve respeitar os termos de serviço das plataformas de origem</li>
                <li>Concorda em dar os devidos créditos aos criadores originais</li>
                <li>Não utilizará conteúdos de forma que viole direitos de terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Limitação de Responsabilidade
              </h2>
              <p>
                O ClipSave é fornecido "como está" e "conforme disponível". Na máxima extensão permitida por lei:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Não garantimos disponibilidade ininterrupta do serviço</li>
                <li>Não nos responsabilizamos pelo uso inadequado feito pelos Usuários</li>
                <li>Não nos responsabilizamos por conteúdos de terceiros acessados através da plataforma</li>
                <li>Não garantimos a precisão ou completude das informações disponibilizadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Indenização
              </h2>
              <p>
                O Usuário concorda em indenizar, defender e isentar o ClipSave, seus administradores, funcionários e parceiros de quaisquer reclamações, perdas, danos, custos e despesas (incluindo honorários advocatícios) decorrentes do uso inadequado da plataforma ou violação destes Termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Modificações dos Termos
              </h2>
              <p>
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. O uso continuado da plataforma após modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                9. Lei Aplicável e Foro
              </h2>
              <p>
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será submetida ao foro da comarca do domicílio do Usuário, conforme previsto no Código de Defesa do Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                10. Regulamento do Desafio R$5.000
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-4">
                <p className="font-semibold text-foreground mb-3">
                  PROMOÇÃO: Complete todas as conquistas e ganhe R$5.000!
                </p>
              </div>
              
              <h3 className="font-semibold text-foreground mt-4 mb-2">10.1. Descrição da Promoção</h3>
              <p>
                O "Desafio R$5.000" é uma promoção do ClipSave que premia o primeiro usuário que completar 100% das conquistas disponíveis na plataforma com o valor de R$5.000,00 (cinco mil reais) em dinheiro.
              </p>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.2. Período de Vigência</h3>
              <p>
                A promoção tem vigência indeterminada, podendo ser encerrada a qualquer momento mediante aviso prévio no site. Uma vez que o prêmio seja reivindicado por um ganhador válido, a promoção será encerrada.
              </p>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.3. Elegibilidade</h3>
              <ul className="list-disc ml-6 space-y-2 mt-2">
                <li>Participantes devem ter conta cadastrada no ClipSave</li>
                <li>Ser maior de 18 anos ou ter autorização expressa dos responsáveis legais</li>
                <li>Residir em território brasileiro</li>
                <li>Completar legitimamente todas as conquistas disponíveis</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.4. Mecânica de Participação</h3>
              <ul className="list-disc ml-6 space-y-2 mt-2">
                <li>Criar conta gratuita no ClipSave</li>
                <li>Desbloquear todas as conquistas disponíveis na plataforma</li>
                <li>Após completar 100% das conquistas, entrar em contato pelo email oficial</li>
                <li>Fornecer comprovação de identidade e dados bancários para recebimento</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.5. Premiação</h3>
              <ul className="list-disc ml-6 space-y-2 mt-2">
                <li><strong>Prêmio:</strong> R$5.000,00 (cinco mil reais)</li>
                <li><strong>Ganhador:</strong> Apenas 1 (um) participante</li>
                <li><strong>Forma de pagamento:</strong> Transferência bancária (PIX ou TED)</li>
                <li><strong>Prazo:</strong> Até 30 dias úteis após validação</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.6. Validação</h3>
              <p>
                O ClipSave reserva-se o direito de validar a legitimidade das conquistas. Serão consideradas inválidas conquistas obtidas por:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-2">
                <li>Uso de bots, scripts ou automações</li>
                <li>Manipulação do localStorage ou banco de dados</li>
                <li>Exploração de bugs ou vulnerabilidades</li>
                <li>Criação de múltiplas contas</li>
                <li>Qualquer forma de fraude ou má-fé</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.7. Desclassificação</h3>
              <p>
                Participantes que violarem estas regras serão desclassificados sem direito a recurso, podendo ter sua conta suspensa permanentemente.
              </p>

              <h3 className="font-semibold text-foreground mt-4 mb-2">10.8. Contato para Reivindicação</h3>
              <p>
                Ao completar todas as conquistas, envie email para{" "}
                <a href="mailto:contatoclipsave@gmail.com" className="text-primary hover:underline">
                  contatoclipsave@gmail.com
                </a>{" "}
                com o assunto "Desafio R$5.000 - Reivindicação" contendo:
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-2">
                <li>Nome completo</li>
                <li>Email cadastrado no ClipSave</li>
                <li>Captura de tela do perfil com 100% das conquistas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                11. Contato
              </h2>
              <p>
                Para dúvidas sobre estes Termos de Uso ou para reportar violações, entre em contato:
              </p>
              <p className="mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:contatoclipsave@gmail.com" className="text-primary hover:underline">
                  contatoclipsave@gmail.com
                </a>
              </p>
            </section>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-foreground mb-2">Aviso Legal</h3>
              <p className="text-sm">
                O ClipSave não hospeda, armazena ou distribui conteúdo. A plataforma apenas oferece ferramentas para acesso a conteúdos publicamente disponíveis na internet. O usuário é o único responsável por garantir que possui os direitos necessários sobre qualquer conteúdo utilizado.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
