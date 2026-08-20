import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAction } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, RefreshCcw } from "lucide-react";

interface AppearanceSectionProps {
  password?: string;
}

export default function AppearanceSection({ password }: AppearanceSectionProps) {
  const queryClient = useQueryClient();

  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin-tools", password],
    queryFn: async () => {
      const result = await adminAction({
        data: {
          password: password || "",
          payload: { action: "list-tools" }
        }
      });
      return result.data as any[];
    },
    enabled: !!password,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'maintenance' }) => {
      return adminAction({
        data: {
          password: password || "",
          payload: { action: "update-tool-status", id, status }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      toast.success("Status atualizado!");
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Aparência & Ferramentas</h2>
        <p className="text-muted-foreground">Gerencie o estado operacional das ferramentas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Carregando ferramentas...</div>
        ) : (
          tools?.map((tool) => (
            <div key={tool.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg truncate">{tool.feature_name}</h4>
                {tool.status === 'active' ? (
                  <div className="bg-green-500/10 text-green-500 p-1 rounded-full">
                    <CheckCircle2 size={16} />
                  </div>
                ) : (
                  <div className="bg-orange-500/10 text-orange-500 p-1 rounded-full">
                    <AlertTriangle size={16} />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant={tool.status === 'active' ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: tool.id, status: 'active' })}
                  disabled={tool.status === 'active' || updateStatusMutation.isPending}
                >
                  Ativo
                </Button>
                <Button 
                  size="sm" 
                  variant={tool.status === 'maintenance' ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: tool.id, status: 'maintenance' })}
                  disabled={tool.status === 'maintenance' || updateStatusMutation.isPending}
                >
                  Manutenção
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
