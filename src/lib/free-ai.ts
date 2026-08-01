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

export interface FreeTextOptions {
  system?: string;
  signal?: AbortSignal;
}

const DEFAULT_SYSTEM =
  "Você é um assistente criativo. Responda sempre em português do Brasil, de forma clara e objetiva.";

async function viaProxy(prompt: string, options: FreeTextOptions): Promise<string> {
  const response = await fetch("/api/free-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, system: options.system }),
    signal: options.signal,
  });
  const data = (await response.json().catch(() => null)) as
    | { text?: string; error?: string }
    | null;
  if (!response.ok || !data?.text) {
    throw new Error(data?.error || "Não foi possível gerar o texto agora. Tente novamente.");
  }
  return data.text.trim();
}

async function viaDirect(prompt: string, options: FreeTextOptions): Promise<string> {
  const response = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages: [
        { role: "system", content: options.system ?? DEFAULT_SYSTEM },
        { role: "user", content: prompt.trim().slice(0, 4000) },
      ],
    }),
    signal: options.signal,
  });
  if (!response.ok) {
    throw new Error("Não foi possível gerar o texto agora. Tente novamente.");
  }
  const data = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("A IA gratuita não retornou um texto válido. Tente novamente.");
  }
  return text;
}

/** Gera texto usando IA gratuita e pública (sem chave de API e sem consumir créditos). */
export async function generateFreeText(
  prompt: string,
  options: FreeTextOptions = {}
): Promise<string> {
  try {
    return await viaProxy(prompt, options);
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    return viaDirect(prompt, options);
  }
}
