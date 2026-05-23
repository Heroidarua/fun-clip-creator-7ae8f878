import { Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, Wrench, Gamepad2, BookOpen, ArrowUpRight } from "lucide-react";

const items = [
  { to: "/hub", icon: Sparkles, title: "AI Hub", desc: "Ferramentas com IA em um só lugar" },
  { to: "/ferramentas", icon: Wrench, title: "Ferramentas", desc: "QR, senhas, conversores e mais" },
  { to: "/jogos", icon: Gamepad2, title: "Jogos", desc: "Biblioteca retrô completa" },
  { to: "/blog", icon: BookOpen, title: "Blog", desc: "Tutoriais e artigos" },
] as const;

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background font-inter flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Painel</p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Tudo do SOS/01 em um só lugar. Escolha por onde começar.
          </p>
        </header>

        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group flex items-center gap-4 py-5 hover:bg-muted/40 transition-colors -mx-4 px-4 rounded-md"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{item.desc}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;