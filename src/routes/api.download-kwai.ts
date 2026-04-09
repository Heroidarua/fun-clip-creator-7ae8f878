import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/* ================= CORS ================= */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ================= TYPES ================= */
interface KwaiResponse {
  video_url: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
}

/* ================= USER AGENTS ================= */
const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getHeaders = () => ({
  "User-Agent": pick(USER_AGENTS),
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
});

/* ================= FETCH COM TIMEOUT ================= */
async function fetchWithTimeout(url: string, options: any = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/* ================= EXTRAIR URL DO TEXTO ================= */
function extractUrl(text: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

/* ================= EXPAND URL ================= */
async function expandShortUrl(url: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(url, {
      method: "GET",
      redirect: "follow",
      headers: getHeaders(),
    });

    return res.url || url;
  } catch {
    return url;
  }
}

/* ================= VALIDATION ================= */
function isKwaiUrl(url: string): boolean {
  return /(kwai\.com|kw\.ai|kwai-video\.com)/i.test(url);
}

/* ================= SCRAPER ================= */
async function tryDirectScrape(url: string): Promise<KwaiResponse | null> {
  try {
    const res = await fetchWithTimeout(url, {
      headers: getHeaders(),
    });

    if (!res.ok) return null;

    const html = await res.text();

    /* ===== JSON GLOBAL ===== */
    const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/);

    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[1]);

        const video =
          json?.video?.playUrl ||
          json?.video?.url ||
          json?.photo?.playUrl;

        if (video) {
          return {
            video_url: video,
            thumbnail: json?.video?.coverUrl || "",
            title: json?.video?.caption || "Kwai Video",
            author: json?.video?.userName || "Unknown",
          };
        }
      } catch {}
    }

    /* ===== FALLBACK ===== */
    const match = html.match(/https?:\/\/[^"]+\.mp4[^"]*/);

    if (!match) return null;

    return {
      video_url: match[0],
      thumbnail: "",
      title: "Kwai Video",
      author: "Unknown",
    };
  } catch {
    return null;
  }
}

/* ================= API EXTERNA ================= */
async function tryThirdPartyApi(url: string): Promise<KwaiResponse | null> {
  try {
    const api = `https://api.tiklydown.eu.org/api/download/kwai?url=${encodeURIComponent(url)}`;

    const res = await fetchWithTimeout(api);

    if (!res.ok) return null;

    const data = await res.json();

    if (!data?.result?.video) return null;

    return {
      video_url: data.result.video,
      thumbnail: data.result.thumbnail || "",
      title: data.result.title || "Kwai Video",
      author: data.result.author || "Unknown",
    };
  } catch {
    return null;
  }
}

/* ================= MAIN ================= */
async function downloadKwaiVideo(input: string): Promise<KwaiResponse> {
  if (!input || typeof input !== "string") {
    throw new Error("Entrada inválida");
  }

  // 🔥 EXTRAI URL DO TEXTO
  const extractedUrl = extractUrl(input);

  if (!extractedUrl) {
    throw new Error("Nenhuma URL encontrada no texto");
  }

  const expanded = await expandShortUrl(extractedUrl);

  if (!isKwaiUrl(expanded)) {
    throw new Error("Link não é do Kwai");
  }

  const result =
    (await tryDirectScrape(expanded)) ||
    (await tryThirdPartyApi(expanded));

  if (!result) {
    throw new Error("Não foi possível obter o vídeo");
  }

  return result;
}

/* ================= SERVER ================= */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Body inválido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url } = body;

    const data = await downloadKwaiVideo(url);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Erro interno",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
  
