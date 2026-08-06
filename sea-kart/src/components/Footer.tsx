"use client";

import React from 'react';
import { Instagram, Facebook, Twitter, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SEA KART</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Premium seafood delivery service bringing the freshest catch from the coast directly to your community in Bangalore.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/seakart19/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="#menu" className="hover:text-blue-400 transition-colors">Our Menu</a></li>
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm">
              <li>Daily Fresh Catch</li>
              <li>Wholesale Supply</li>
              <li>Retail Delivery</li>
              <li>Hygienic Packing</li>
              <li>Bangalore Wide Delivery</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500" />
                <a href="tel:9380382950" className="hover:text-blue-400">93803 82950</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500" />
                <a href="mailto:seakart019@gmail.com" className="hover:text-blue-400">seakart019@gmail.com</a>
              </li>
              <li className="italic text-blue-400">
                "Good Fish. Great Taste."
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-900 text-center text-xs">
          <p>© {new Date().getFullYear()} Sea Kart. All rights reserved. Healthy choice for you and your family.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;