/** Junta um vídeo (sem áudio) com a faixa de áudio diretamente no navegador. */
export async function muxVideoAndAudio(
  video: Uint8Array,
  audio: Uint8Array,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    import("@ffmpeg/util"),
  ]);

  const base = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
  const ffmpeg = new FFmpeg();
  if (onProgress) ffmpeg.on("progress", ({ progress }) => onProgress(progress));

  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, "text/javascript"),
  });

  await ffmpeg.writeFile("v.mp4", video);
  await ffmpeg.writeFile("a.m4a", audio);
  await ffmpeg.exec([
    "-i", "v.mp4",
    "-i", "a.m4a",
    "-c", "copy",
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-movflags", "+faststart",
    "out.mp4",
  ]);
  const data = (await ffmpeg.readFile("out.mp4")) as Uint8Array;
  try {
    ffmpeg.terminate();
  } catch {
    /* ignora */
  }
  return new Blob([data.slice().buffer as ArrayBuffer], { type: "video/mp4" });
}
