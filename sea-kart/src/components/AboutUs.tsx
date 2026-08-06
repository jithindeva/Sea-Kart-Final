"use client";

import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <section id="about" className="py-24 bg-animated-mesh relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-blue-950 dark:text-white mb-6">Our Story: From Coast to Your Kitchen</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-6 leading-relaxed">
              Sea Kart was born out of a passion for the ocean and a commitment to bringing the finest seafood to Bangalore. We believe that everyone deserves access to fish that is as fresh as the day it was caught.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-12 leading-relaxed">
              Our team works directly with local fishermen along the Mangalore coast, ensuring that every catch is handled with care, cleaned hygienically, and delivered to you without any chemical preservatives.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;