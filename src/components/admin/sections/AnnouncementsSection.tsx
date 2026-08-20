import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAction } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Megaphone, Loader2 } from "lucide-react";

interface AnnouncementsSectionProps {
  password?: string;
}

export default function AnnouncementsSection({ password }: AnnouncementsSectionProps) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements", password],
    queryFn: async () => {
      const result = await adminAction({
        data: {
          password: password || "",
          payload: { action: "list-announcements" }
        }
      });
      return result.data as any[];
    },
    enabled: !!password,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return adminAction({
        data: {
          password: password || "",
          payload: { 
            action: "create-announcement", 
            data: { title: newTitle, message: newMessage } 
          }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setNewTitle("");
      setNewMessage("");
      toast.success("Aviso criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar aviso.")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminAction({
        data: {
          password: password || "",
          payload: { action: "delete-announcement", id }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Aviso removido!");
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Avisos</h2>
        <p className="text-muted-foreground">Gerencie o letreiro e comunicados do site.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plus size={20} /> Novo Aviso
        </h3>
        <div className="grid gap-4">
          <Input 
            placeholder="Título do aviso" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
          />
          <Textarea 
            placeholder="Mensagem detalhada" 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)} 
          />
          <Button 
            disabled={!newTitle || !newMessage || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? <Loader2 className="animate-spin" /> : "Publicar Aviso"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando avisos...</div>
        ) : announcements?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum aviso ativo.</div>
        ) : (
          announcements?.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Megaphone className="text-orange-500" size={20} />
                </div>
                <div>
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate(item.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
