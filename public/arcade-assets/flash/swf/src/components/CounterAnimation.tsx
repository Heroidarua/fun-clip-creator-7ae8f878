import { useState, useEffect, useRef, useCallback } from "react";

interface CounterAnimationProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const CounterAnimation = ({ 
  target, 
  duration = 2000, 
  prefix = "", 
  suffix = "", 
  className = "" 
}: CounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const checkVisibility = useCallback(() => {
    if (counterRef.current && !hasAnimated.current) {
      const rect = counterRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInView) {
        setIsVisible(true);
        hasAnimated.current = true;
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    // Check on mount
    checkVisibility();

    // Handle page resume - show final value immediately
    const handlePageResume = () => {
      if (hasAnimated.current) {
        setCount(target);
      } else {
        checkVisibility();
      }
    };

    window.addEventListener('page-resumed', handlePageResume);

    return () => {
      observer.disconnect();
      window.removeEventListener('page-resumed', handlePageResume);
    };
  }, [checkVisibility, target]);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  return (
    <span ref={counterRef} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default CounterAnimation;