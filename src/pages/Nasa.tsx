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
        style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          left: "max(12px, env(safe-area-inset-left))",
          zIndex: 10000,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #28B6FF 0%, #B66DFF 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          boxShadow:
            "0 8px 24px -6px rgba(40,182,255,0.55), 0 0 0 1px rgba(255,255,255,0.15) inset",
          backdropFilter: "blur(8px)",
        }}
      >
        <Home size={16} />
        Sair · SOS/01
      </Link>
    </>
  );
};

export default Nasa;