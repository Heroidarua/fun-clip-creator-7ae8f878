import React, { useState, useEffect, useRef } from "react";
import { Upload, Video, Settings2, Sparkles, Download, Loader2, Info, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createEnhancementJob, getJobStatus, cancelEnhancementJob } from "@/lib/video-enhancer/jobs.functions";
import { setupStorage } from "@/lib/video-enhancer/setup.functions";
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
  const cancelJob = useServerFn(cancelEnhancementJob);
  const initStorage = useServerFn(setupStorage);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    setUploading(true);
    const interval = setInterval(async () => {
      try {
        const updatedJob = await checkStatus({ 
          data: { jobId: id } 
        });
        setStatus(updatedJob);
        
        if ((updatedJob as any).status === 'completed' || (updatedJob as any).status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setUploading(false);
          localStorage.removeItem('pending_video_enhancement_id');
          if ((updatedJob as any).status === 'completed') {
            toast.success("Melhoria concluída com sucesso!");
          } else if ((updatedJob as any).error_message !== 'Cancelado pelo usuário') {
            toast.error("Falha no processamento: " + (updatedJob as any).error_message);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); 
    pollingRef.current = interval;
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  };

  const handleCancel = async () => {
    if (!jobId) return;
    
    try {
      if (pollingRef.current) clearInterval(pollingRef.current);
      await cancelJob({ data: { jobId } });
      localStorage.removeItem('pending_video_enhancement_id');
      setJobId(null);
      setStatus(null);
      setUploading(false);
      toast.info("Processamento interrompido.");
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar o processamento.");
    }
  };

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    localStorage.removeItem('pending_video_enhancement_id');
    setJobId(null);
    setFile(null);
    setStatus(null);
    setUploading(false);
  };

  const startEnhancement = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Garantir que o bucket existe antes de começar
      await initStorage();
      
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
      toast.success("Enviando arquivo para processamento...");

      // Enviar o arquivo para a rota de processamento real
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobId", id);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/video-enhancer/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha no upload do arquivo.");
      }
      
      startPolling(id);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao iniciar a melhoria do vídeo.");
      setUploading(false);
    }
  };

  const getStatusMessage = (status: string, progress: number) => {
    if (status === 'queued') return "Na fila de espera...";
    if (status === 'processing') {
      if (progress < 5) return "Preparando ambiente...";
      if (progress < 12) return "Analisando formato e duração...";
      if (progress < 25) return "Iniciando motores de IA...";
      if (progress < 50) return "Processando frames (Redução de ruído)...";
      if (progress < 75) return "Processando frames (Upscaling & Nitidez)...";
      if (progress < 90) return "Finalizando renderização e áudio...";
      return "Enviando para nuvem (quase pronto)...";
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
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="font-pixel text-[8px] text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remover
                  </Button>
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

                <div className="bg-primary/5 p-4 rounded-sm border border-primary/10 space-y-2">
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p>O processamento é feito por IA e pode levar de 2 a 10 minutos dependendo da duração do vídeo e da resolução escolhida.</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p>Você pode fechar esta página e voltar mais tarde; o progresso será mantido.</p>
                  </div>
                </div>

                <Button className="w-full h-12 text-sm font-pixel btn-3d" onClick={startEnhancement} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ENVIANDO...
                    </>
                  ) : (
                    "INICIAR MELHORIA AGORA"
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
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded-sm text-[8px] font-pixel border uppercase ${
                  status?.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  status?.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-primary/10 text-primary border-primary/20'
                }`}>
                  {status?.status === 'queued' ? 'NA FILA' : 
                   status?.status === 'processing' ? 'PROCESSANDO' : 
                   status?.status === 'completed' ? 'CONCLUÍDO' : 
                   status?.status === 'failed' ? 'FALHOU' : status?.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-pixel text-muted-foreground">
                <span>{getStatusMessage(status?.status, status?.progress || 0)}</span>
                <span>{status?.progress || 0}%</span>
              </div>
              <Progress value={status?.progress || 0} className="h-2 rounded-none bg-muted" />
            </div>
          </div>

          <div className="p-6 bg-muted/20 border border-border/50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20">
                {status?.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                 status?.status === 'failed' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                 <Video className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-pixel text-xs text-foreground truncate">{status?.original_filename || 'Vídeo'}</p>
                  {status?.status !== 'completed' && status?.status !== 'failed' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCancel}
                      className="h-6 px-2 font-pixel text-[8px] text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      PARAR
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[8px] text-muted-foreground uppercase bg-foreground/5 px-1">Modo: {status?.enhancement_mode}</span>
                  {status?.input_size && (
                    <span className="text-[8px] text-muted-foreground uppercase bg-foreground/5 px-1">
                      Tamanho: {(status.input_size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  )}
                </div>
              </div>
            </div>

            {status?.status === 'completed' && (
              <div className="space-y-3">
                <Button className="w-full btn-3d font-pixel text-[10px]" asChild>
                  <a href={status.output_url} download={status.original_filename?.replace(/\.[^/.]+$/, "") + "_melhorado.mp4"}>
                    <Download className="w-4 h-4 mr-2" />
                    BAIXAR VÍDEO MELHORADO
                  </a>
                </Button>
                <p className="text-[9px] text-center text-muted-foreground font-pixel">
                  O link expira em 24 horas.
                </p>
              </div>
            )}

            {status?.status === 'failed' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-pixel space-y-2">
                <p className="font-bold">ERRO NO PROCESSAMENTO:</p>
                <p>{status.error_message || "Ocorreu um erro inesperado ao processar o vídeo. Tente um formato diferente ou um arquivo menor."}</p>
              </div>
            )}
          </div>

          {status?.status !== 'completed' && status?.status !== 'failed' && (
            <div className="bg-primary/5 p-4 border border-primary/10 rounded-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
              <p className="text-[9px] font-pixel text-muted-foreground leading-relaxed">
                ESTAMOS MELHORANDO SEU VÍDEO. VOCÊ PODE SAIR DESTA PÁGINA; O PROCESSAMENTO CONTINUA NO SERVIDOR.
              </p>
            </div>
          )}

          {(status?.status === 'completed' || status?.status === 'failed') && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1 font-pixel text-[8px] uppercase border-dashed" 
                onClick={handleReset}
              >
                <RefreshCcw className="w-3 h-3 mr-2" />
                Recomeçar / Novo Vídeo
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-archivo-black uppercase text-center text-foreground">Como Funciona</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="pixel-card p-4 space-y-2 bg-background/50">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
              <span className="font-pixel text-primary text-xs">01</span>
            </div>
            <h4 className="font-pixel text-[10px] text-foreground uppercase">Upload Local</h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed">O vídeo é enviado para nossos servidores seguros para processamento intensivo de IA.</p>
          </div>
          <div className="pixel-card p-4 space-y-2 bg-background/50">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
              <span className="font-pixel text-primary text-xs">02</span>
            </div>
            <h4 className="font-pixel text-[10px] text-foreground uppercase">IA Engine</h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed">Aplicamos Denoise para remover granulação, Sharpen para nitidez e Upscale de resolução.</p>
          </div>
          <div className="pixel-card p-4 space-y-2 bg-background/50">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
              <span className="font-pixel text-primary text-xs">03</span>
            </div>
            <h4 className="font-pixel text-[10px] text-foreground uppercase">Download</h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed">Assim que concluído, seu vídeo aprimorado fica disponível para download por 24 horas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}