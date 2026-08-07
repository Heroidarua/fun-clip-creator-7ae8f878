import { useEffect, useMemo, useState } from "react";
import appIcon from "@/assets/app-icon.png.asset.json";

const BG = "#124F7D";
const TOTAL_MS = 3200;
const FADE_MS = 500;

type Particle = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  drift: number;
};

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const particles = useMemo<Particle[]>(() => {
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 22 }, () => ({
      left: rand(2, 98),
      top: rand(5, 95),
      size: rand(3, 8),
      delay: rand(0, 2.5),
      duration: rand(5, 9),
      color: Math.random() > 0.5 ? "#28B6FF" : "#B66DFF",
      drift: rand(-30, 30),
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem("sos01-splash-seen")) {
          setVisible(false);
          return;
        }
        sessionStorage.setItem("sos01-splash-seen", "1");
      } catch {
        /* ignore */
      }
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => setFading(true), TOTAL_MS);
    const t2 = window.setTimeout(() => setVisible(false), TOTAL_MS + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!mounted || !visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: BG,
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        willChange: "opacity",
      }}
    >
      <style>{`
@keyframes sos01-splash-in {
  0% { opacity: 0; transform: scale(.7); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes sos01-splash-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
@keyframes sos01-splash-glow {
  0%, 100% { opacity: .45; transform: scale(1); }
  50% { opacity: .85; transform: scale(1.08); }
}
@keyframes sos01-splash-particle {
  0% { opacity: 0; transform: translate3d(0,0,0); }
  20% { opacity: .8; }
  80% { opacity: .5; }
  100% { opacity: 0; transform: translate3d(var(--drift), -60px, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .sos01-splash-anim, .sos01-splash-glow, .sos01-splash-particle { animation: none !important; }
}
      `}</style>

      {particles.map((p, i) => (
        <span
          key={i}
          className="sos01-splash-particle pointer-events-none absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: 0,
            ["--drift" as string]: `${p.drift}px`,
            animation: `sos01-splash-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      <div className="relative flex items-center justify-center">
        <div
          className="sos01-splash-glow pointer-events-none absolute rounded-full"
          style={{
            width: "min(70vw, 340px)",
            height: "min(70vw, 340px)",
            background:
              "radial-gradient(circle, rgba(40,182,255,.55) 0%, rgba(40,182,255,.18) 45%, rgba(40,182,255,0) 70%)",
            filter: "blur(6px)",
            animation: "sos01-splash-glow 2.2s ease-in-out .3s infinite",
            willChange: "transform, opacity",
          }}
        />
        <div
          className="sos01-splash-anim relative"
          style={{
            opacity: 0,
            animation:
              "sos01-splash-in 700ms cubic-bezier(.22,1,.36,1) 300ms forwards, sos01-splash-breathe 2s ease-in-out 1000ms infinite",
            willChange: "transform, opacity",
          }}
        >
          <img
            src={appIcon.url}
            alt=""
            width={512}
            height={472}
            className="block h-auto w-[min(48vw,220px)] select-none drop-shadow-[0_0_35px_rgba(40,182,255,.6)]"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
