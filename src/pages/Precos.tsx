import { Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, Infinity as InfinityIcon, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const features = [
  "Acesso ilimitado a todos os downloaders",
  "Todas as ferramentas de IA sem limite",
  "Geração ilimitada de QR Code, senhas e avatares",
  "Conversor MP4 → MP3 sem marca d'água",
  "Remoção de fundo de imagens",
  "Biblioteca completa de jogos retrô",
  "Quadrinhos, blog e conteúdo exclusivo",
  "Histórico, favoritos e perfil personalizado",
  "Suporte da comunidade",
  "Sem anúncios invasivos",
];

const Precos = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Heart className="w-3.5 h-3.5" />
            100% gratuito • para sempre
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Por que é grátis? <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sem pegadinhas.</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Não existem planos, trial nem paywall no SOS/01. O site se mantém com doações voluntárias de quem usa e gosta — e continua aberto para todo mundo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 via-card to-accent/10 backdrop-blur p-6 relative shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Tudo liberado
            </div>
            <div className="text-sm font-medium text-primary mb-2 mt-2">Sempre gratuito</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">R$ 0</span>
              <InfinityIcon className="w-5 h-5 text-accent" />
            </div>
            <ul className="space-y-2.5 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" size="lg">
              <Link to="/ferramentas">
                <Zap className="w-4 h-4" />
                Usar as ferramentas
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card/30 backdrop-blur p-8 space-y-4">
            <h2 className="text-2xl font-bold">Como o site se sustenta</h2>
            <p className="text-muted-foreground">
              Servidores, domínio e manutenção saem do bolso de quem cuida do projeto. Quem quiser ajudar pode fazer uma doação via Pix — qualquer valor mantém tudo no ar por mais tempo.
            </p>
            <p className="text-muted-foreground">
              Doar é opcional e não desbloqueia nada: quem doa e quem não doa usam exatamente as mesmas ferramentas, sem limite e sem anúncio invasivo.
            </p>
            <p className="text-muted-foreground">
              O botão de doação fica sempre visível no canto da tela, em qualquer página.
            </p>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Precos;