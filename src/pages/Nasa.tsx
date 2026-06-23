import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

const Nasa = () => {
  return (
    <>
      <iframe
        src="https://eyes.nasa.gov/apps/earth/#/satellites?rate=1"
        title="NASA Eyes on the Earth — Satellites"
        allowFullScreen
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          border: 0,
          background: "#000",
          zIndex: 9999,
        }}
      />
      <Link
        to="/"
        aria-label="Voltar para a página inicial do SOS/01"
        title="Sair · SOS/01"
        className="nasa-exit-btn"
      >
        <Home size={16} aria-hidden />
        <span className="nasa-exit-label">Sair · SOS/01</span>
      </Link>
      <style>{`
        .nasa-exit-btn {
          position: fixed;
          top: max(10px, env(safe-area-inset-top));
          right: max(10px, env(safe-area-inset-right));
          z-index: 10000;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: 38px;
          height: 38px;
          padding: 0;
          border-radius: 999px;
          background: rgba(10, 14, 28, 0.55);
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          text-decoration: none;
          backdrop-filter: blur(10px) saturate(140%);
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 4px 16px -4px rgba(0,0,0,0.6);
          overflow: hidden;
          justify-content: center;
          opacity: 0.55;
          transition: opacity .25s ease, width .3s ease, background .25s ease, padding .3s ease;
        }
        .nasa-exit-btn:hover, .nasa-exit-btn:focus-visible {
          opacity: 1;
          width: 138px;
          padding: 0 14px;
          justify-content: flex-start;
          background: linear-gradient(135deg, rgba(40,182,255,0.85), rgba(182,109,255,0.85));
        }
        .nasa-exit-label {
          opacity: 0;
          max-width: 0;
          white-space: nowrap;
          transition: opacity .2s ease, max-width .3s ease;
        }
        .nasa-exit-btn:hover .nasa-exit-label,
        .nasa-exit-btn:focus-visible .nasa-exit-label {
          opacity: 1;
          max-width: 120px;
        }
        @media (max-width: 640px) {
          .nasa-exit-btn { opacity: 0.7; width: 36px; height: 36px; }
        }
      `}</style>
    </>
  );
};

export default Nasa;