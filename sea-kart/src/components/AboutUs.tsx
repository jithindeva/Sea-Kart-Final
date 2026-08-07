"use client";

import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-slate-50 to-blue-50/50 dark:from-slate-900/80 dark:to-slate-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Story */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100 dark:bg-blue-900/60 dark:text-blue-300 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 mb-4 inline-block">
              Coastal Freshness & High Reliability
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 dark:text-white mb-6 tracking-tight">
              Our Story: From Coast to Your Kitchen
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-4 leading-relaxed">
              Sea Kart was born out of a passion for the ocean and a commitment to bringing the finest seafood to your doorstep. We work directly with coastal fishermen along the Mangalore coast, ensuring that every catch is handled with care, cleaned hygienically, and delivered chemical-free.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;