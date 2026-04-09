import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KwaiResponse {
  video_url: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getHeaders() {
  return {
    'User-Agent': pick(USER_AGENTS),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
  };
}

async function expandShortUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: getHeaders(),
    });
    return response.url || url;
  } catch {
    return url;
  }
}

function isKwaiUrl(url: string): boolean {
  const kwaiPatterns = [
    /kwai\.com/i,
    /kw\.ai/i,
    /kwai\./i,
  ];
  return kwaiPatterns.some(pattern => pattern.test(url));
}

async function tryRapidApi(url: string): Promise<KwaiResponse | null> {
  try {
    console.log("Trying RapidAPI for Kwai...");
    
    // Using a public Kwai video downloader API
    const apiUrl = `https://kwai-video-downloader.p.rapidapi.com/download?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'kwai-video-downloader.p.rapidapi.com',
        ...getHeaders(),
      },
    });

    if (!response.ok) {
      console.log("RapidAPI failed:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("RapidAPI response:", JSON.stringify(data).substring(0, 500));

    if (data.video_url || data.url || data.download_url) {
      return {
        video_url: data.video_url || data.url || data.download_url,
        thumbnail: data.thumbnail || data.cover || '',
        title: data.title || data.caption || 'Kwai Video',
        author: data.author || data.username || 'Unknown',
        duration: data.duration,
      };
    }

    return null;
  } catch (error) {
    console.error("RapidAPI error:", error);
    return null;
  }
}

async function tryDirectScrape(url: string): Promise<KwaiResponse | null> {
  try {
    console.log("Trying direct scrape for Kwai...");
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.log("Direct fetch failed:", response.status);
      return null;
    }

    const html = await response.text();
    console.log("HTML length:", html.length);

    // Try to find video URL in the HTML
    const patterns = [
      /"videoUrl"\s*:\s*"([^"]+)"/,
      /"playUrl"\s*:\s*"([^"]+)"/,
      /"url"\s*:\s*"(https?:\/\/[^"]*\.mp4[^"]*)"/,
      /video[_-]?url['"]\s*:\s*['"]([^'"]+)/i,
      /playAddr['"]\s*:\s*['"]([^'"]+)/i,
      /src=["'](https?:\/\/[^"']*\.mp4[^"']*)/i,
      /<video[^>]+src=["']([^"']+)/i,
    ];

    let videoUrl: string | null = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        videoUrl = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
        console.log("Found video URL with pattern:", pattern.source.substring(0, 30));
        break;
      }
    }

    if (!videoUrl) {
      // Try JSON-LD
      const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          if (jsonLd.contentUrl) {
            videoUrl = jsonLd.contentUrl;
          } else if (jsonLd.video?.contentUrl) {
            videoUrl = jsonLd.video.contentUrl;
          }
        } catch (e) {
          console.log("JSON-LD parse error");
        }
      }
    }

    if (!videoUrl) {
      console.log("No video URL found in HTML");
      return null;
    }

    // Extract thumbnail
    let thumbnail = '';
    const thumbPatterns = [
      /"coverUrl"\s*:\s*"([^"]+)"/,
      /"thumbnailUrl"\s*:\s*"([^"]+)"/,
      /"poster"\s*:\s*"([^"]+)"/,
      /og:image['"]\s*content=["']([^"']+)/i,
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)/i,
    ];
    
    for (const pattern of thumbPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        thumbnail = match[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
        break;
      }
    }

    // Extract title
    let title = 'Kwai Video';
    const titlePatterns = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /og:title['"]\s*content=["']([^"']+)/i,
      /"caption"\s*:\s*"([^"]+)"/,
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // Extract author
    let author = 'Unknown';
    const authorPatterns = [
      /"userName"\s*:\s*"([^"]+)"/,
      /"author"\s*:\s*"([^"]+)"/,
      /"name"\s*:\s*"([^"]+)"/,
    ];
    
    for (const pattern of authorPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        author = match[1];
        break;
      }
    }

    return {
      video_url: videoUrl,
      thumbnail,
      title,
      author,
    };
  } catch (error) {
    console.error("Direct scrape error:", error);
    return null;
  }
}

async function tryThirdPartyApi(url: string): Promise<KwaiResponse | null> {
  try {
    console.log("Trying third-party API for Kwai...");
    
    // Try different third-party APIs
    const apis = [
      {
        url: `https://api.tiklydown.eu.org/api/download/kwai?url=${encodeURIComponent(url)}`,
        parse: (data: any) => ({
          video_url: data.result?.video || data.video || data.url,
          thumbnail: data.result?.thumbnail || data.thumbnail || '',
          title: data.result?.title || data.title || 'Kwai Video',
          author: data.result?.author || data.author || 'Unknown',
        }),
      },
      {
        url: `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
        parse: (data: any) => ({
          video_url: data.data?.play || data.data?.wmplay,
          thumbnail: data.data?.cover || data.data?.origin_cover,
          title: data.data?.title || 'Kwai Video',
          author: data.data?.author?.nickname || 'Unknown',
        }),
      },
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url, {
          headers: getHeaders(),
        });

        if (!response.ok) continue;

        const data = await response.json();
        console.log("Third-party API response:", JSON.stringify(data).substring(0, 300));

        const result = api.parse(data);
        if (result.video_url) {
          return result as KwaiResponse;
        }
      } catch (e) {
        console.log("API attempt failed:", e);
      }
    }

    return null;
  } catch (error) {
    console.error("Third-party API error:", error);
    return null;
  }
}

async function downloadKwaiVideo(url: string): Promise<KwaiResponse> {
  // Expand short URLs
  const expandedUrl = await expandShortUrl(url);
  console.log("Expanded URL:", expandedUrl);

  // Validate Kwai URL
  if (!isKwaiUrl(expandedUrl)) {
    throw new Error("URL inválida. Por favor, insira um link do Kwai válido.");
  }

  // Try different methods
  let result: KwaiResponse | null = null;

  // Method 1: Direct scrape
  result = await tryDirectScrape(expandedUrl);
  if (result) {
    console.log("Success with direct scrape");
    return result;
  }

  // Method 2: Third-party APIs
  result = await tryThirdPartyApi(expandedUrl);
  if (result) {
    console.log("Success with third-party API");
    return result;
  }

  // Method 3: RapidAPI
  result = await tryRapidApi(expandedUrl);
  if (result) {
    console.log("Success with RapidAPI");
    return result;
  }

  throw new Error("Não foi possível processar o vídeo do Kwai. Tente novamente mais tarde.");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log("Received Kwai URL:", url);

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL é obrigatória" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await downloadKwaiVideo(url);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error processing Kwai video:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Erro ao processar vídeo do Kwai" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
