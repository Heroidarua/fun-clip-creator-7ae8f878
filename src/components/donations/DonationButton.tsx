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
        className="relative group overflow-hidden border-2 border-primary/20 hover:border-primary bg-card/60 backdrop-blur-md text-foreground transition-all duration-300 gap-2 px-4 sm:px-6 h-9 sm:h-11 rounded-sm shadow-cartridge active:scale-95 animate-pulse-slow"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-green-500/5 opacity-50" />
        <Heart className="w-4 h-4 text-primary fill-primary/20 group-hover:fill-primary group-hover:scale-110 transition-all duration-300" />
        <span className="relative z-10 font-pixel text-[10px] sm:text-xs tracking-wider whitespace-nowrap">
          APOIE O SOS01
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
