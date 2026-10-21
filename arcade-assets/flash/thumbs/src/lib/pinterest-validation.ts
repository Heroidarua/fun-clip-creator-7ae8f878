/**
 * Pinterest URL validation shared between client and server.
 * Returns clear, user-friendly Portuguese error messages before any network call.
 */

export type PinterestValidation =
  | { valid: true; kind: "pin" | "shortlink"; normalized: string; pinId?: string }
  | { valid: false; error: string };

const PIN_PATH_RE = /\/pin\/(\d{6,})/i;
const SHORTLINK_RE = /^https?:\/\/pin\.it\/[A-Za-z0-9]{4,}/i;
const PINTEREST_HOST_RE = /^([a-z0-9-]+\.)*pinterest\.[a-z.]{2,}$/i;

const NON_PIN_PATHS = [
  { re: /\/board\//i, msg: "Este link aponta para uma pasta (board), não para um pin específico. Abra o pin e copie o link novamente." },
  { re: /\/search\//i, msg: "Este link é de uma página de busca do Pinterest. Abra o pin desejado e copie o link." },
  { re: /\/ideas\//i, msg: "Este link é de uma página de ideias. Abra um pin específico e copie o link." },
  { re: /\/topics\//i, msg: "Este link é de uma página de tópicos. Abra um pin específico e copie o link." },
  { re: /\/(login|signup|business|today)\b/i, msg: "Este link não é de um pin. Cole o link de um pin (pinterest.com/pin/...)." },
];

export function validatePinterestUrl(raw: string): PinterestValidation {
  const input = (raw || "").trim();
  if (!input) return { valid: false, error: "Insira o link do Pinterest." };

  // Coerce missing scheme
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { valid: false, error: "Link inválido. Cole um link completo começando com https://" };
  }

  const host = parsed.hostname.toLowerCase();

  // Short link pin.it/<id>
  if (host === "pin.it" || host.endsWith(".pin.it")) {
    if (!/^\/[A-Za-z0-9]{4,}\/?$/.test(parsed.pathname)) {
      return { valid: false, error: "Link curto pin.it inválido. Use o botão Compartilhar do Pinterest para copiar novamente." };
    }
    return { valid: true, kind: "shortlink", normalized: `${parsed.origin}${parsed.pathname.replace(/\/$/, "")}` };
  }

  // Pinterest domain check
  if (!PINTEREST_HOST_RE.test(host)) {
    return { valid: false, error: "Este link não é do Pinterest. Use um link de pinterest.com ou pin.it." };
  }

  // Reject obvious non-pin pages first (clearer than the generic /pin/ check)
  for (const { re, msg } of NON_PIN_PATHS) {
    if (re.test(parsed.pathname)) return { valid: false, error: msg };
  }

  const m = parsed.pathname.match(PIN_PATH_RE);
  if (!m) {
    // /user or /user/board cases
    if (/^\/[^/]+\/?$/.test(parsed.pathname) || /^\/[^/]+\/[^/]+\/?$/.test(parsed.pathname)) {
      return { valid: false, error: "Este link parece ser de um perfil ou pasta do Pinterest. Abra o pin específico e copie o link." };
    }
    return { valid: false, error: "Não foi possível identificar o ID do pin. Use o link no formato pinterest.com/pin/<números>." };
  }

  const pinId = m[1];
  return {
    valid: true,
    kind: "pin",
    pinId,
    normalized: `https://www.pinterest.com/pin/${pinId}/`,
  };
}

/** Quick boolean helper for legacy code paths. */
export function isPinterestUrl(url: string): boolean {
  const v = validatePinterestUrl(url);
  return v.valid;
}

export { SHORTLINK_RE as PINTEREST_SHORTLINK_RE };