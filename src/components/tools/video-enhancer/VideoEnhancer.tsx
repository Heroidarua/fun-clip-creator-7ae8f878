import React, { useState } from "react";
import { Upload, Video, Settings2, Sparkles, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createEnhancementJob, getJobStatus } from "@/lib/video-enhancer/jobs.functions";
import type { EnhancementMode, ResolutionTier } from "@/lib/video-enhancer/types";

export default function VideoEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [options, setOptions] = useState({
    mode: 'standard' as EnhancementMode,
    targetResolution: 'auto' as ResolutionTier,
    audio: {
      reduceNoise: true,
      boostVoice: true,
      normalize: true,
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast.error("O arquivo excede o limite de 500MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const startEnhancement = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const job = await createEnhancementJob({
        filename: file.name,
        size: file.size,
        options
      });
      
      setJobId(job.id);
      setStatus(job);
      toast.success("Vídeo enviado! Iniciando processamento...");
      
      // Polling progress
      const interval = setInterval(async () => {
        const updatedJob = await getJobStatus({ jobId: job.id });
        setStatus(updatedJob);
        
        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
          clearInterval(interval);
          setUploading(false);
          if (updatedJob.status === 'completed') {
            toast.success("Melhoria concluída com sucesso!");
          } else {
            toast.error("Falha no processamento: " + updatedJob.error_message);
          }
        }
      }, 3000);
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar a melhoria do vídeo.");
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-archivo-black uppercase tracking-tighter">Melhorar Vídeo</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Aumente a resolução, remova ruído e melhore a clareza dos seus vídeos com IA.
        </p>
      </div>

      {!jobId ? (
        <Card className="p-8 border-2 border-dashed border-primary/20 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center space-y-6">
            {!file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Clique para selecionar ou arraste o vídeo</p>
                  <p className="text-sm text-muted-foreground">MP4, MOV ou AVI (Máx. 500MB)</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={handleFileChange}
                />
                <Button onClick={() => document.getElementById('video-upload')?.click()}>
                  Selecionar Arquivo
                </Button>
              </>
            ) : (
              <div className="w-full space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Video className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remover</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Settings2 className="w-4 h-4" /> Qualidade da Melhoria
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(['light', 'standard', 'maximum'] as const).map((m) => (
                        <Button
                          key={m}
                          variant={options.mode === m ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOptions({ ...options, mode: m })}
                        >
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Resolução Alvo
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(['auto', '720p', '1080p', '4k'] as const).map((r) => (
                        <Button
                          key={r}
                          variant={options.targetResolution === r ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOptions({ ...options, targetResolution: r as ResolutionTier })}
                        >
                          {r.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg btn-3d" onClick={startEnhancement} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Melhorar Vídeo Agora"
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-archivo-black uppercase tracking-tighter">Status do Job</h3>
                <p className="text-sm text-muted-foreground">ID: {jobId}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                {status?.status}
              </span>
            </div>
            <Progress value={status?.progress || 0} className="h-3" />
            <p className="text-center text-sm font-medium">{status?.progress || 0}% Concluído</p>
          </div>

          <div className="p-6 rounded-2xl bg-muted/50 border border-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{status?.original_filename}</p>
                <p className="text-xs text-muted-foreground">Modo: {status?.enhancement_mode}</p>
              </div>
            </div>

            {status?.status === 'completed' && (
              <Button className="w-full btn-3d" asChild>
                <a href={status.output_url} download>
                  <Download className="w-5 h-5 mr-2" />
                  Baixar Vídeo Melhorado
                </a>
              </Button>
            )}

            {status?.status === 'failed' && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                Erro: {status.error_message}
              </div>
            )}
          </div>

          {status?.status !== 'completed' && status?.status !== 'failed' && (
            <p className="text-center text-xs text-muted-foreground animate-pulse">
              Não feche esta página até a conclusão do processo.
            </p>
          )}

          {(status?.status === 'completed' || status?.status === 'failed') && (
            <Button variant="ghost" className="w-full" onClick={() => {
              setJobId(null);
              setFile(null);
              setStatus(null);
            }}>
              Melhorar outro vídeo
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
