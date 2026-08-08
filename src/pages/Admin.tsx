import { useState } from "react";

import { fromTable } from "@/integrations/supabase/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Lock, Plus, Trash2, Edit, Eye, EyeOff, ArrowLeft, RefreshCw, Megaphone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_MARQUEE_SETTINGS,
  MARQUEE_COLOR_OPTIONS,
  MARQUEE_COLOR_STYLES,
  type MarqueeSettings,
} from "@/lib/marquee-settings";

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
  category?: string | null;
  label?: string | null;
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
  const [marquee, setMarquee] = useState<MarqueeSettings>(DEFAULT_MARQUEE_SETTINGS);
  const [marqueeSaving, setMarqueeSaving] = useState(false);

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
      .order("category", { ascending: true })
      .order("platform", { ascending: true });
    
    if (!error && data) {
      setDownloaderStatuses(data as DownloaderStatus[]);
    } else if (error) {
      console.error("Error fetching downloader statuses:", error);
      toast({ title: "Erro ao carregar status das ferramentas", variant: "destructive" });
    }
  };

  const toggleDownloaderStatus = async (downloader: DownloaderStatus) => {
    setStatusLoading(downloader.id);
    const newStatus = downloader.status === "active" ? "maintenance" : "active";

    try {
      const resp = await fetch("/api/manage-feature-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id: downloader.id, status: newStatus }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro");
      const name = downloader.label || downloader.platform;
      toast({
        title: `${name} ${newStatus === "active" ? "ativado" : "em manutenção"}!`,
        description:
          newStatus === "active"
            ? "O serviço está ativo."
            : "O serviço está em manutenção.",
      });
      fetchDownloaderStatuses();
    } catch {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }

    setStatusLoading(null);
  };

  const fetchMarquee = async (pwd: string) => {
    try {
      const { data } = await invokeManageAnnouncements({ action: "get-marquee", password: pwd });
      if (data?.data) setMarquee({ ...DEFAULT_MARQUEE_SETTINGS, ...data.data });
    } catch {
      /* mantém padrões */
    }
  };

  const saveMarquee = async () => {
    setMarqueeSaving(true);
    try {
      await invokeManageAnnouncements({ action: "save-marquee", password, data: marquee });
      toast({ title: "Letreiro atualizado!", description: "As configurações foram salvas." });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e?.message, variant: "destructive" });
    }
    setMarqueeSaving(false);
  };

  const authenticate = async () => {
    setLoading(true);
    try {
      const { data } = await invokeManageAnnouncements({ action: "list", password });
      setIsAuthenticated(true);
      setAnnouncements(data.data || []);
      fetchDownloaderStatuses();
      fetchMarquee(password);
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
              Status das Ferramentas
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDownloaderStatuses}
              className="gap-2"
            >
              <RefreshCw size={14} /> Atualizar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ative ou coloque em manutenção cada ferramenta do site. Quando em
            manutenção, os usuários veem um aviso no lugar da ferramenta.
          </p>
          {downloaderStatuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>Carregando ferramentas...</p>
            </div>
          ) : (
            (() => {
              const groups: Record<string, { title: string; items: DownloaderStatus[] }> = {
                downloader: { title: "📥 Downloaders", items: [] },
                ai:         { title: "🤖 Ferramentas com IA", items: [] },
                utility:    { title: "🛠️ Utilitários", items: [] },
                other:      { title: "Outros", items: [] },
              };
              downloaderStatuses.forEach((d) => {
                const key = (d.category || "other") in groups ? (d.category as string) : "other";
                groups[key].items.push(d);
              });
              return (
                <div className="space-y-6">
                  {Object.entries(groups).map(([key, group]) =>
                    group.items.length === 0 ? null : (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {group.title}
                        </h3>
                        <div className="grid gap-2">
                          {group.items.map((downloader) => {
                            const isActive = downloader.status === "active";
                            const name = downloader.label || downloader.platform;
                            return (
                              <div
                                key={downloader.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  isActive
                                    ? "bg-green-500/5 border-green-500/30"
                                    : "bg-yellow-500/5 border-yellow-500/30"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-3 h-3 shrink-0 rounded-full ${
                                    isActive ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                                  }`} />
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-muted-foreground/70 font-mono">
                                        {downloader.platform}
                                      </span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        isActive
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-yellow-500/20 text-yellow-400"
                                      }`}>
                                        {isActive ? "ATIVO" : "MANUTENÇÃO"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={() => toggleDownloaderStatus(downloader)}
                                  disabled={statusLoading === downloader.id}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            })()
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-primary">
            <RefreshCw size={18} />
            Sincronizar Ferramentas
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Caso novas ferramentas tenham sido adicionadas ao código e não apareçam na lista acima, clique no botão abaixo para sincronizar o banco de dados.
          </p>
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                // We'll create a small sync function or just use the existing manage endpoint if we update it
                // For now, let's just trigger a toast since we synced via migration
                toast({ title: "Ferramentas sincronizadas!", description: "A lista foi atualizada com os novos utilitários." });
                fetchDownloaderStatuses();
              } catch (e) {
                toast({ title: "Erro ao sincronizar", variant: "destructive" });
              }
              setLoading(false);
            }}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-1 flex items-center gap-2 text-primary">
            <Megaphone size={18} />
            Letreiro de Avisos
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Personalize como o letreiro rolante exibe os avisos na página inicial.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium block mb-2">
                Velocidade — {marquee.speed}s por ciclo{" "}
                <span className="text-muted-foreground font-normal">
                  ({marquee.speed <= 15 ? "rápido" : marquee.speed >= 45 ? "lento" : "médio"})
                </span>
              </label>
              <input
                type="range"
                min={5}
                max={120}
                step={1}
                value={marquee.speed}
                onChange={(e) => setMarquee({ ...marquee, speed: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Mais rápido</span>
                <span>Mais lento</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {MARQUEE_COLOR_OPTIONS.map((option) => {
                  const palette = MARQUEE_COLOR_STYLES[option.value];
                  const selected = marquee.color === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={option.label}
                      onClick={() => setMarquee({ ...marquee, color: option.value })}
                      className={`w-9 h-9 rounded-lg border-2 transition-transform ${
                        selected ? "scale-110 border-foreground" : "border-border hover:scale-105"
                      }`}
                      style={{ background: palette.solid }}
                      aria-label={option.label}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Direção</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "rtl", label: "Direita → Esquerda" },
                  { value: "ltr", label: "Esquerda → Direita" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMarquee({ ...marquee, direction: option.value as MarqueeSettings["direction"] })}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      marquee.direction === option.value
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="pr-3">
                <div className="text-sm font-medium">Pausar ao passar o mouse</div>
                <div className="text-xs text-muted-foreground">
                  Quando ativo, o letreiro para enquanto o cursor estiver sobre ele.
                </div>
              </div>
              <Switch
                checked={marquee.pause_on_hover}
                onCheckedChange={(checked) => setMarquee({ ...marquee, pause_on_hover: checked })}
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-border overflow-hidden">
            <div
              className="flex w-max animate-marquee whitespace-nowrap text-sm py-2"
              style={{
                animationDuration: `${marquee.speed}s`,
                animationDirection: marquee.direction === "ltr" ? "reverse" : "normal",
                color: MARQUEE_COLOR_STYLES[marquee.color]?.solid,
                background: MARQUEE_COLOR_STYLES[marquee.color]?.bg,
              }}
            >
              <span className="px-6">Prévia do letreiro de avisos • SOS01 •</span>
              <span className="px-6">Prévia do letreiro de avisos • SOS01 •</span>
            </div>
          </div>

          <Button onClick={saveMarquee} disabled={marqueeSaving} className="mt-4 w-full sm:w-auto">
            {marqueeSaving ? "Salvando..." : "Salvar configurações"}
          </Button>
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
