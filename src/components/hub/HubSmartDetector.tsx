// HubSmartDetector - intelligent input detection
import type { ToolId } from "./HubQuickActions";

export type DetectedType = "text" | "url" | "image" | "video" | "file" | "unknown";

export interface Detection {
  type: DetectedType;
  suggestions: { toolId: ToolId; label: string; emoji: string }[];
  mascotMessage: string;
}

const URL_REGEX = /https?:\/\/[^\s]+/i;

export function detectInput(text: string, file?: File): Detection {
  // File-based detection
  if (file) {
    if (file.type.startsWith("image/")) {
      return {
        type: "image",
        suggestions: [
          { toolId: "remove_bg", label: "Remover fundo", emoji: "✨" },
          { toolId: "thumbnail", label: "Criar thumbnail", emoji: "🖼️" },
          { toolId: "watermark", label: "Adicionar marca d'água", emoji: "💧" },
          { toolId: "image_to_pdf", label: "Converter para PDF", emoji: "📄" },
        ],
        mascotMessage: "Percebi que você enviou uma imagem! 🖼️ O que deseja fazer com ela?",
      };
    }
    if (file.type.startsWith("video/")) {
      return {
        type: "video",
        suggestions: [
          { toolId: "mp4_to_mp3", label: "Extrair áudio (MP3)", emoji: "🎵" },
          { toolId: "thumbnail", label: "Gerar thumbnail", emoji: "🖼️" },
        ],
        mascotMessage: "Um vídeo! 🎬 Quer que eu extraia o áudio ou crie uma thumbnail?",
      };
    }
    return {
      type: "file",
      suggestions: [],
      mascotMessage: "Recebi seu arquivo! Me diga o que deseja fazer com ele. 📁",
    };
  }

  // Text-based detection
  if (URL_REGEX.test(text)) {
    return {
      type: "url",
      suggestions: [
        { toolId: "shorten_url", label: "Encurtar URL", emoji: "🔗" },
        { toolId: "qr_code", label: "Gerar QR Code", emoji: "📱" },
      ],
      mascotMessage: "Detectei um link! 🔗 Posso encurtar ou gerar um QR Code pra você!",
    };
  }

  if (text.length > 50) {
    return {
      type: "text",
      suggestions: [
        { toolId: "summarize", label: "Resumir texto", emoji: "📝" },
        { toolId: "translate", label: "Traduzir", emoji: "🌍" },
        { toolId: "generate_text", label: "Melhorar texto", emoji: "✨" },
      ],
      mascotMessage: "Texto detectado! 📝 Posso resumir, traduzir ou melhorar pra você!",
    };
  }

  return {
    type: "text",
    suggestions: [
      { toolId: "generate_text", label: "Gerar texto", emoji: "✨" },
      { toolId: "translate", label: "Traduzir", emoji: "🌍" },
      { toolId: "password", label: "Gerar senha", emoji: "🔑" },
      { toolId: "qr_code", label: "Gerar QR Code", emoji: "📱" },
    ],
    mascotMessage: "Como posso te ajudar? Escolha uma ação ou me diga o que precisa! 🚀",
  };
}
