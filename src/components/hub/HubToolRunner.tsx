// HubToolRunner - executes hub tools
import type { ToolId } from "./HubQuickActions";
import { toast } from "sonner";

async function streamAI(
  action: string,
  payload: Record<string, string>,
  onDelta: (text: string) => void
): Promise<string> {
  const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Erro" }));
    throw new Error(err.error || "Erro na IA");
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error("Stream indisponível");

  const decoder = new TextDecoder();
  let buf = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") break;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) {
          full += c;
          onDelta(full);
        }
      } catch {}
    }
  }
  return full;
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let pw = "";
  for (let i = 0; i < 20; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function runTool(
  toolId: ToolId,
  input: string,
  file: File | undefined,
  onDelta: (text: string) => void
): Promise<{ text: string; resultUrl?: string; resultType?: string }> {
  switch (toolId) {
    case "summarize":
      if (!input) throw new Error("Envie o texto para resumir");
      const sum = await streamAI("summarize", { text: input }, onDelta);
      return { text: sum };

    case "translate":
      if (!input) throw new Error("Envie o texto para traduzir");
      const tl = await streamAI("translate", { text: input, targetLanguage: "en" }, onDelta);
      return { text: tl };

    case "generate_text":
      if (!input) throw new Error("Descreva o que deseja gerar");
      const gen = await streamAI("generate", { prompt: input }, onDelta);
      return { text: gen };

    case "password": {
      const pw = generatePassword();
      onDelta(`🔑 Senha gerada:\n\n\`${pw}\`\n\nClique para copiar!`);
      navigator.clipboard.writeText(pw);
      toast.success("Senha copiada!");
      return { text: `🔑 Senha gerada:\n\n${pw}\n\n✅ Copiada para a área de transferência!` };
    }

    case "qr_code": {
      const qrText = input || "https://sos01.com.br";
      const QRCode = await import("qrcode");
      const url = await QRCode.toDataURL(qrText, { width: 400, margin: 2, color: { dark: "#ffffff", light: "#00000000" } });
      onDelta("✅ QR Code gerado com sucesso!");
      return { text: `📱 QR Code gerado para:\n${qrText}`, resultUrl: url, resultType: "image" };
    }

    case "shorten_url": {
      if (!input) throw new Error("Cole a URL para encurtar");
      onDelta("🔗 Sua URL foi processada! Use serviços como TinyURL ou Bitly para encurtar links permanentemente.\n\nURL original: " + input);
      return { text: `🔗 URL processada:\n${input}\n\nDica: Copie e use em serviços como TinyURL para criar um link curto permanente!` };
    }

    case "mp4_to_mp3": {
      if (!file) throw new Error("Envie um arquivo de vídeo MP4");
      onDelta("🎵 Processando vídeo... Extraindo áudio...");
      
      const audioCtx = new AudioContext();
      const arrayBuf = await file.arrayBuffer();
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
      
      const offlineCtx = new OfflineAudioContext(
        audioBuf.numberOfChannels,
        audioBuf.length,
        audioBuf.sampleRate
      );
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuf;
      source.connect(offlineCtx.destination);
      source.start();
      
      const rendered = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(rendered);
      const url = URL.createObjectURL(wavBlob);
      
      onDelta("✅ Áudio extraído com sucesso!");
      return { text: "🎵 Áudio extraído do vídeo com sucesso!", resultUrl: url, resultType: "audio" };
    }

    case "remove_bg":
    case "thumbnail":
    case "watermark":
    case "image_to_pdf":
    case "pixel_avatar": {
      onDelta(`⚙️ Para usar a ferramenta "${toolId}", acesse a seção de Ferramentas completa.\n\n👉 Essas ferramentas requerem interação visual avançada que funciona melhor na página dedicada.`);
      return { text: `⚙️ Ferramenta "${toolId}" disponível na página de Ferramentas!\n\nAlgumas ferramentas com processamento visual avançado funcionam melhor na interface dedicada. Acesse /ferramentas para usar.` };
    }

    default:
      throw new Error("Ferramenta não reconhecida");
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
