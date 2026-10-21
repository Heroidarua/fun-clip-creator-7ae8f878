import { VideoAnalysis } from "./types";

/**
 * Análise de vídeo usando FFprobe via shell no sandbox
 * O sandbox possui FFmpeg/FFprobe instalados.
 */
export async function analyzeVideo(filePath: string): Promise<VideoAnalysis> {
  // Em um ambiente de produção real (Worker), usaríamos uma API externa ou WASM.
  // Aqui no sandbox Lovable, podemos usar o shell.
  
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate,codec_name -show_entries format=duration,size,bit_rate -of json "${filePath}"`,
      { timeout: 30000 } // 30s timeout para análise
    );
    
    const data = JSON.parse(stdout);
    const videoStream = data.streams[0];
    const format = data.format;

    // Converte fps fracionário (ex: "30000/1001") para número
    const fpsParts = videoStream.avg_frame_rate.split('/');
    const fps = fpsParts.length === 2 ? parseFloat(fpsParts[0]) / parseFloat(fpsParts[1]) : parseFloat(fpsParts[0]);

    return {
      width: parseInt(videoStream.width),
      height: parseInt(videoStream.height),
      fps: Math.round(fps * 100) / 100,
      duration: parseFloat(format.duration),
      codec: videoStream.codec_name,
      bitrate: parseInt(format.bit_rate),
      size: parseInt(format.size),
    };
  } catch (error) {
    console.error("FFprobe analysis error:", error);
    throw new Error("Falha ao analisar o vídeo. Verifique se o formato é suportado.");
  }
}
