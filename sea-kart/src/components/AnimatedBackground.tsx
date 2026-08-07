"use client";

import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes floatGlow1 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-15px, 15px); }
        }
        @keyframes floatGlow2 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(15px, -15px); }
        }
        .bg-glow-1 {
          animation: floatGlow1 18s ease-in-out infinite;
          will-change: transform;
        }
        .bg-glow-2 {
          animation: floatGlow2 22s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
      <div className="bg-glow-1 absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[40px] opacity-40" />
      <div className="bg-glow-2 absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[40px] opacity-30" />
    </div>
  );
};

export default AnimatedBackground;