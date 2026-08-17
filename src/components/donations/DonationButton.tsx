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
        className="relative group overflow-hidden border border-green-500/30 hover:border-green-500/60 bg-white/10 hover:bg-white/20 backdrop-blur-md text-foreground transition-all duration-300 gap-2 px-4 sm:px-6 h-9 sm:h-11 rounded-full shadow-lg hover:shadow-green-500/20 active:scale-95 animate-pulse-slow"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-green-500/5 opacity-50" />
        <Heart className="w-4 h-4 text-green-500 fill-green-500/20 group-hover:fill-green-500 group-hover:scale-110 transition-all duration-300" />
        <span className="relative z-10 font-display font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap">
          APOIE O SOS01
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
