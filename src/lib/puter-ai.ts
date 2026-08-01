/**
 * Puter.js — IA gratuita (sem chave de API e sem consumir créditos do projeto).
 * O SDK é carregado sob demanda no navegador via script oficial, pois o pacote
 * npm não é compatível com o bundle SSR do projeto.
 */

const PUTER_SDK_URL = "https://js.puter.com/v2/";

type PuterChatOptions = { model?: string; stream?: boolean };
type PuterGlobal = {
  ai: {
    chat: (
      prompt: string,
      options?: PuterChatOptions
    ) => Promise<unknown>;
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
}

/** Gera texto com a IA gratuita do Puter. Lança erro se indisponível. */
export async function puterGenerateText(
  prompt: string,
  options: PuterTextOptions = {}
): Promise<string> {
  const puter = await loadPuter();
  const system =
    options.system ??
    "Você é um assistente criativo. Responda sempre em português do Brasil, de forma clara e objetiva.";

  const response = await puter.ai.chat(`${system}\n\n${prompt.trim().slice(0, 6000)}`, {
    model: options.model ?? "gpt-5-nano",
  });

  const text = extractText(response);
  if (!text) throw new Error("A IA gratuita não retornou um texto válido. Tente novamente.");
  return text;
}
