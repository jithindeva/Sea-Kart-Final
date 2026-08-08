"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const Hero = () => {
  const { isLoggedIn } = useUser();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative pt-32 pb-32 overflow-hidden bg-animated-mesh">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            variants={itemVariants}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-600 uppercase bg-blue-100 rounded-full"
          >
            Fresh from Sea to Door
          </motion.span>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl lg:text-7xl font-bold text-blue-950 dark:text-white leading-tight mb-6"
          >
            Bringing the <span className="text-blue-600 relative">
              Freshness
              <motion.svg 
                className="absolute -bottom-2 left-0 w-full" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="#2563eb" strokeWidth="2" />
              </motion.svg>
            </span> of the Sea to You!
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto"
          >
            Premium quality seafood, handpicked and delivered hygienically to your doorstep in and around Bangalore. Mangalore vibes at your doorstep.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full gap-2 shadow-xl shadow-blue-500/30 font-bold transition-all hover:scale-105" asChild>
              <a href="#menu" onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  window.dispatchEvent(new Event('open-login'));
                }
              }}>Order Now <ArrowRight className="w-5 h-5" /></a>
            </Button>
            <Button size="lg" variant="outline" className="border-blue-200 text-slate-800 dark:text-white dark:border-blue-800 px-8 py-6 text-lg rounded-full hover:bg-blue-50 dark:hover:bg-slate-800 font-bold" asChild>
              <a href="#menu" onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  window.dispatchEvent(new Event('open-login'));
                }
              }}>View Menu</a>
            </Button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center gap-8"
          >
            {[
              { icon: ShieldCheck, label: "Hygienic" },
              { icon: Truck, label: "Fast Delivery" },
              { icon: Sparkles, label: "No Chemicals" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] text-[#1e3a8a] dark:text-[#1e3a8a]">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C49.49,34.2,124.23,59.17,200,68.33,247.42,74.05,285.19,63.11,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;