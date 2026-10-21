import React, { useEffect, useState } from "react";
import marioWalking from "@/assets/mario-walking.gif";

const FreeMario = () => {
  const [position, setPosition] = useState(-50);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const speed = 0.8;
    
    const moveMario = () => {
      setPosition(prev => {
        const maxWidth = window.innerWidth;
        
        if (direction === 'right') {
          if (prev >= maxWidth) {
            setDirection('left');
            return prev;
          }
          return prev + speed;
        } else {
          if (prev <= -50) {
            setDirection('right');
            return prev;
          }
          return prev - speed;
        }
      });
    };

    const interval = setInterval(moveMario, 16);
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
        src={marioWalking}
        alt="Mario walking"
        className="h-8 sm:h-10 w-auto"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      />
    </div>
  );
};

export default FreeMario;
