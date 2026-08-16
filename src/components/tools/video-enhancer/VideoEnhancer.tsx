import React, { useState, useEffect } from "react";
import { Upload, Video, Settings2, Sparkles, Download, Loader2, Info, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createEnhancementJob, getJobStatus } from "@/lib/video-enhancer/jobs.functions";
import type { EnhancementMode, ResolutionTier } from "@/lib/video-enhancer/types";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

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

  const createJob = useServerFn(createEnhancementJob);
  const checkStatus = useServerFn(getJobStatus);

  // Restaurar job pendente do localStorage
  useEffect(() => {
    const savedJobId = localStorage.getItem('pending_video_enhancement_id');
    if (savedJobId) {
      setJobId(savedJobId);
      startPolling(savedJobId);
    }
  }, []);

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

  const startPolling = (id: string) => {
    setUploading(true);
    const interval = setInterval(async () => {
      try {
        const updatedJob = await checkStatus({ 
          data: { jobId: id } 
        });
        setStatus(updatedJob);
        
        if ((updatedJob as any).status === 'completed' || (updatedJob as any).status === 'failed') {
          clearInterval(interval);
          setUploading(false);
          localStorage.removeItem('pending_video_enhancement_id');
          if ((updatedJob as any).status === 'completed') {
            toast.success("Melhoria concluída com sucesso!");
          } else {
            toast.error("Falha no processamento: " + (updatedJob as any).error_message);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000); // Polling cada 5s para economizar recursos
    return () => clearInterval(interval);
  };

  const startEnhancement = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const job = await createJob({
        data: {
          filename: file.name,
          size: file.size,
          options
        }
      });
      
      const id = (job as any).id;
      setJobId(id);
      setStatus(job);
      localStorage.setItem('pending_video_enhancement_id', id);
      toast.success("Vídeo enviado! Iniciando processamento...");
      
      startPolling(id);
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar a melhoria do vídeo.");
      setUploading(false);
    }
  };

  const getStatusMessage = (status: string, progress: number) => {
    if (status === 'queued') return "Na fila de espera...";
    if (status === 'processing') {
      if (progress < 20) return "Analisando metadados do vídeo...";
      if (progress < 40) return "Preparando filtros de IA...";
      if (progress < 60) return "Removendo ruído e granulação...";
      if (progress < 80) return "Realizando upscale de resolução...";
      return "Finalizando compressão e áudio...";
    }
    if (status === 'completed') return "Processamento concluído!";
    if (status === 'failed') return "Erro no processamento.";
    return "Aguarde...";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 font-orbitron">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-archivo-black uppercase tracking-tighter text-foreground">Melhorar Vídeo</h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Aumente a resolução, remova ruído e melhore a clareza dos seus vídeos com IA.
        </p>
      </div>

      {!jobId ? (
        <Card className="pixel-card p-8 bg-background/50 backdrop-blur-sm border-2 border-primary/20">
          <div className="flex flex-col items-center justify-center space-y-6">
            {!file ? (
              <>
                <div className="w-16 h-16 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-pixel text-xs text-foreground">Clique para selecionar ou arraste o vídeo</p>
                  <p className="text-[10px] text-muted-foreground mt-2">MP4, MOV ou AVI (Máx. 500MB)</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={handleFileChange}
                />
                <Button onClick={() => document.getElementById('video-upload')?.click()} className="btn-3d font-pixel text-[10px]">
                  Selecionar Arquivo
                </Button>
              </>
            ) : (
              <div className="w-full space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-sm bg-primary/5 border border-primary/20">
                  <Video className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-pixel text-xs truncate text-foreground">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="font-pixel text-[8px] text-destructive">Remover</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-pixel text-xs flex items-center gap-2 text-foreground uppercase">
                      <Settings2 className="w-4 h-4 text-primary" /> Nível
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(['light', 'standard', 'maximum'] as const).map((m) => (
                        <Button
                          key={m}
                          variant={options.mode === m ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOptions({ ...options, mode: m })}
                          className="font-pixel text-[8px] uppercase"
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-pixel text-xs flex items-center gap-2 text-foreground uppercase">
                      <Sparkles className="w-4 h-4 text-accent" /> Resolução
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(['auto', '720p', '1080p', '4k'] as const).map((r) => (
                        <Button
                          key={r}
                          variant={options.targetResolution === r ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOptions({ ...options, targetResolution: r as ResolutionTier })}
                          className="font-pixel text-[8px] uppercase"
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 text-sm font-pixel btn-3d" onClick={startEnhancement} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      PROCESSANDO...
                    </>
                  ) : (
                    "MELHORAR VÍDEO AGORA"
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="pixel-card p-8 space-y-6 bg-background/50 border-2 border-primary/20">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-pixel text-xs uppercase tracking-tighter text-foreground">Status do Processamento</h3>
                <p className="text-[10px] text-muted-foreground mt-1">ID: {jobId}</p>
              </div>
              <span className="px-2 py-1 rounded-sm bg-primary/10 text-primary text-[8px] font-pixel border border-primary/20 uppercase">
                {status?.status}
              </span>
            </div>
            <Progress value={status?.progress || 0} className="h-2 rounded-none bg-muted" />
            <p className="text-center font-pixel text-[10px] text-foreground">{status?.progress || 0}% CONCLUÍDO</p>
          </div>

          <div className="p-6 bg-muted/20 border border-border/50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-pixel text-xs text-foreground truncate max-w-[200px]">{status?.original_filename}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Modo: {status?.enhancement_mode}</p>
              </div>
            </div>

            {status?.status === 'completed' && (
              <Button className="w-full btn-3d font-pixel text-[10px]" asChild>
                <a href={status.output_url} download>
                  <Download className="w-4 h-4 mr-2" />
                  BAIXAR VÍDEO MELHORADO
                </a>
              </Button>
            )}

            {status?.status === 'failed' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-pixel">
                ERRO: {status.error_message}
              </div>
            )}
          </div>

          {status?.status !== 'completed' && status?.status !== 'failed' && (
            <p className="text-center text-[8px] font-pixel text-muted-foreground animate-pulse">
              NÃO FECHE ESTA PÁGINA ATÉ A CONCLUSÃO DO PROCESSO.
            </p>
          )}

          {(status?.status === 'completed' || status?.status === 'failed') && (
            <Button variant="ghost" className="w-full font-pixel text-[8px] uppercase text-muted-foreground" onClick={() => {
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
