import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface MediaData {
  media_url: string;
  media_type: "video";
  thumbnail: string;
  title: string;
  author: string;
}

interface MediaResponse {
  success: boolean;
  data?: MediaData;
  error?: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X)",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function getHeaders(): Record<string, string> {
  return {
    "User-Agent": pick(USER_AGENTS),
    Accept: "*/*",
    "Accept-Language": "pt-BR,pt;q=0.9",
    Referer: "https://kwai-video.com/",
  };
}

// =============================
// MÉTODO 1: OpenGraph (mais confiável)
// =============================
async function tryOpenGraph(url: string): Promise<MediaResponse | null> {
  try {
    const res = await fetch(url, { headers: getHeaders() });
    const html = await res.text();

    const extract = (prop: string) => {
      const regex = new RegExp(
        `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      return html.match(regex)?.[1] || "";
    };

    const video = extract("og:video") || extract("og:video:secure_url");
    const image = extract("og:image");
    const title = extract("og:title") || "Kwai Video";

    if (!video) return null;

    return {
      success: true,
      data: {
        media_url: video,
        media_type: "video",
        thumbnail: image,
        title,
        author: "Kwai",
      },
    };
  } catch {
    return null;
  }
}

// =============================
// MÉTODO 2: JSON EMBUTIDO
// =============================
async function tryEmbeddedJSON(url: string): Promise<MediaResponse | null> {
  try {
    const res = await fetch(url, { headers: getHeaders() });
    const html = await res.text();

    const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/);

    if (!match) return null;

    const json = JSON.parse(match[1]);

    const videoUrl =
      json?.videoDetail?.photoUrl ||
      json?.videoDetail?.playUrl ||
      "";

    const cover =
      json?.videoDetail?.coverUrl || "";

    if (!videoUrl) return null;

    return {
      success: true,
      data: {
        media_url: videoUrl,
        media_type: "video",
        thumbnail: cover,
        title: "Kwai Video",
        author: "Kwai",
      },
    };
  } catch {
    return null;
  }
}

// =============================
// MÉTODO PRINCIPAL
// =============================
async function downloadKwai(url: string): Promise<MediaResponse> {
  const methods = [
    () => tryOpenGraph(url),
    () => tryEmbeddedJSON(url),
  ];

  for (const method of methods) {
    try {
      const result = await method();
      if (result?.success) return result;
    } catch {}
  }

  return {
    success: false,
    error: "Não foi possível baixar o vídeo do Kwai",
  };
}

// =============================
// PROXY (DOWNLOAD DIRETO)
// =============================
async function handleProxy(mediaUrl: string): Promise<Response> {
  try {
    const res = await fetch(mediaUrl, {
      headers: {
        "User-Agent": pick(USER_AGENTS),
      },
    });

    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="kwai_${Date.now()}.mp4"`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      headers: corsHeaders,
    });
  }
}

// =============================
// SERVER
// =============================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const urlObj = new URL(req.url);
  const action = urlObj.searchParams.get("action");

  // PROXY
  if (action === "proxy") {
    const mediaUrl = urlObj.searchParams.get("media_url");
    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: "media_url obrigatória" }), {
        headers: corsHeaders,
      });
    }
    return handleProxy(mediaUrl);
  }

  // GET URL
  let url = urlObj.searchParams.get("url") || "";

  if (!url) {
    return new Response(JSON.stringify({ error: "URL obrigatória" }), {
      headers: corsHeaders,
    });
  }

  // VALIDAR KWAI
  if (!url.includes("kwai")) {
    return new Response(
      JSON.stringify({ error: "URL precisa ser do Kwai" }),
      { headers: corsHeaders }
    );
  }

  const result = await downloadKwai(url);

  // ADD PROXY LINK
  if (result.success && result.data) {
    result.data.media_url =
      `${urlObj.origin}${urlObj.pathname}?action=proxy&media_url=` +
      encodeURIComponent(result.data.media_url);
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
