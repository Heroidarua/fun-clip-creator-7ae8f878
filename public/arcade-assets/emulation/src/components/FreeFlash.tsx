import React, { useEffect, useState } from "react";
import flashRunning from "@/assets/flash-running.gif";

const FreeFlash = () => {
  const [position, setPosition] = useState(-60);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const speed = 1.8; // Slower speed
    
    const moveFlash = () => {
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

    const interval = setInterval(moveFlash, 16);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      className="absolute pointer-events-none z-50 left-0 right-0"
      style={{
        bottom: '0px',
      }}
    >
      <img
        src={flashRunning}
        alt="Flash running"
        className="h-8 sm:h-10 w-auto absolute"
        style={{
          left: `${position}px`,
          transform: `scaleX(${direction === 'right' ? 1 : -1})`,
          filter: 'drop-shadow(0 2px 4px rgba(255, 0, 0, 0.4))',
        }}
      />
    </div>
  );
};

export default FreeFlash;
