import { useQuery, useMutation } from "@tanstack/react-query";
import { listEnhancementJobs, deleteEnhancementJob } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Video, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface VideoSectionProps {
  password?: string;
}

export default function VideoSection({ password }: VideoSectionProps) {
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ["admin-video-jobs", password],
    queryFn: async () => {
      const result = await listEnhancementJobs({ data: { password: password || "" } });
      return result.data as any[];
    },
    enabled: !!password,
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return deleteEnhancementJob({ data: { password: password || "", jobId } });
    },
    onSuccess: () => {
      refetch();
      toast.success("Job removido!");
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="text-green-500" size={18} />;
      case "processing": return <Clock className="text-blue-500 animate-pulse" size={18} />;
      case "failed": return <AlertCircle className="text-destructive" size={18} />;
      default: return <Clock className="text-muted-foreground" size={18} />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vídeos</h2>
        <p className="text-muted-foreground">Log de processamento e melhoria de vídeos.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">URL Original</th>
                <th className="text-left p-4 font-medium">Data</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Carregando jobs...</td></tr>
              ) : jobs?.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhum job encontrado.</td></tr>
              ) : (
                jobs?.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium">
                        {getStatusIcon(job.status)}
                        <span className="capitalize">{job.status}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate font-mono text-xs opacity-70">
                      {job.input_url || "N/A"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(job.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {job.output_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={job.output_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} className="mr-1" /> Ver
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Tem certeza? Isso apagará o arquivo do storage.")) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
