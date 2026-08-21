import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationModal } from "./DonationModal";

export const DonationButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`group relative flex items-center justify-between rounded-full p-1 pl-4 pr-1 transition-all duration-500 shadow-lg active:scale-95 ${
          isOpen ? "bg-green-600 ring-4 ring-green-600/20" : "bg-[#C41230] hover:bg-[#A80F29]"
        }`}
        aria-label="Apoie o SOS01"
      >
        <span className="text-white font-bold text-xs sm:text-sm tracking-tight mr-3 uppercase">
          {isOpen ? "ON" : "DONATE"}
        </span>
        <div 
          className={`relative w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-500 ${
            isOpen ? "translate-x-0 border-green-600 rotate-12" : "border-[#C41230]"
          }`}
        >
          <img 
            src="/favicon.png" 
            alt="Icon" 
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
          />
        </div>
      </button>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
