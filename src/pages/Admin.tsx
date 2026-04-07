import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/integrations/supabase/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Lock, Plus, Trash2, Edit, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";

type Announcement = {
  id: string;
  title: string;
  message: string;
  active: boolean;
  created_at: string;
};

type DownloaderStatus = {
  id: string;
  platform: string;
  status: string;
  last_checked: string;
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [downloaderStatuses, setDownloaderStatuses] = useState<DownloaderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const invokeManageAnnouncements = async (body: any) => {
    const resp = await fetch('/api/manage-announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Erro');
    return { data };
  };

  const fetchDownloaderStatuses = async () => {
    const { data, error } = await fromTable("downloader_status")
      .select("*")
      .order("platform");
    
    if (!error && data) {
      setDownloaderStatuses(data as DownloaderStatus[]);
    } else if (error) {
      console.error("Error fetching downloader statuses:", error);
      toast({ title: "Erro ao carregar status dos downloaders", variant: "destructive" });
    }
  };

  const toggleDownloaderStatus = async (downloader: DownloaderStatus) => {
    setStatusLoading(downloader.id);
    const newStatus = downloader.status === "active" ? "maintenance" : "active";
    
    const { error } = await fromTable("downloader_status")
      .update({ status: newStatus, last_checked: new Date().toISOString() })
      .eq("id", downloader.id);
    
    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } else {
      toast({ 
        title: `${downloader.platform} ${newStatus === "active" ? "ativado" : "em manutenção"}!`,
        description: newStatus === "active" ? "O serviço está ativo." : "O serviço está em manutenção."
      });
      fetchDownloaderStatuses();
    }
    
    setStatusLoading(null);
  };

  const authenticate = async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeManageAnnouncements({ action: "list", password });
      if (error) throw error;
      setIsAuthenticated(true);
      setAnnouncements(data.data || []);
      fetchDownloaderStatuses();
      toast({ title: "Login realizado com sucesso!" });
    } catch {
      toast({ title: "Senha incorreta", variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    const { data } = await invokeManageAnnouncements({ action: "list", password });
    if (data?.data) setAnnouncements(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await invokeManageAnnouncements({
          action: "update",
          password,
          data: { id: editingId, title, message: content, active: true },
        });
        toast({ title: "Aviso atualizado!" });
      } else {
        await invokeManageAnnouncements({
          action: "create",
          password,
          data: { title, message: content },
        });
        toast({ title: "Aviso criado!" });
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      fetchAnnouncements();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setLoading(false);
  };

  const toggleActive = async (announcement: Announcement) => {
    await invokeManageAnnouncements({
      action: "update",
      password,
      data: { ...announcement, active: !announcement.active },
    });
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;
    await invokeManageAnnouncements({ action: "delete", password, data: { id } });
    toast({ title: "Aviso excluído!" });
    fetchAnnouncements();
  };

  const editAnnouncement = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.message);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-3">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center mb-6">Área Administrativa</h1>
          <form onSubmit={(e) => { e.preventDefault(); authenticate(); }} className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha de admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
          <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mt-4 text-sm">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <RefreshCw size={18} />
              Status dos Downloaders
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ative ou desative cada serviço de download.
          </p>
          {downloaderStatuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>Carregando status dos downloaders...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {downloaderStatuses.map((downloader) => {
                const isActive = downloader.status === "active";
                return (
                  <div
                    key={downloader.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isActive
                        ? "bg-green-500/5 border-green-500/30" 
                        : "bg-yellow-500/5 border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isActive ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                      }`} />
                      <div>
                        <span className="font-medium">{downloader.platform}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                          isActive
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {isActive ? "ATIVO" : "MANUTENÇÃO"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground mr-2">
                        {isActive ? "Desativar" : "Ativar"}
                      </span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleDownloaderStatus(downloader)}
                        disabled={statusLoading === downloader.id}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            {editingId ? <Edit size={18} /> : <Plus size={18} />}
            {editingId ? "Editar Aviso" : "Novo Aviso"}
          </h2>
          <div className="space-y-4">
            <Input placeholder="Título do aviso" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background" />
            <Textarea placeholder="Conteúdo do aviso" value={content} onChange={(e) => setContent(e.target.value)} className="bg-background min-h-[100px]" />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Aviso"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setTitle(""); setContent(""); }}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="font-semibold">Avisos Existentes</h2>
          {announcements.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum aviso cadastrado</p>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-card border rounded-xl p-4 ${
                  announcement.active ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                    <span className="text-xs text-muted-foreground/60 mt-2 block">
                      {new Date(announcement.created_at).toLocaleDateString("pt-BR")}
                      {!announcement.active && " • Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => toggleActive(announcement)} title={announcement.active ? "Desativar" : "Ativar"}>
                      {announcement.active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => editAnnouncement(announcement)}>
                      <Edit size={18} />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteAnnouncement(announcement.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
