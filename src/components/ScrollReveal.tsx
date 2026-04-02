import { useState, useEffect, useRef, ReactNode, useCallback } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

const ScrollReveal = ({ 
  children, 
  direction = "up", 
  delay = 0, 
  className = "" 
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const checkVisibility = useCallback(() => {
    if (elementRef.current && !hasAnimated.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInView) {
        setTimeout(() => {
          setIsVisible(true);
          hasAnimated.current = true;
        }, delay);
      }
    }
  }, [delay]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setTimeout(() => {
            setIsVisible(true);
            hasAnimated.current = true;
          }, delay);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Check on mount in case element is already visible
    checkVisibility();

    // Handle page resume from bfcache
    const handlePageResume = () => {
      if (hasAnimated.current) {
        setIsVisible(true);
      } else {
        checkVisibility();
      }
    };

    window.addEventListener('page-resumed', handlePageResume);

    return () => {
      observer.disconnect();
      window.removeEventListener('page-resumed', handlePageResume);
    };
  }, [delay, checkVisibility]);

  const getTransformClass = () => {
    const base = "transition-all duration-1000 ease-out";
    
    if (!isVisible) {
      switch (direction) {
        case "up":
          return `${base} opacity-0 translate-y-10`;
        case "down":
          return `${base} opacity-0 -translate-y-10`;
        case "left":
          return `${base} opacity-0 translate-x-10`;
        case "right":
          return `${base} opacity-0 -translate-x-10`;
        default:
          return `${base} opacity-0 translate-y-10`;
      }
    }
    
    return `${base} opacity-100 translate-x-0 translate-y-0`;
  };

  return (
    <div 
      ref={elementRef} 
      className={`${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;