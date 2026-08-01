/**
 * Puter.js — IA gratuita e ilimitada (sem chave de API e sem consumir créditos).
 * Baseado em https://developer.puter.com/tutorials/free-unlimited-openai-api/
 *
 * O SDK é carregado sob demanda no navegador pelo script oficial
 * (https://js.puter.com/v2/), pois o pacote npm não é compatível
 * com o bundle SSR deste projeto.
 */

const PUTER_SDK_URL = "https://js.puter.com/v2/";

/** Modelos OpenAI disponíveis gratuitamente via Puter. */
export const PUTER_MODELS = {
  nano: "gpt-5.4-nano",
  luna: "gpt-5.6-luna",
  terra: "gpt-5.6-terra",
  sol: "gpt-5.6-sol",
  image: "gpt-image-2",
} as const;

type ChatOptions = {
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
};

type PuterGlobal = {
  ai: {
    chat: (
      prompt: string,
      imageUrlOrOptions?: string | ChatOptions,
      options?: ChatOptions
    ) => Promise<unknown>;
    txt2img: (prompt: string, options?: { model?: string }) => Promise<HTMLImageElement>;
  };
};

declare global {
  interface Window {
    puter?: PuterGlobal;
  }
}

let loader: Promise<PuterGlobal> | null = null;

/** Carrega (uma única vez) o SDK do Puter no navegador. */
export function loadPuter(): Promise<PuterGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Puter.js só está disponível no navegador"));
  }
  if (window.puter) return Promise.resolve(window.puter);
  if (loader) return loader;

  loader = new Promise<PuterGlobal>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PUTER_SDK_URL}"]`
    );
    const script = existing ?? document.createElement("script");

    const onReady = () => {
      if (window.puter) resolve(window.puter);
      else reject(new Error("Não foi possível iniciar a IA gratuita"));
    };
    const onError = () => {
      loader = null;
      reject(new Error("Falha ao carregar a IA gratuita"));
    };

    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!existing) {
      script.src = PUTER_SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    } else if (window.puter) {
      onReady();
    }
  });

  return loader;
}

const extractText = (response: unknown): string => {
  if (typeof response === "string") return response.trim();
  const message = (response as { message?: { content?: unknown } })?.message?.content;
  if (typeof message === "string") return message.trim();
  if (Array.isArray(message)) {
    return message
      .map((part) => (typeof part === "string" ? part : (part as { text?: string })?.text ?? ""))
      .join("")
      .trim();
  }
  const text = (response as { text?: string })?.text;
  return typeof text === "string" ? text.trim() : "";
};

export interface PuterTextOptions {
  system?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Recebe o texto parcial enquanto a IA responde (ativa streaming). */
  onChunk?: (partial: string) => void;
}

/** Gera texto com a IA gratuita do Puter. Lança erro se estiver indisponível. */
export async function puterGenerateText(
  prompt: string,
  options: PuterTextOptions = {}
): Promise<string> {
  const puter = await loadPuter();
  const system =
    options.system ??
    "Você é um assistente criativo. Responda sempre em português do Brasil, de forma clara e objetiva.";
  const input = `${system}\n\n${prompt.trim().slice(0, 6000)}`;

  const chatOptions: ChatOptions = {
    model: options.model ?? PUTER_MODELS.nano,
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
  };

  let text = "";

  if (options.onChunk) {
    // Streaming: entrega a resposta em tempo real
    const stream = (await puter.ai.chat(input, {
      ...chatOptions,
      stream: true,
    })) as AsyncIterable<{ text?: string }>;

    for await (const part of stream) {
      if (part?.text) {
        text += part.text;
        options.onChunk(text);
      }
    }
    text = text.trim();
  } else {
    text = extractText(await puter.ai.chat(input, chatOptions));
  }

  if (!text) throw new Error("A IA gratuita não retornou um texto válido. Tente novamente.");
  return text;
}

/** Analisa uma imagem (URL pública) e responde sobre ela. */
export async function puterAnalyzeImage(
  prompt: string,
  imageUrl: string,
  model: string = PUTER_MODELS.luna
): Promise<string> {
  const puter = await loadPuter();
  const text = extractText(await puter.ai.chat(prompt, imageUrl, { model }));
  if (!text) throw new Error("A IA gratuita não conseguiu analisar a imagem. Tente novamente.");
  return text;
}

/** Gera uma imagem com GPT Image e devolve a URL (data URL) pronta para exibir. */
export async function puterGenerateImage(
  prompt: string,
  model: string = PUTER_MODELS.image
): Promise<string> {
  const puter = await loadPuter();
  const image = await puter.ai.txt2img(prompt.trim().slice(0, 900), { model });
  const src = image?.src;
  if (!src) throw new Error("A IA gratuita não retornou uma imagem válida. Tente novamente.");
  return src;
}
