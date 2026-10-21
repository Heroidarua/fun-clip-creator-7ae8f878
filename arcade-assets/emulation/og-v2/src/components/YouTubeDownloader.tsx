// YouTubeDownloader.tsx
import { useState } from 'react';

// Instâncias públicas do Piped (a primeira que responder é usada)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.yt',
  'https://pipedapi.leptons.xyz',
];

function extrairVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [streams, setStreams] = useState<any>(null);
  const [erro, setErro] = useState('');

  async function buscarStreams() {
    const id = extrairVideoId(url);
    if (!id) { setErro('URL do YouTube inválida'); return; }
    setErro('');

    for (const instancia of PIPED_INSTANCES) {
      try {
        const res = await fetch(`${instancia}/streams/${id}`);
        if (!res.ok) continue;
        const data = await res.json();
        setStreams(data);
        return;
      } catch { /* tenta próxima instância */ }
    }
    setErro('Nenhuma instância Piped disponível no momento.');
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Baixar vídeo do YouTube</h2>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <button onClick={buscarStreams}>Buscar</button>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {streams && (
        <div>
          <h3>{streams.title}</h3>
          <p>Vídeo (sem áudio — separado abaixo):</p>
          {streams.videoStreams
            ?.filter((s: any) => s.videoOnly)
            .slice(0, 5)
            .map((s: any) => (
              <a key={s.url} href={s.url} download style={{ display: 'block' }}>
                ⬇ {s.quality} ({s.mimeType?.split(';')[0]})
              </a>
            ))}
          <p>Áudio (MP4/M4A):</p>
          {streams.audioStreams?.slice(0, 3).map((s: any) => (
            <a key={s.url} href={s.url} download style={{ display: 'block' }}>
              ⬇ {s.bitrate / 1000} kbps
            </a>
          ))}
        </div>
      )}
    </div>
  );
}