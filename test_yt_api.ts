import { parseYouTubeUrl } from "./src/lib/youtube-url";
import { resolveYoutube } from "./src/lib/youtube-resolver.server";

async function test() {
  const url = "https://youtu.be/OnD4O64z10A?is=QBH4Qr7uOpyZEO9A";
  const parsed = parseYouTubeUrl(url);
  console.log("Parsed:", JSON.stringify(parsed));
  
  const videoId = parsed?.videoId;
  if (!videoId) {
    console.log("Falha ao fazer parse da URL");
    return;
  }

  console.log("Iniciando resolveYoutube...");
  try {
    const result = await resolveYoutube(url, videoId, "best");
    console.log("Resultado:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Erro no resolveYoutube:", e);
  }
}

test();
