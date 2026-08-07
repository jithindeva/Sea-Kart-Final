"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Database, WifiOff, Award, Truck } from 'lucide-react';

const AboutUs = () => {
  const trustFeatures = [
    {
      icon: Zap,
      title: "Vercel Edge Auto-Scaling",
      desc: "Lightning-fast global Edge CDN. Handles heavy holiday seafood rushes & viral ordering traffic automatically with 0ms lag.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Database Connection Pooling",
      desc: "High-performance MongoDB Atlas worker pools ensuring instant sub-second order placement & real-time order tracking.",
      color: "from-teal-500 to-emerald-500"
    },
    {
      icon: WifiOff,
      title: "Fail-Safe Cart Preservation",
      desc: "Smart device local storage preserves your chosen seafood cart items 100% even if mobile network drops while traveling.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-slate-50 to-blue-50/50 dark:from-slate-900/80 dark:to-slate-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Story */}
        <div className="max-w-4xl mx-auto text-center mb-16">
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

        {/* Enterprise Trust Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-blue-950 dark:text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              Built for Enterprise Reliability & Speed
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Powered by modern cloud infrastructure to guarantee 99.99% uptime for every order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feat.color} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-blue-950 dark:text-white mb-2">{feat.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;