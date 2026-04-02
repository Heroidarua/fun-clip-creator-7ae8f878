import React, { useEffect, useState } from "react";
import yoshiWalking from "@/assets/yoshi-walking.gif";

const FreeYoshi = () => {
  const [position, setPosition] = useState(Math.floor(window.innerWidth / 2));
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const speed = 1.0;
    
    const moveYoshi = () => {
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

    const interval = setInterval(moveYoshi, 16);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position}px`,
        bottom: '8px',
        transform: `scaleX(${direction === 'right' ? -1 : 1})`,
      }}
    >
      <img
        src={yoshiWalking}
        alt="Yoshi walking"
        className="h-8 sm:h-10 w-auto"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      />
    </div>
  );
};

export default FreeYoshi;
