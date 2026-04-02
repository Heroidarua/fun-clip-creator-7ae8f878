import React, { useEffect, useState } from "react";
import flinstonesWalking from "@/assets/flintstones-walking.gif";

const FreeFlintstones = () => {
  const [position, setPosition] = useState(typeof window !== "undefined" ? Math.floor(window.innerWidth * 0.3) : 300);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const speed = 1.2;
    
    const moveFlintstones = () => {
      setPosition(prev => {
        const maxWidth = window.innerWidth;
        
        if (direction === 'right') {
          if (prev >= maxWidth + 60) {
            setDirection('left');
            return prev;
          }
          return prev + speed;
        } else {
          if (prev <= -60) {
            setDirection('right');
            return prev;
          }
          return prev - speed;
        }
      });
    };

    const interval = setInterval(moveFlintstones, 16);
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
        src={flinstonesWalking}
        alt="Flintstones walking"
        className="h-10 sm:h-12 w-auto"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      />
    </div>
  );
};

export default FreeFlintstones;
