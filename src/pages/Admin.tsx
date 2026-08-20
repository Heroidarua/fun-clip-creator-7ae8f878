import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Lock, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminPwa from "@/components/AdminPwa";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import DashboardSection from "@/components/admin/sections/DashboardSection";
import AnnouncementsSection from "@/components/admin/sections/AnnouncementsSection";
import VideoSection from "@/components/admin/sections/VideoSection";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const saved = localStorage.getItem("sos01_admin_auth");
    if (saved) {
      setPassword(saved);
      setIsAuthenticated(true);
    }
  }, []);

  const authenticate = async () => {
    setLoading(true);
    try {
      // Small verification call using the new adminAction
      const { adminAction } = await import("@/lib/admin.functions");
      await adminAction({ 
        data: { 
          password, 
          payload: { action: "get-metrics" } 
        } 
      });
      setIsAuthenticated(true);
      localStorage.setItem("sos01_admin_auth", password);
      toast({ title: "Bem-vindo ao Painel" });
    } catch (e: any) {
      toast({ title: "Acesso negado", description: "Senha incorreta.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sos01_admin_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Painel de Controle</h1>
          <p className="text-center text-muted-foreground mb-8 text-sm">Autenticação necessária</p>
          
          <form onSubmit={(e) => { e.preventDefault(); authenticate(); }} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-background/50 border-border focus:ring-primary/20"
              autoFocus
            />
            <Button type="submit" className="w-full h-12 font-bold text-base" disabled={loading}>
              {loading ? "Verificando..." : "Entrar no Sistema"}
            </Button>
          </form>

          <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mt-8 text-sm transition-colors">
            <ArrowLeft size={16} /> Voltar ao site principal
          </Link>
          
          <div className="mt-6 pt-6 border-t border-border">
            <AdminPwa />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {activeTab === "dashboard" && <DashboardSection password={password} />}
      {activeTab === "announcements" && <AnnouncementsSection password={password} />}
      {activeTab === "video" && <VideoSection password={password} />}
      {!["dashboard", "announcements", "video"].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <div className="bg-muted rounded-full p-6">
            <Lock className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">Em Construção</h2>
          <p className="text-muted-foreground">Esta seção ({activeTab}) está sendo migrada para a nova arquitetura modular.</p>
        </div>
      )}
    </AdminLayout>
  );
}
