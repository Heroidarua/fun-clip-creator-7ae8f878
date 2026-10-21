/**
 * Registro único de ferramentas com página própria e indexável.
 * Une as ferramentas utilitárias e as premium sob o mesmo formato,
 * para que /ferramenta/<slug> renderize qualquer uma delas.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  QrCode,
  KeyRound,
  Music,
  Eraser,
  FileImage,
  PenTool,
  Languages,
  FileText,
  Stamp,
  Image as ImageIcon,
  Link2,
  UserSquare2,
  Video,
  Bug,
  type LucideIcon,
} from "lucide-react";
import { PREMIUM_TOOLS } from "@/lib/premium-tools";

export type RegisteredTool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** HSL string, ex.: "280 100% 60%" */
  color: string;
  component: LazyExoticComponent<ComponentType<any>>;
  /** Chave usada pelo FeatureGate / painel admin (apenas utilitárias). */
  featureKey?: string;
  premium: boolean;
  status: "ready" | "soon";
};

const UTILITY_TOOLS: RegisteredTool[] = [
  {
    slug: "melhorar-video",
    name: "Melhorar Vídeo",
    description: "Upscale, denoise e melhoria de áudio com IA para seus vídeos.",
    icon: Video,
    color: "260 100% 60%",
    component: lazy(() => import("@/components/tools/video-enhancer/VideoEnhancer")),
    featureKey: "video-enhancer",
    premium: false,
    status: "ready",
  },
  {
    slug: "gerador-qrcode",
    name: "Gerador de QR Code",
    description: "Crie QR Codes para links, textos e Wi-Fi e baixe em alta resolução.",
    icon: QrCode,
    color: "160 100% 40%",
    component: lazy(() => import("@/components/tools/QRCodeGenerator")),
    featureKey: "qr-code",
    premium: false,
    status: "ready",
  },
  {
    slug: "gerador-de-senha",
    name: "Gerador de Senhas",
    description: "Gere senhas aleatórias e fortes direto no navegador.",
    icon: KeyRound,
    color: "140 100% 40%",
    component: lazy(() => import("@/components/tools/PasswordGenerator")),
    featureKey: "password",
    premium: false,
    status: "ready",
  },
  {
    slug: "conversor-mp4-mp3",
    name: "Conversor MP4 → MP3",
    description: "Extraia o áudio de vídeos e baixe em MP3.",
    icon: Music,
    color: "205 100% 55%",
    component: lazy(() => import("@/components/tools/MP4ToMP3Converter")),
    featureKey: "mp4-to-mp3",
    premium: false,
    status: "ready",
  },
  {
    slug: "removedor-de-fundo",
    name: "Removedor de Fundo",
    description: "Remova o fundo de fotos com IA e baixe em PNG transparente.",
    icon: Eraser,
    color: "280 100% 60%",
    component: lazy(() => import("@/components/tools/BackgroundRemover")),
    featureKey: "background-remover",
    premium: false,
    status: "ready",
  },
  {
    slug: "imagem-para-pdf",
    name: "Imagem para PDF",
    description: "Junte várias imagens em um único arquivo PDF.",
    icon: FileImage,
    color: "10 100% 55%",
    component: lazy(() => import("@/components/tools/ImageToPdfConverter")),
    featureKey: "image-to-pdf",
    premium: false,
    status: "ready",
  },
  {
    slug: "gerador-de-texto",
    name: "Gerador de Texto com IA",
    description: "Crie legendas, descrições e roteiros com inteligência artificial.",
    icon: PenTool,
    color: "250 100% 65%",
    component: lazy(() => import("@/components/tools/AITextGenerator")),
    featureKey: "ai-text",
    premium: false,
    status: "ready",
  },
  {
    slug: "tradutor",
    name: "Tradutor Automático",
    description: "Traduza textos entre dezenas de idiomas.",
    icon: Languages,
    color: "190 100% 45%",
    component: lazy(() => import("@/components/tools/AutoTranslator")),
    featureKey: "translator",
    premium: false,
    status: "ready",
  },
  {
    slug: "resumidor",
    name: "Resumidor de Texto",
    description: "Resuma textos longos mantendo as ideias principais.",
    icon: FileText,
    color: "30 100% 50%",
    component: lazy(() => import("@/components/tools/TextSummarizer")),
    featureKey: "summarizer",
    premium: false,
    status: "ready",
  },
  {
    slug: "marca-dagua",
    name: "Marca d'água em Imagens",
    description: "Aplique texto ou logo como marca d'água nas suas fotos.",
    icon: Stamp,
    color: "320 100% 50%",
    component: lazy(() => import("@/components/tools/WatermarkTool")),
    featureKey: "watermark",
    premium: false,
    status: "ready",
  },
  {
    slug: "gerador-de-thumbnail",
    name: "Gerador de Thumbnails",
    description: "Crie miniaturas para YouTube, Shorts, Reels e TikTok.",
    icon: ImageIcon,
    color: "45 100% 50%",
    component: lazy(() => import("@/components/tools/ThumbnailGenerator")),
    featureKey: "thumbnail",
    premium: false,
    status: "ready",
  },
  {
    slug: "encurtador-de-url",
    name: "Encurtador de URL",
    description: "Transforme links longos em endereços curtos.",
    icon: Link2,
    color: "200 100% 50%",
    component: lazy(() => import("@/components/tools/UrlShortener")),
    featureKey: "url-shortener",
    premium: false,
    status: "ready",
  },
  {
    slug: "avatar-pixelado",
    name: "Gerador de Avatar Pixelado",
    description: "Crie avatares em pixel art com inteligência artificial.",
    icon: UserSquare2,
    color: "280 100% 60%",
    component: lazy(() => import("@/components/tools/PixelAvatarGenerator")),
    featureKey: "pixel-avatar",
    premium: false,
    status: "ready",
  },
  {
    slug: "virus-do-bem",
    name: "Vírus do Bem",
    description: "Gere e compartilhe um link de pegadinha com seus amigos.",
    icon: Bug,
    color: "150 80% 45%",
    component: lazy(() => import("@/components/tools/VirusDoBem")),
    featureKey: "virus-do-bem",
    premium: false,
    status: "ready",
  },
];

export const ALL_TOOLS: RegisteredTool[] = [
  ...UTILITY_TOOLS,
  ...PREMIUM_TOOLS.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
    icon: t.icon,
    color: t.color,
    component: t.component,
    premium: true,
    status: t.status,
  })),
];

export const getRegisteredTool = (slug: string) => ALL_TOOLS.find((t) => t.slug === slug);

/** Slugs indexáveis (ferramentas prontas) — usado pelo sitemap. */
export const INDEXABLE_TOOL_SLUGS = ALL_TOOLS.filter((t) => t.status === "ready").map(
  (t) => t.slug,
);