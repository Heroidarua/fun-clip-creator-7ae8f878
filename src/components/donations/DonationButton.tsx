import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationModal } from "./DonationModal";

export const DonationButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-between rounded-full p-1 pl-4 pr-1 transition-all duration-500 shadow-lg active:scale-95 border-2 ${
          isOpen 
            ? "bg-green-600 border-green-400 ring-4 ring-green-600/20" 
            : "bg-[#C41230] border-[#E82C4D] hover:bg-[#A80F29]"
        }`}
        aria-label="Apoie o SOS01"
      >
        <span className={`text-white font-bold text-xs sm:text-sm tracking-tight mr-3 uppercase transition-all duration-500 ${
          isOpen ? "opacity-100 scale-110" : "opacity-90"
        }`}>
          {isOpen ? "ON" : "DONATE"}
        </span>
        <div 
          className={`relative w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-500 ease-in-out shadow-sm ${
            isOpen ? "translate-x-0 border-green-600 rotate-[360deg] scale-105" : "border-[#C41230]"
          }`}
        >
          <img 
            src="/favicon.png" 
            alt="Icon" 
            className={`w-4 h-4 sm:w-5 sm:h-5 object-contain transition-transform duration-500 ${
              isOpen ? "scale-110" : "scale-100"
            }`}
          />
        </div>

        {/* Efeito de brilho quando ligado */}
        {isOpen && (
          <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none" />
        )}
      </button>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
