import { Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Heart, Rocket, Gamepad2, Lightbulb, Users, Star, Code, Zap } from "lucide-react";

const ComoNasceuClipSave = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-10 text-base leading-relaxed">
        <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Blog
        </Link>

        <article className="prose prose-lg max-w-none">
          {/* Header visual */}
          <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8 mb-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">NOSSA HISTÓRIA</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
                Como Nasceu o ClipSave
              </h1>
              <p className="text-muted-foreground text-lg m-0">
                A história de um desenvolvedor brasileiro que transformou frustração em uma plataforma usada por milhares de pessoas.
              </p>
            </div>
          </div>

          {/* Capítulo 1 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">Tudo começou com uma frustração</h2>
          </div>
          <p className="text-muted-foreground">
            Era 2024. <strong>Matheus Marinho</strong>, um jovem desenvolvedor apaixonado por tecnologia e cultura geek, estava tentando fazer algo simples: baixar um vídeo do TikTok para editar e postar em outra rede social.
          </p>
          <p className="text-muted-foreground">
            Parece fácil, certo? Mas não era. Cada site que ele encontrava estava infestado de <strong>anúncios invasivos</strong>, pop-ups suspeitos, redirecionamentos para páginas duvidosas e, o pior — muitos nem funcionavam. Alguns pediam cadastro, outros tentavam instalar extensões maliciosas. O processo que deveria levar 10 segundos se transformava em uma batalha de 10 minutos contra a internet.
          </p>
          <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg my-6">
            <p className="text-foreground italic m-0">
              "Eu pensei: se isso me irrita como desenvolvedor, imagina pra quem não entende de tecnologia. As pessoas merecem algo melhor — algo <strong>limpo, rápido e gratuito</strong>."
            </p>
            <cite className="text-sm text-muted-foreground mt-2 block">— Matheus Marinho</cite>
          </blockquote>

          {/* Capítulo 2 */}
          <div className="flex items-center gap-3 mb-4 mt-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">As primeiras linhas de código</h2>
          </div>
          <p className="text-muted-foreground">
            Naquela mesma noite, Matheus abriu o editor de código. Sem investidores, sem equipe, sem plano de negócios elaborado. Apenas ele, um notebook, um café quente e uma missão clara: <strong>criar a ferramenta que ele gostaria de ter encontrado</strong>.
          </p>
          <p className="text-muted-foreground">
            As primeiras versões eram simples — uma página com um campo para colar o link e um botão de download. Mas funcionava. E funcionava <strong>sem anúncios, sem cadastro, sem pegadinhas</strong>. Era exatamente o que faltava na internet.
          </p>
          <p className="text-muted-foreground">
            Mas Matheus não queria parar ali. Ele sabia que podia entregar muito mais.
          </p>

          {/* Capítulo 3 */}
          <div className="flex items-center gap-3 mb-4 mt-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">De um downloader para um universo inteiro</h2>
          </div>
          <p className="text-muted-foreground">
            O que começou como um simples baixador de vídeos foi crescendo, funcionalidade por funcionalidade. Cada nova ferramenta nascia de uma necessidade real:
          </p>
          <ul className="text-muted-foreground space-y-3">
            <li>
              <strong>🎨 Removedor de Fundo com IA</strong> — porque Matheus viu amigos pagando R$30/mês em apps só pra remover fundo de fotos de produtos.
            </li>
            <li>
              <strong>🎵 Conversor MP4 → MP3</strong> — porque todo mundo merece extrair o áudio daquela música que só existe em vídeo.
            </li>
            <li>
              <strong>🔑 Gerador de Senhas</strong> — porque "123456" ainda é a senha mais usada no Brasil, e isso precisa mudar.
            </li>
            <li>
              <strong>🤖 Avatar Pixelado com IA</strong> — porque ter uma identidade visual deveria ser divertido e acessível.
            </li>
            <li>
              <strong>📄 Conversor de Imagem para PDF</strong> — porque ninguém deveria precisar instalar software pesado só pra juntar imagens em um documento.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Cada ferramenta foi construída com o mesmo princípio: <strong>100% gratuita, sem limites, sem cadastro obrigatório</strong>.
          </p>

          {/* Capítulo 4 */}
          <div className="flex items-center gap-3 mb-4 mt-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">O DNA geek por trás de tudo</h2>
          </div>
          <p className="text-muted-foreground">
            Quem conhece o Matheus sabe: ele cresceu jogando Super Mario, Sonic, Pac-Man. Passava horas na frente de emuladores e lia quadrinhos da Marvel e DC como quem respira. Essa paixão não ficou de fora do ClipSave.
          </p>
          <p className="text-muted-foreground">
            Ele adicionou uma <strong>seção completa de jogos retrô</strong> jogáveis direto no navegador — mais de 60 clássicos dos consoles antigos. Depois veio a <strong>biblioteca de quadrinhos e mangás</strong> gratuita. O ClipSave deixou de ser apenas uma ferramenta. Virou um <strong>hub de entretenimento digital</strong>.
          </p>
          <p className="text-muted-foreground">
            O visual retrô pixelado do site? A tipografia estilo arcade? O mascote ClipY (um esquilo futurista 3D)? Tudo isso é reflexo direto da personalidade do criador — alguém que acredita que <strong>tecnologia e diversão caminham juntas</strong>.
          </p>

          {/* Capítulo 5 */}
          <div className="flex items-center gap-3 mb-4 mt-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">A comunidade que deu sentido a tudo</h2>
          </div>
          <p className="text-muted-foreground">
            Os primeiros usuários chegaram pelo boca a boca. Um amigo contou para outro, que contou para mais três. Logo, pessoas que Matheus nunca tinha visto estavam usando o ClipSave diariamente. As mensagens de agradecimento começaram a aparecer:
          </p>
          <div className="space-y-3 my-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-foreground italic m-0 text-sm">"Finalmente um site que funciona de verdade sem me encher de propaganda!"</p>
              <span className="text-xs text-muted-foreground mt-1 block">— Usuário anônimo</span>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-foreground italic m-0 text-sm">"Uso o ClipSave todo dia pro meu trabalho como social media. Vocês salvam minha vida."</p>
              <span className="text-xs text-muted-foreground mt-1 block">— Social Media de São Paulo</span>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-foreground italic m-0 text-sm">"Meu filho descobriu os jogos retrô e agora quer saber tudo sobre Pac-Man. Obrigada! 😂"</p>
              <span className="text-xs text-muted-foreground mt-1 block">— Mãe de Belo Horizonte</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Foi aí que Matheus entendeu: o ClipSave não era mais só dele. Era da <strong>comunidade</strong>. Cada nova funcionalidade passou a ser pensada com base no feedback real dos usuários.
          </p>

          {/* Capítulo 6 */}
          <div className="flex items-center gap-3 mb-4 mt-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">O sistema de gamificação: transformando uso em diversão</h2>
          </div>
          <p className="text-muted-foreground">
            Inspirado pelos games que marcaram sua infância, Matheus teve uma ideia ousada: e se usar as ferramentas rendesse <strong>XP, conquistas e níveis</strong>? Nasceu o sistema de gamificação do ClipSave, onde cada download, cada ferramenta usada e cada dia ativo desbloqueia novas conquistas.
          </p>
          <p className="text-muted-foreground">
            E para ir ainda mais longe, lançou o <strong>Desafio R$5.000</strong> — uma competição real onde os usuários mais engajados concorrem a um prêmio em dinheiro. Não é marketing vazio. É uma forma de devolver à comunidade que fez o ClipSave crescer.
          </p>

          {/* Capítulo final */}
          <div className="flex items-center gap-3 mb-4 mt-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground m-0">O futuro é da comunidade</h2>
          </div>
          <p className="text-muted-foreground">
            Hoje, o ClipSave é muito mais do que Matheus imaginou naquela primeira noite de código. É um ecossistema completo com <strong>downloaders, ferramentas com IA, jogos, quadrinhos, sistema de conquistas e uma comunidade ativa</strong>.
          </p>
          <p className="text-muted-foreground">
            Mas uma coisa nunca mudou desde o primeiro dia: o compromisso de que <strong>tudo será sempre 100% gratuito</strong>. Sem pegadinhas. Sem letras miúdas. Sem "versão premium". O ClipSave nasceu para democratizar o acesso a ferramentas digitais, e essa missão continua.
          </p>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6 mt-8">
            <p className="text-foreground font-medium text-center m-0 text-lg">
              ❤️ O ClipSave é feito <strong>por uma pessoa</strong>, mas existe <strong>por milhares</strong>.
            </p>
            <p className="text-muted-foreground text-center m-0 mt-2 text-sm">
              Obrigado por fazer parte dessa história. Cada vez que você usa o ClipSave, você faz parte dela também.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Explorar o ClipSave
            </Link>
            <Link
              to="/sobre"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-bold px-6 py-3 rounded-lg hover:bg-accent/10 transition-colors"
            >
              Conhecer o Matheus →
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Escrito com ❤️ pela equipe ClipSave · Março 2026
            </p>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoNasceuClipSave;
