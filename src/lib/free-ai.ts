/**
 * IA gratuita e sem consumo de créditos.
 * Geração de imagens via Pollinations (API pública, sem chave de API).
 * Nenhuma requisição passa pelo gateway de IA pago do projeto.
 */

const FREE_IMAGE_ENDPOINT = "https://image.pollinations.ai/prompt";

export interface FreeImageOptions {
  width?: number;
  height?: number;
  seed?: number;
  signal?: AbortSignal;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(value) || min, min), max);

export function buildFreeImageUrl(prompt: string, options: FreeImageOptions = {}): string {
  const width = clamp(options.width ?? 512, 64, 1024);
  const height = clamp(options.height ?? 512, 64, 1024);
  const seed = options.seed ?? Math.floor(Math.random() * 1_000_000);
  const cleanPrompt = prompt.replace(/\s+/g, " ").trim().slice(0, 900);

  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: "true",
    safe: "true",
  });

  return `${FREE_IMAGE_ENDPOINT}/${encodeURIComponent(cleanPrompt)}?${params.toString()}`;
}

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler a imagem gerada"));
    reader.readAsDataURL(blob);
  });

/** Gera uma imagem gratuita e devolve um data URL pronto para exibir/baixar. */
export async function generateFreeImage(
  prompt: string,
  options: FreeImageOptions = {}
): Promise<string> {
  const url = buildFreeImageUrl(prompt, options);
  const response = await fetch(url, { signal: options.signal });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("A IA gratuita está ocupada. Aguarde alguns segundos e tente novamente.");
    }
    throw new Error("Não foi possível gerar a imagem agora. Tente novamente.");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || blob.size < 500) {
    throw new Error("A IA gratuita não retornou uma imagem válida. Tente novamente.");
  }

  return blobToDataUrl(blob);
}

const FREE_TEXT_ENDPOINT = "https://text.pollinations.ai/";

export interface FreeTextOptions {
  system?: string;
  signal?: AbortSignal;
}

/** Gera texto usando IA gratuita e pública (sem chave de API e sem consumir créditos). */
export async function generateFreeText(
  prompt: string,
  options: FreeTextOptions = {}
): Promise<string> {
  const messages = [
    {
      role: "system",
      content:
        options.system ??
        "Você é um assistente criativo. Responda sempre em português do Brasil, de forma clara e objetiva.",
    },
    { role: "user", content: prompt.trim().slice(0, 4000) },
  ];

  const response = await fetch(FREE_TEXT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai", messages }),
    signal: options.signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("A IA gratuita está ocupada. Aguarde alguns segundos e tente novamente.");
    }
    throw new Error("Não foi possível gerar o texto agora. Tente novamente.");
  }

  const text = (await response.text()).trim();
  if (!text || text.startsWith("{\"error\"")) {
    throw new Error("A IA gratuita não retornou um texto válido. Tente novamente.");
  }

  return text;
}
