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
        className="relative group overflow-hidden border-2 border-green-500/30 hover:border-green-500/60 bg-green-500/5 hover:bg-green-500/10 transition-all duration-300 gap-2 px-3 sm:px-4 h-9 sm:h-10"
      >
        <Heart className="w-4 h-4 text-green-500 fill-green-500 group-hover:scale-110 transition-transform duration-300" />
        <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground whitespace-nowrap">
          APOIE O SOS01
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>

      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
