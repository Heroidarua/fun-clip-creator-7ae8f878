import { EnhancementOptions, VideoAnalysis } from "./types";

/**
 * Motor de processamento usando FFmpeg
 * Implementa filtros de Denoise, Sharpen e Upscale
 */
export async function processVideo(
  inputPath: string, 
  outputPath: string, 
  options: EnhancementOptions,
  onProgress: (percent: number) => void
): Promise<void> {
  const { exec } = await import("child_process");
  
  // Mapeamento de resoluções
  const resolutionMap = {
    '720p': { w: 1280, h: 720 },
    '1080p': { w: 1920, h: 1080 },
    '1440p': { w: 2560, h: 1440 },
    '4k': { w: 3840, h: 2160 },
    'auto': null
  };

  const target = options.targetResolution !== 'auto' ? resolutionMap[options.targetResolution] : null;

  // Construção dos filtros FFmpeg baseados no modo
  let videoFilters = [];
  
  // 1. Denoise (Redução de ruído)
  if (options.mode === 'standard' || options.mode === 'maximum') {
    // hqdn3d é um filtro de denoise de alta qualidade
    videoFilters.push("hqdn3d=1.5:1.5:6:6");
  }

  // 2. Upscale (Aumento de resolução)
  if (target) {
    videoFilters.push(`scale=${target.w}:${target.h}:flags=lanczos`);
  }

  // 3. Sharpen (Nitidez)
  if (options.mode === 'maximum') {
    // unsharp mask
    videoFilters.push("unsharp=5:5:1.0:5:5:0.0");
  } else if (options.mode === 'standard') {
    videoFilters.push("unsharp=3:3:0.5:3:3:0.0");
  }

  // 4. Audio Enhancement
  let audioFilters = [];
  if (options.audio.reduceNoise) {
    audioFilters.push("afftdn"); // FFT denoiser
  }
  if (options.audio.normalize) {
    audioFilters.push("loudnorm");
  }
  if (options.audio.boostVoice) {
    // Boost frequências vocais (aprox 300Hz a 3kHz)
    audioFilters.push("equalizer=f=1000:width_type=h:width=2000:g=3");
  }

  const vf = videoFilters.length > 0 ? `-vf "${videoFilters.join(',')}"` : "";
  const af = audioFilters.length > 0 ? `-af "${audioFilters.join(',')}"` : "";
  
  // Preset de velocidade vs qualidade (slower = melhor compressão/qualidade)
  const preset = options.mode === 'maximum' ? 'slower' : options.mode === 'standard' ? 'medium' : 'veryfast';

  const command = `ffmpeg -i "${inputPath}" ${vf} ${af} -c:v libx264 -preset ${preset} -crf 18 -c:a aac -b:a 192k "${outputPath}" -y`;

  console.log("Executing FFmpeg:", command);

  return new Promise((resolve, reject) => {
    const process = exec(command);

    process.stderr?.on('data', (data) => {
      // O FFmpeg envia logs de progresso para o stderr
      // Exemplo: frame=  123 fps= 30 q=28.0 size=    512kB time=00:00:05.12 bitrate= 819.2kbits/s speed=1.2x
      const timeMatch = data.toString().match(/time=(\d{2}:\d{2}:\d{2}.\d{2})/);
      if (timeMatch) {
        // Aqui poderíamos calcular o percentual se tivéssemos a duração total
        // Por agora vamos apenas simular um incremento
        onProgress(Math.min(95, 10)); 
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
