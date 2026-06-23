import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Satellite, Globe2, Radio, Rocket, Sparkles } from "lucide-react";

const Nasa = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#03050d] text-white relative overflow-hidden">
      {/* Animated starfield */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(40,182,255,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(182,109,255,0.15),_transparent_55%)]" />
        <div className="stars stars-1" />
        <div className="stars stars-2" />
        <div className="stars stars-3" />
      </div>

      <style>{`
        @keyframes nasa-twinkle { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
        @keyframes nasa-drift { from { transform: translateY(0) } to { transform: translateY(-2000px) } }
        @keyframes nasa-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes nasa-orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .stars { position: absolute; inset: 0; background-repeat: repeat; background-position: 0 0; animation: nasa-drift linear infinite, nasa-twinkle ease-in-out infinite; }
        .stars-1 { background-image: radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #fff, transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, #fff, transparent), radial-gradient(1px 1px at 160px 120px, #fff, transparent); background-size: 200px 200px; animation-duration: 120s, 4s; opacity: 0.7; }
        .stars-2 { background-image: radial-gradient(1.5px 1.5px at 50px 60px, #aee0ff, transparent), radial-gradient(1px 1px at 120px 20px, #fff, transparent), radial-gradient(1.5px 1.5px at 200px 150px, #b66dff, transparent); background-size: 300px 300px; animation-duration: 200s, 6s; opacity: 0.5; }
        .stars-3 { background-image: radial-gradient(2px 2px at 80px 100px, #28b6ff, transparent), radial-gradient(1px 1px at 240px 220px, #fff, transparent); background-size: 400px 400px; animation-duration: 280s, 8s; opacity: 0.6; }
        .nasa-fade { animation: nasa-fade-up 0.8s ease-out both; }
        .nasa-fade-1 { animation-delay: 0.1s; }
        .nasa-fade-2 { animation-delay: 0.25s; }
        .nasa-fade-3 { animation-delay: 0.4s; }
        .nasa-fade-4 { animation-delay: 0.55s; }
        .nasa-glass { background: linear-gradient(135deg, rgba(40,182,255,0.08), rgba(182,109,255,0.05)); backdrop-filter: blur(18px) saturate(140%); border: 1px solid rgba(255,255,255,0.12); }
        .nasa-glow { box-shadow: 0 0 40px -10px rgba(40,182,255,0.5), 0 0 80px -20px rgba(182,109,255,0.3), inset 0 1px 0 rgba(255,255,255,0.08); }
        .nasa-orbit-icon { animation: nasa-orbit 18s linear infinite; }
      `}</style>

      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-7xl py-10 sm:py-16">
          {/* Hero */}
          <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="nasa-fade inline-flex items-center gap-2 px-4 py-1.5 rounded-full nasa-glass mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#28B6FF]" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-silkscreen text-[#28B6FF]">Premium · NASA Edition</span>
            </div>
            <h1 className="nasa-fade nasa-fade-1 font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight mb-4 bg-gradient-to-br from-white via-[#aee0ff] to-[#28B6FF] bg-clip-text text-transparent">
              🌎 NASA Earth Satellites
            </h1>
            <p className="nasa-fade nasa-fade-2 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              Explore a Terra em tempo real com satélites, dados científicos e visualização 3D oficial da NASA.
            </p>
          </section>

          {/* Indicators */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
            {[
              { icon: Satellite, label: "Satélites em Tempo Real", emoji: "🛰️", color: "#28B6FF" },
              { icon: Globe2, label: "Visualização 3D da Terra", emoji: "🌍", color: "#B66DFF" },
              { icon: Radio, label: "Dados Oficiais da NASA", emoji: "📡", color: "#FFD93D" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`nasa-fade nasa-fade-${i + 2} nasa-glass nasa-glow rounded-2xl p-5 sm:p-6 flex items-center gap-4 hover:translate-y-[-2px] transition-transform`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `linear-gradient(135deg, ${item.color}33, ${item.color}11)`, border: `1px solid ${item.color}55` }}
                >
                  {item.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 mb-1 font-silkscreen">Live</div>
                  <div className="text-sm sm:text-base font-semibold text-white leading-tight">{item.label}</div>
                </div>
                <item.icon className="ml-auto w-5 h-5 text-white/30" />
              </div>
            ))}
          </section>

          {/* Iframe */}
          <section className="nasa-fade nasa-fade-3 mb-10">
            <div className="nasa-glass nasa-glow rounded-3xl p-2 sm:p-3 overflow-hidden relative">
              <div className="absolute top-3 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-silkscreen text-white/80">Live · NASA</span>
              </div>
              <iframe
                src="https://eyes.nasa.gov/apps/earth/#/satellites?rate=1"
                title="NASA Eyes on the Earth — Satellites"
                loading="lazy"
                allowFullScreen
                className="w-full rounded-2xl bg-black"
                style={{ minHeight: "1000px", border: 0, height: "min(1200px, 80vh)" }}
              />
            </div>
          </section>

          {/* CTA */}
          <section className="nasa-fade nasa-fade-4 flex justify-center mb-16">
            <a
              href="https://eyes.nasa.gov/apps/earth/#/satellites?rate=1"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base sm:text-lg text-white overflow-hidden transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #28B6FF 0%, #B66DFF 100%)",
                boxShadow: "0 10px 40px -10px rgba(40,182,255,0.6), 0 0 60px -15px rgba(182,109,255,0.5)",
              }}
            >
              <Rocket className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              🚀 Abrir Experiência Completa
              <span aria-hidden className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </section>

          {/* Footer note */}
          <section className="text-center">
            <div className="nasa-glass inline-flex items-center gap-3 px-5 py-3 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#28B6FF] to-[#B66DFF] flex items-center justify-center text-[10px]">
                🛰️
              </div>
              <p className="text-xs sm:text-sm text-white/60 italic">
                Dados e visualizações fornecidos oficialmente pela <span className="text-white/90 font-semibold not-italic">NASA Eyes on the Earth</span>.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Nasa;