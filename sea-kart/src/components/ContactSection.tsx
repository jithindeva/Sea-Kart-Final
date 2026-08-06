"use client";

import React, { useState } from 'react';
import { Phone, Mail, Instagram, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${formData.name}%0D%0APhone: ${formData.phone}%0D%0AMessage: ${formData.message}`;
    window.location.href = `mailto:seakart019@gmail.com?subject=New Inquiry from ${formData.name}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 bg-animated-mesh">
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden shadow-xl border border-blue-100 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-12 lg:p-20 bg-slate-50/70 dark:bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-blue-100 dark:border-slate-800">
              <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Get in Touch</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-12 text-lg">
                Ready to order? Or have questions about our wholesale pricing? Reach out to us anytime.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">WhatsApp Us</p>
                    <a 
                      href="https://wa.me/919380382950" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-2xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      93803 82950
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Email Us</p>
                    <a href="mailto:seakart019@gmail.com" className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">seakart019@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <Instagram className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Follow Us</p>
                    <a 
                      href="https://www.instagram.com/seakart19/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      @seakart19
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Service Area</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">In and around Bangalore</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-950 p-12 lg:p-20">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send a Message</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <Input 
                      placeholder="John Doe" 
                      className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:ring-blue-600" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <Input 
                      placeholder="+91 00000 00000" 
                      className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:ring-blue-600" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Message</label>
                  <Textarea 
                    placeholder="I'd like to order 2kg of King Fish..." 
                    className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:ring-blue-600 min-h-[150px]" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-blue-500/20">
                  <MessageSquare className="w-5 h-5" />
                  Send Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;