import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationModal } from "./DonationModal";

export const DonationButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="relative group overflow-hidden border-2 border-green-500 hover:border-green-600 bg-green-500 text-white hover:bg-green-600 transition-all duration-300 gap-2 px-3 sm:px-5 h-9 sm:h-11 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] active:scale-95 animate-pulse-slow"
      >
        <Heart className="w-4 h-4 text-white fill-white group-hover:scale-125 transition-transform duration-300" />
        <span className="font-display font-black text-xs sm:text-sm tracking-widest whitespace-nowrap uppercase">
          APOIE O SOS01
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </Button>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
