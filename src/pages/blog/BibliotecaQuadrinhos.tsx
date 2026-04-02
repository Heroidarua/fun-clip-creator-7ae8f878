import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, BookOpen, Gift, Shield, Filter } from "lucide-react";

const BibliotecaQuadrinhos = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-10 text-base leading-relaxed">
        <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Blog
        </Link>

        <article className="prose prose-lg max-w-none">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="bg-purple-500/10 text-purple-500 text-xs font-bold px-3 py-1 rounded-full">QUADRINHOS</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Biblioteca de Quadrinhos e Mangás Gratuita
          </h1>
          
          <p className="text-muted-foreground mb-8">
            O ClipSave oferece acesso <strong>100% gratuito</strong> a uma vasta coleção de quadrinhos e mangás. Sem cadastro, sem assinatura, sem pegadinhas.
          </p>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-green-500" />
              <span className="font-bold text-foreground">100% GRATUITO</span>
            </div>
            <p className="text-muted-foreground m-0">
              Anteriormente oferecido como serviço premium, nossa biblioteca de quadrinhos agora é totalmente gratuita para todos os usuários!
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            O Que Você Encontra na Biblioteca
          </h2>
          <p className="text-muted-foreground">
            Nossa coleção inclui milhares de títulos organizados em categorias:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-bold text-red-500 mb-2">🦸 Marvel</h3>
              <p className="text-sm text-muted-foreground m-0">
                Homem-Aranha, X-Men, Vingadores, Hulk, Wolverine, Deadpool e todos os heróis da Casa das Ideias.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-bold text-blue-500 mb-2">🦇 DC Comics</h3>
              <p className="text-sm text-muted-foreground m-0">
                Batman, Superman, Mulher-Maravilha, Flash, Liga da Justiça, Coringa e muito mais.
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h3 className="font-bold text-orange-500 mb-2">📖 Mangá</h3>
              <p className="text-sm text-muted-foreground m-0">
                Naruto, One Piece, Dragon Ball, Demon Slayer, Attack on Titan, My Hero Academia e outros clássicos.
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="font-bold text-purple-500 mb-2">📚 Outros</h3>
              <p className="text-sm text-muted-foreground m-0">
                Comics independentes, graphic novels, clássicos e lançamentos de diversas editoras.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Como Usar a Biblioteca
          </h2>
          <ol className="text-muted-foreground space-y-3">
            <li><strong>1. Acesse a seção de Quadrinhos</strong> no menu principal ou na página inicial</li>
            <li><strong>2. Filtre por categoria</strong> clicando nos botões Marvel, DC ou Mangá</li>
            <li><strong>3. Escolha um título</strong> da galeria de capas</li>
            <li><strong>4. Clique para ler</strong> - o conteúdo abre diretamente no navegador</li>
          </ol>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Títulos Populares em Destaque
          </h2>
          <ul className="text-muted-foreground space-y-2">
            <li>🕷️ <strong>Homem-Aranha</strong> - As aventuras do amigão da vizinhança</li>
            <li>🦇 <strong>Batman</strong> - O Cavaleiro das Trevas de Gotham</li>
            <li>🍥 <strong>Naruto</strong> - A jornada do ninja mais determinado</li>
            <li>⚔️ <strong>Demon Slayer</strong> - Kimetsu no Yaiba completo</li>
            <li>🏴‍☠️ <strong>One Piece</strong> - A busca pelo tesouro lendário</li>
            <li>🐉 <strong>Dragon Ball</strong> - Goku e as Esferas do Dragão</li>
            <li>🧬 <strong>Wolverine</strong> - O mutante indestrutível</li>
            <li>💪 <strong>Hulk</strong> - O Gigante Esmeralda</li>
            <li>🦸 <strong>Superman</strong> - O Homem de Aço</li>
          </ul>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-foreground">Aviso Legal</span>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              O ClipSave não hospeda conteúdo. A biblioteca utiliza agregadores externos para exibição. Os direitos autorais pertencem aos respectivos criadores e editoras. Use para leitura pessoal e apoie os autores comprando os originais.
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Última atualização: Janeiro 2025
            </p>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default BibliotecaQuadrinhos;