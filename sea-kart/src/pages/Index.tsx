"use client";

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import AboutUs from '@/components/AboutUs';
import Testimonials from '@/components/Testimonials';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import FloatingElements from '@/components/FloatingElements';
import ScrollReveal from '@/components/ScrollReveal';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-transparent selection:bg-blue-100 selection:text-blue-900 relative">
      <AnimatedBackground />
      <FloatingElements />
      <FloatingWhatsApp />
      <Navbar />
      <main>
        <Hero />
        
        {/* Features Section */}
        <section className="py-12 bg-blue-900 text-white overflow-hidden relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">100%</span>
                <span className="text-blue-300 text-sm uppercase font-bold tracking-widest">Pure & Natural</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">DAILY</span>
                <span className="text-blue-300 text-sm uppercase font-bold tracking-widest">Fresh Catch</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">SAFE</span>
                <span className="text-blue-300 text-sm uppercase font-bold tracking-widest">Packing</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">FAST</span>
                <span className="text-blue-300 text-sm uppercase font-bold tracking-widest">Delivery</span>
              </div>
            </div>
          </div>
        </section>

        <ScrollReveal>
          <ProductGrid />
        </ScrollReveal>
        
        <ScrollReveal delay={0.3}>
          <AboutUs />
        </ScrollReveal>

        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>

        <ScrollReveal>
          <ContactSection />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;