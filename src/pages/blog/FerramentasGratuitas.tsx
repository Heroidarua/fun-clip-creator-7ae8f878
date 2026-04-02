import { Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Wrench, UserSquare2, Music, Link2, Eraser, Image, QrCode, Stamp, KeyRound, Sparkles, FileImage } from "lucide-react";

const FerramentasGratuitas = () => {
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
            <Wrench className="w-8 h-8 text-primary" />
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">FERRAMENTAS</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Todas as Ferramentas Gratuitas do ClipSave em 2025
          </h1>
          
          <p className="text-muted-foreground mb-8">
            O ClipSave oferece uma coleção completa de ferramentas digitais <strong>100% gratuitas</strong>. Neste guia, você vai conhecer cada uma delas e aprender a usar.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <p className="text-foreground font-medium m-0">
              💡 <strong>Dica:</strong> Todas as ferramentas funcionam diretamente no navegador, sem necessidade de instalar nada ou criar conta.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <UserSquare2 className="w-6 h-6 text-purple-500" />
            Gerador de Avatar Pixelado com IA
          </h2>
          <p className="text-muted-foreground">
            Nossa ferramenta em destaque! Crie avatares únicos em estilo pixel art usando inteligência artificial. Você pode:
          </p>
          <ul className="text-muted-foreground space-y-2">
            <li><strong>Escolher templates famosos:</strong> +60 personagens de Marvel, DC, Simpsons, Animes, Games e mais</li>
            <li><strong>Personalizar do zero:</strong> 24 estilos, 16 expressões, 15 cores, 12 fundos, 36+ acessórios</li>
            <li><strong>Combinar acessórios:</strong> Misture até 5 itens como chapéus, óculos, armas e mais</li>
            <li><strong>Exportar em vários tamanhos:</strong> Desde ícones 64x64 até banners 1200x630</li>
            <li><strong>Compartilhar:</strong> Envie direto para WhatsApp, Twitter, Instagram e outras redes</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Music className="w-6 h-6 text-orange-500" />
            Conversor MP4 para MP3
          </h2>
          <p className="text-muted-foreground">
            Extraia o áudio de qualquer vídeo MP4 e converta para MP3. O processamento é feito localmente no seu navegador, garantindo privacidade total. Ideal para:
          </p>
          <ul className="text-muted-foreground space-y-2">
            <li>Salvar músicas de vídeos</li>
            <li>Criar podcasts a partir de gravações</li>
            <li>Extrair áudio de aulas gravadas</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-blue-500" />
            Encurtador de URL
          </h2>
          <p className="text-muted-foreground">
            Transforme URLs longas em links curtos e fáceis de compartilhar. Funciona com qualquer site e gera links permanentes instantaneamente.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Eraser className="w-6 h-6 text-purple-500" />
            Removedor de Fundo com IA
          </h2>
          <p className="text-muted-foreground">
            Remova automaticamente o fundo de qualquer imagem usando inteligência artificial avançada. A ferramenta detecta pessoas, objetos e animais, criando recortes perfeitos com transparência. Perfeito para:
          </p>
          <ul className="text-muted-foreground space-y-2">
            <li>Fotos de produtos para e-commerce</li>
            <li>Fotos de perfil profissionais</li>
            <li>Montagens e colagens</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Image className="w-6 h-6 text-yellow-500" />
            Gerador de Thumbnails
          </h2>
          <p className="text-muted-foreground">
            Crie miniaturas profissionais para seus vídeos do YouTube, TikTok e outras plataformas. Adicione texto, ajuste cores e exporte em tamanhos otimizados para cada rede social.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-green-500" />
            Gerador de QR Code
          </h2>
          <p className="text-muted-foreground">
            Crie QR Codes personalizados para links, textos, Wi-Fi e muito mais. Escolha cores, tamanho e baixe a imagem pronta para usar em materiais impressos ou digitais.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Stamp className="w-6 h-6 text-pink-500" />
            Ferramenta de Marca D'Água
          </h2>
          <p className="text-muted-foreground">
            Proteja suas fotos e imagens adicionando marcas d'água de texto ou logo. Configure posição, opacidade e tamanho. Ideal para fotógrafos, designers e criadores de conteúdo.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-green-600" />
            Gerador de Senhas Fortes
          </h2>
          <p className="text-muted-foreground">
            Crie senhas seguras e impossíveis de adivinhar. Escolha o comprimento (6 a 32 caracteres) e quais tipos de caracteres incluir: letras maiúsculas, minúsculas, números e símbolos especiais. O indicador de força mostra o nível de segurança em tempo real.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <FileImage className="w-6 h-6 text-red-500" />
            Conversor de Imagem para PDF
          </h2>
          <p className="text-muted-foreground">
            Transforme suas imagens em um documento PDF de forma rápida e prática. Adicione múltiplas imagens (JPG, PNG, WEBP), reordene na sequência desejada e gere um PDF pronto para compartilhar ou imprimir. Todo o processamento é feito no navegador, sem enviar seus arquivos para nenhum servidor. Ideal para:
          </p>
          <ul className="text-muted-foreground space-y-2">
            <li>Digitalizar documentos e comprovantes</li>
            <li>Criar portfólios e catálogos visuais</li>
            <li>Reunir várias imagens em um único arquivo para envio</li>
          </ul>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              Tudo 100% Gratuito!
            </h3>
            <p className="text-muted-foreground m-0">
              Todas as ferramentas acima são gratuitas, sem limites de uso e sem necessidade de cadastro. Use quantas vezes quiser!
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

export default FerramentasGratuitas;