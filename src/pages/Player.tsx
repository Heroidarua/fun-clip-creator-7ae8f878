import { useState } from "react";

const PLAYER_URL = "https://wplayer.link/dashboard?view=movies";

export default function Player() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl text-[#28B6FF] animate-pulse"
            style={{ fontFamily: "'VT323', monospace", textShadow: "0 0 10px rgba(40,182,255,0.7)" }}
          >
            Carregando player...
          </span>
        </div>
      )}
      <iframe
        src={PLAYER_URL}
        title="SOS01 Player"
        onLoad={() => setLoaded(true)}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
