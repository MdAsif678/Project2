import React from 'react';

export const PerspectiveGrid: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden"
      style={{
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)'
      }}
    >
      <div 
        className="w-full h-[200%] animate-grid-drift"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(45deg) translateY(-20%)',
          transformOrigin: 'top center'
        }}
      />
    </div>
  );
};
