import { supabase } from "@/integrations/supabase/client";

const tools = [
  // AI Tools
  { platform: "pixel-avatar", label: "Avatar Pixelado", category: "ai", status: "active" },
  { platform: "ai-text", label: "Gerador de Texto IA", category: "ai", status: "active" },
  { platform: "translator", label: "Tradutor Automático", category: "ai", status: "active" },
  { platform: "summarizer", label: "Resumidor de Texto", category: "ai", status: "active" },
  { platform: "ocr", label: "OCR Imagem → Texto", category: "ai", status: "active" },
  { platform: "tts", label: "Texto → Voz", category: "ai", status: "active" },
  { platform: "stt", label: "Voz → Texto", category: "ai", status: "active" },
  
  // Utility Tools
  { platform: "mp4-to-mp3", label: "Conversor MP4 → MP3", category: "utility", status: "active" },
  { platform: "url-shortener", label: "Encurtador de URL", category: "utility", status: "active" },
  { platform: "background-remover", label: "Removedor de Fundo", category: "utility", status: "active" },
  { platform: "thumbnail", label: "Gerador de Thumbnails", category: "utility", status: "active" },
  { platform: "qr-code", label: "Gerador de QR Code", category: "utility", status: "active" },
  { platform: "watermark", label: "Marca d'água", category: "utility", status: "active" },
  { platform: "password", label: "Gerador de Senhas", category: "utility", status: "active" },
  { platform: "remover-metadados", label: "Removedor de Metadados", category: "utility", status: "active" },
  { platform: "image-to-pdf", label: "Imagem para PDF", category: "utility", status: "active" },
  { platform: "pdf-signer", label: "Assinador de PDF", category: "utility", status: "active" },
  { platform: "meu-ip", label: "Meu IP", category: "utility", status: "active" },
  { platform: "velocidade", label: "Teste de Velocidade", category: "utility", status: "active" },
  { platform: "cores", label: "Extrator de Cores", category: "utility", status: "active" },
  { platform: "scanner", label: "Scanner de Documentos", category: "utility", status: "active" },
  { platform: "idioma", label: "Detector de Idioma", category: "utility", status: "active" },
  
  // Other
  { platform: "games", label: "Painel de Jogos", category: "other", status: "active" }
];

export async function seedTools() {
  for (const tool of tools) {
    const { error } = await supabase
      .from("downloader_status")
      .upsert(
        { 
          platform: tool.platform, 
          label: tool.label, 
          category: tool.category, 
          status: tool.status,
          last_checked: new Date().toISOString()
        },
        { onConflict: "platform" }
      );
    
    if (error) console.error(`Error seeding ${tool.platform}:`, error);
  }
}
