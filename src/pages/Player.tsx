const PLAYER_URL = "https://wplayer.link/dashboard?view=movies";

export default function Player() {
  return (
    <div className="fixed inset-0 bg-black">
      <h1 className="sr-only">SOS01 Player</h1>
      <iframe
        src={PLAYER_URL}
        title="SOS01 Player"
        loading="eager"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        referrerPolicy="no-referrer"
        className="h-full w-full border-0"
      />
    </div>
  );
}
