import { Link } from "@tanstack/react-router";
import { useUserStats } from "@/hooks/useUserStats";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wrench, Gamepad2, BookOpen, Download, User, ArrowRight, Zap, Heart } from "lucide-react";

const quickActions = [
  { to: "/hub", icon: Sparkles, title: "AI Hub", desc: "Ferramentas com IA em um só lugar", color: "from-violet-500/20 to-fuchsia-500/20" },
  { to: "/ferramentas", icon: Wrench, title: "Ferramentas", desc: "QR, senhas, conversores e mais", color: "from-blue-500/20 to-cyan-500/20" },
  { to: "/jogos", icon: Gamepad2, title: "Jogos Retrô", desc: "Biblioteca clássica completa", color: "from-amber-500/20 to-rose-500/20" },
  { to: "/blog", icon: BookOpen, title: "Blog & Guias", desc: "Tutoriais e artigos", color: "from-emerald-500/20 to-teal-500/20" },
] as const;

const Dashboard = () => {
  const { user, profile, isAuthenticated } = useUserStats();
  const name = profile?.display_name || user?.email?.split("@")[0] || "visitante";

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Welcome */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
            <Heart className="w-3 h-3" /> {isAuthenticated ? "Plano Free Forever ativo" : "Acesso livre"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Olá, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{name}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAuthenticated
              ? "Tudo que o SOS/01 oferece está liberado pra você. Sem limites."
              : "Entre no painel e acesse rapidamente ferramentas, jogos e conteúdos do SOS/01."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Zap, label: "Acessos", value: "∞", hint: "Ilimitados" },
            { icon: Download, label: "Downloads", value: "∞", hint: "Sem cota" },
            { icon: Sparkles, label: "IA", value: "∞", hint: "Sem limite" },
            { icon: Heart, label: "Plano", value: "Free", hint: "Para sempre" },
          ].map((s) => (
            <Card key={s.label} className="bg-card/50 backdrop-blur border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.hint}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="text-xl font-semibold mb-4">Acesso rápido</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {quickActions.map((q) => (
            <Link key={q.to} to={q.to} className="group">
              <Card className={`bg-gradient-to-br ${q.color} border-border hover:border-primary/50 transition-all hover:-translate-y-0.5`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-background/60 backdrop-blur flex items-center justify-center">
                      <q.icon className="w-5 h-5 text-primary" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg mt-3">{q.title}</CardTitle>
                  <CardDescription>{q.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Account */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Seu acesso</CardTitle>
            <CardDescription>{user?.email ?? "Sem login obrigatório"}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/perfil">Editar perfil</Link></Button>
            <Button asChild variant="ghost"><Link to="/precos">Ver planos</Link></Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;