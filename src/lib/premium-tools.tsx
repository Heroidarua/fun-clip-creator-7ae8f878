import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import {
  ScanText,
  Volume2,
  Mic,
  FileSignature,
  Globe,
  Gauge,
  Plane,
  CloudLightning,
  Ship,
  Activity,
  Stars,
  Calculator,
  Palette,
  Eraser,
  ScanLine,
  ShieldAlert,
  Languages,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type PremiumTool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string; // HSL string e.g. "280 100% 60%"
  component: LazyExoticComponent<ComponentType<any>>;
  status: "ready" | "soon";
};

const Placeholder = lazy(() => import("@/components/tools/premium/Placeholder"));

export const PREMIUM_TOOLS: PremiumTool[] = [
  {
    slug: "remover-metadados",
    name: "Removedor de Metadados",
    description: "Limpe EXIF, GPS e dados privados de imagens e documentos localmente.",
    icon: ShieldCheck,
    color: "210 100% 50%",
    component: lazy(() => import("@/components/tools/premium/MetadataRemoverIframeTool")),
    status: "ready",
  },
  {
    slug: "ocr",
    name: "OCR Imagem → Texto",
    description: "Extraia texto de imagens (PNG, JPG, WEBP) em português ou inglês.",
    icon: ScanText,
    color: "280 90% 60%",
    component: lazy(() => import("@/components/tools/premium/OcrTool")),
    status: "ready",
  },
  {
    slug: "tts",
    name: "Texto → Voz",
    description: "Converta textos em áudio com diferentes vozes, velocidade e tom.",
    icon: Volume2,
    color: "200 100% 50%",
    component: lazy(() => import("@/components/tools/premium/TextToSpeechTool")),
    status: "ready",
  },
  {
    slug: "stt",
    name: "Voz → Texto",
    description: "Fale ou envie áudio e receba a transcrição automaticamente.",
    icon: Mic,
    color: "0 90% 60%",
    component: lazy(() => import("@/components/tools/premium/SpeechToTextTool")),
    status: "ready",
  },
  {
    slug: "pdf-signer",
    name: "Assinador de PDF",
    description: "Desenhe, digite ou envie sua assinatura e aplique em um PDF.",
    icon: FileSignature,
    color: "30 100% 55%",
    component: lazy(() => import("@/components/tools/premium/PdfSignerTool")),
    status: "ready",
  },
  {
    slug: "meu-ip",
    name: "Meu IP",
    description: "Veja seu IP público, provedor, localização e dados do dispositivo.",
    icon: Globe,
    color: "160 100% 40%",
    component: lazy(() => import("@/components/tools/premium/MyIpTool")),
    status: "ready",
  },
  {
    slug: "velocidade",
    name: "Teste de Velocidade",
    description: "Meça download, upload, ping e jitter da sua conexão.",
    icon: Gauge,
    color: "45 100% 50%",
    component: lazy(() => import("@/components/tools/premium/SpeedTestTool")),
    status: "ready",
  },
  {
    slug: "cores",
    name: "Extrator de Cores",
    description: "Envie uma imagem e copie as cores predominantes em HEX, RGB e HSL.",
    icon: Palette,
    color: "320 100% 55%",
    component: lazy(() => import("@/components/tools/premium/ColorExtractorTool")),
    status: "ready",
  },
  {
    slug: "scanner",
    name: "Scanner de Documentos",
    description: "Transforme fotos em documentos digitalizados em PDF.",
    icon: ScanLine,
    color: "210 90% 55%",
    component: lazy(() => import("@/components/tools/premium/DocScannerTool")),
    status: "ready",
  },
  {
    slug: "idioma",
    name: "Detector de Idioma",
    description: "Cole um texto e descubra o idioma com confiança e código ISO.",
    icon: Languages,
    color: "190 100% 45%",
    component: lazy(() => import("@/components/tools/premium/LanguageDetectorTool")),
    status: "ready",
  },
  // Em breve
  { slug: "avioes", name: "Rastreador de Aviões", description: "Voos em tempo real (em breve).", icon: Plane, color: "210 80% 60%", component: Placeholder, status: "soon" },
  { slug: "raios", name: "Raios em Tempo Real", description: "Descargas elétricas no mundo (em breve).", icon: CloudLightning, color: "50 100% 55%", component: Placeholder, status: "soon" },
  { slug: "navios", name: "Navios em Tempo Real", description: "Tráfego marítimo (em breve).", icon: Ship, color: "200 80% 50%", component: Placeholder, status: "soon" },
  { slug: "terremotos", name: "Terremotos em Tempo Real", description: "Tremores recentes pelo mundo (em breve).", icon: Activity, color: "0 80% 55%", component: Placeholder, status: "soon" },
  { slug: "ceu", name: "Céu em Tempo Real", description: "Planetário online (em breve).", icon: Stars, color: "260 80% 60%", component: Placeholder, status: "soon" },
  { slug: "financeira", name: "Calculadora Financeira", description: "Juros, financiamento, investimentos (em breve).", icon: Calculator, color: "140 80% 45%", component: Placeholder, status: "soon" },
  { slug: "remover-objetos", name: "Removedor de Objetos", description: "Remoção via IA (em breve).", icon: Eraser, color: "300 80% 60%", component: Placeholder, status: "soon" },
  { slug: "vazamento-email", name: "Verificador de Vazamento", description: "Checagem de e-mail (em breve).", icon: ShieldAlert, color: "0 100% 50%", component: Placeholder, status: "soon" },
];

export const getPremiumTool = (slug: string) =>
  PREMIUM_TOOLS.find((t) => t.slug === slug);