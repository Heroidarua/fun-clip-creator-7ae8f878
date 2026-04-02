import { useState, useRef } from "react";
import { Upload, Download, Music, Loader2, X, CheckCircle, FileVideo, AudioWaveform, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type ConversionStep = "idle" | "loading" | "decoding" | "generating" | "done";

const stepLabels: Record<ConversionStep, string> = {
  idle: "",
  loading: "Carregando vídeo...",
  decoding: "Decodificando áudio...",
  generating: "Gerando arquivo...",
  done: "Concluído!",
};

const stepProgress: Record<ConversionStep, number> = {
  idle: 0,
  loading: 25,
  decoding: 60,
  generating: 90,
  done: 100,
};

interface MP4ToMP3ConverterProps {
  onSuccess?: () => void;
}

const MP4ToMP3Converter = ({ onSuccess }: MP4ToMP3ConverterProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState<ConversionStep>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes("video/")) {
      toast({
        title: "❌ Formato inválido",
        description: "Por favor, selecione um arquivo de vídeo (MP4, WebM, etc.)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setAudioUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    setCurrentStep("loading");

    try {
      // Step 1: Load video file
      const arrayBuffer = await file.arrayBuffer();
      
      // Step 2: Decode audio
      setCurrentStep("decoding");
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Step 3: Generate file
      setCurrentStep("generating");
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      setAudioUrl(url);
      setCurrentStep("done");
      onSuccess?.();

      toast({
        title: "✅ Conversão concluída!",
        description: "Seu áudio está pronto para download.",
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "❌ Erro na conversão",
        description: "Não foi possível extrair o áudio do vídeo.",
        variant: "destructive",
      });
      setCurrentStep("idle");
    } finally {
      setConverting(false);
    }
  };

  // Convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const offset = 44;
    const channelData: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }
    
    let index = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset + index, intSample, true);
        index += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleDownload = () => {
    if (!audioUrl || !file) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = file.name.replace(/\.[^/.]+$/, '') + '.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null);
    setAudioUrl(null);
    setCurrentStep("idle");
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste um vídeo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground/70">
            Formatos: MP4, WebM, MOV • Sem limite de tamanho
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-sm">
            <Music className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {!converting && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress bar with steps */}
          {converting && (
            <div className="space-y-3">
              {/* Step indicators */}
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-1.5 ${currentStep === "loading" ? "text-primary" : currentStep !== "idle" ? "text-green-500" : "text-muted-foreground"}`}>
                  <FileVideo className="w-4 h-4" />
                  <span className="text-xs font-medium">Carregar</span>
                </div>
                <div className={`flex-1 h-0.5 ${currentStep !== "idle" && currentStep !== "loading" ? "bg-green-500" : "bg-muted"}`} />
                <div className={`flex items-center gap-1.5 ${currentStep === "decoding" ? "text-primary" : currentStep === "generating" || currentStep === "done" ? "text-green-500" : "text-muted-foreground"}`}>
                  <AudioWaveform className="w-4 h-4" />
                  <span className="text-xs font-medium">Decodificar</span>
                </div>
                <div className={`flex-1 h-0.5 ${currentStep === "generating" || currentStep === "done" ? "bg-green-500" : "bg-muted"}`} />
                <div className={`flex items-center gap-1.5 ${currentStep === "generating" ? "text-primary" : currentStep === "done" ? "text-green-500" : "text-muted-foreground"}`}>
                  <FileAudio className="w-4 h-4" />
                  <span className="text-xs font-medium">Gerar</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <Progress value={stepProgress[currentStep]} className="h-2" />
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {stepLabels[currentStep]}
              </p>
            </div>
          )}

          {/* Success state */}
          {audioUrl && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-500">Áudio extraído com sucesso!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!audioUrl ? (
              <Button
                onClick={handleConvert}
                disabled={converting}
                className="flex-1 font-pixel text-xs"
              >
                {converting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    CONVERTENDO...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    CONVERTER PARA ÁUDIO
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleDownload}
                  className="flex-1 font-pixel text-xs bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  BAIXAR ÁUDIO
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="font-pixel text-xs"
                >
                  NOVO
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MP4ToMP3Converter;
