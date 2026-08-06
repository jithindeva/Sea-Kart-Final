"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Fish, Waves, Droplets } from 'lucide-react';

const FloatingElements = () => {
  const elements = [
    { Icon: Fish, size: 40, top: "15%", left: "5%", delay: 0, duration: 15 },
    { Icon: Droplets, size: 24, top: "45%", left: "90%", delay: 2, duration: 12 },
    { Icon: Waves, size: 32, top: "75%", left: "10%", delay: 4, duration: 18 },
    { Icon: Fish, size: 28, top: "25%", left: "85%", delay: 1, duration: 20 },
    { Icon: Droplets, size: 20, top: "85%", left: "80%", delay: 3, duration: 14 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: el.top,
            left: el.left,
            color: '#3b82f6',
          }}
        >
          <el.Icon size={el.size} strokeWidth={1} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;