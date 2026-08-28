import React, { useState, useEffect } from "react";
import { DonationModal } from "./DonationModal";
import { useButtonSettings } from "@/hooks/useAppearanceSettings";

const SWITCH_ON_CLASS: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-green-600",
  accent: "bg-accent",
  warning: "bg-yellow-500",
  danger: "bg-destructive",
  foreground: "bg-foreground",
};

export const DonationButton = () => {
  const buttonSettings = useButtonSettings();
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sos01_donation_open") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sos01_donation_open", String(isOpen));
  }, [isOpen]);


  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-16 h-8 sm:w-24 sm:h-12 p-1 transition-all duration-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.1)] active:scale-95 border-b-2 border-t border-black/20 ${
            buttonSettings.shape
          } ${!isOpen && buttonSettings.animate ? "animate-pulse-slow" : ""} ${
            isOpen
              ? `${SWITCH_ON_CLASS[buttonSettings.color] ?? "bg-green-600"} shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]`
              : "bg-[#C41230] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          }`}
          aria-label="Apoie o SOS01"
        >
          {/* Fundo do trilho do interruptor */}
          <div className={`absolute inset-0 opacity-50 bg-gradient-to-b from-black/20 to-transparent ${buttonSettings.shape}`} />
          
          {/* Esfera / Knob do Interruptor */}
          <div 
            className={`absolute top-0.5 bottom-0.5 w-6 h-6 sm:w-10 sm:h-10 bg-white ${
              buttonSettings.shape === "rounded-full" ? "rounded-full" : buttonSettings.shape
            } flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.4),0_0_2px_rgba(0,0,0,0.2)] border border-gray-200 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isOpen 
                ? "left-[calc(100%-1.75rem)] sm:left-[calc(100%-2.75rem)] rotate-[360deg]" 
                : "left-1 rotate-0"
            }`}
          >
            <img 
              src="/favicon.png" 
              alt="Icon" 
              className={`w-3 h-3 sm:w-6 sm:h-6 object-contain transition-transform duration-500 ${
                isOpen ? "scale-110" : "scale-100"
              }`}
            />
          </div>

          {/* Luz indicadora (LED) interna */}
          <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 text-[10px] font-black tracking-tighter ${
            isOpen ? "left-3 text-green-900/40" : "right-3 text-red-900/40"
          }`}>
            {isOpen ? "ON" : "OFF"}
          </div>
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-foreground/50 uppercase">Donate</span>
      </div>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
