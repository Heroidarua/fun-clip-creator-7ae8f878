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
            Tudo grátis. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sem pegadinhas.</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acreditamos que ferramentas digitais úteis devem ser acessíveis a todos. Por isso o SOS/01 é, e sempre será, totalmente gratuito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur p-6 opacity-60">
            <div className="text-sm font-medium text-muted-foreground mb-2">Starter</div>
            <div className="text-3xl font-bold mb-1">R$ 0</div>
            <div className="text-xs text-muted-foreground mb-4">/mês</div>
            <p className="text-sm text-muted-foreground">Plano básico hipotético</p>
          </div>

          <div className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 via-card to-accent/10 backdrop-blur p-6 relative shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> O nosso plano
            </div>
            <div className="text-sm font-medium text-primary mb-2">Free Forever</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">R$ 0</span>
              <InfinityIcon className="w-5 h-5 text-accent" />
            </div>
            <div className="text-xs text-muted-foreground mb-6">para sempre</div>
            <ul className="space-y-2.5 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" size="lg">
              <Link to="/auth">
                <Zap className="w-4 h-4" />
                Começar agora
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur p-6 opacity-60">
            <div className="text-sm font-medium text-muted-foreground mb-2">Pro</div>
            <div className="text-3xl font-bold mb-1">R$ 0</div>
            <div className="text-xs text-muted-foreground mb-4">/mês</div>
            <p className="text-sm text-muted-foreground">Plano premium hipotético</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/30 backdrop-blur p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Por que tudo é grátis?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            O SOS/01 nasceu como projeto comunitário. Mantemos a plataforma com receita de anúncios discretos e doações voluntárias — você nunca verá um paywall, trial ou cobrança surpresa.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Precos;