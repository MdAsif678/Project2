import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const requestRef = useRef<number>();

  useEffect(() => {
    // Check for touch screen or reduced motion
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (isTouchDevice || mediaQuery.matches) return;

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest('button, a, input, [role="button"], .glass-card-interactive, .cursor-pointer');
        setIsHovered(isInteractive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Smooth inertia loop
    const animate = () => {
      setTrailingPos((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18,
        };
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [position]);

  if (!isVisible) return null;

  return (
    <>
      {/* Small Precision Dot */}
      <div
        className="fixed pointer-events-none z-[10000] rounded-full bg-white transition-transform duration-75"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isClicking ? '6px' : '10px',
          height: isClicking ? '6px' : '10px',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      />

      {/* Trailing Fluid Interactive Ring */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full border transition-all duration-300 ${
          isHovered
            ? 'w-16 h-16 border-indigo-400 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-110'
            : 'w-8 h-8 border-white/20 scale-100'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
};
