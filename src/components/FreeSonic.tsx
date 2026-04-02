import React, { useEffect, useState } from "react";
import sonicRunning from "@/assets/sonic-running.gif";

const FreeSonic = () => {
  const [position, setPosition] = useState(Math.floor(window.innerWidth * 0.6));
  const [direction, setDirection] = useState<'right' | 'left'>('left');

  useEffect(() => {
    const speed = 1.5; // Sonic is faster!
    
    const moveSonic = () => {
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

    const interval = setInterval(moveSonic, 16);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position}px`,
        bottom: '4px',
        transform: `scaleX(${direction === 'right' ? -1 : 1})`,
      }}
    >
      <img
        src={sonicRunning}
        alt="Sonic running"
        className="h-10 sm:h-12 w-auto"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      />
    </div>
  );
};

export default FreeSonic;
