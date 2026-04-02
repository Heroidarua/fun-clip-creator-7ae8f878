import React, { useEffect, useState } from "react";
import luigiWalking from "@/assets/luigi-walking.gif";

const FreeLuigi = () => {
  const [position, setPosition] = useState(typeof window !== "undefined" ? Math.floor(window.innerWidth * 0.7) : 700);
  const [direction, setDirection] = useState<'right' | 'left'>('left');

  useEffect(() => {
    const speed = 0.9;
    
    const moveLuigi = () => {
      setPosition(prev => {
        const maxWidth = window.innerWidth;
        
        if (direction === 'left') {
          if (prev <= -50) {
            setDirection('right');
            return prev;
          }
          return prev - speed;
        } else {
          if (prev >= maxWidth + 50) {
            setDirection('left');
            return prev;
          }
          return prev + speed;
        }
      });
    };

    const interval = setInterval(moveLuigi, 16);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position}px`,
        bottom: '8px',
        transform: `scaleX(${direction === 'left' ? -1 : 1})`,
      }}
    >
      <img
        src={luigiWalking}
        alt="Luigi walking"
        className="h-8 sm:h-10 w-auto"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      />
    </div>
  );
};

export default FreeLuigi;
