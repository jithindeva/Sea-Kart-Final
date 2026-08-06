"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      name: "Anjali Rao",
      role: "Home Chef",
      content: "The King Fish I ordered was incredibly fresh. It reminded me of the fish we get back home in Mangalore. Highly recommended!",
      rating: 5
    },
    {
      name: "Vikram Singh",
      role: "Restaurant Owner",
      content: "Sea Kart is our primary supplier for seafood. Their consistency in quality and timely delivery is unmatched in Bangalore.",
      rating: 5
    },
    {
      name: "Priya Menon",
      role: "Health Enthusiast",
      content: "I love that they don't use any chemicals. The cleaning is perfect, and it saves me so much time in the kitchen.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-950 mb-4">What Our Customers Say</h2>
          <p className="text-slate-600">Join thousands of happy families enjoying fresh seafood daily.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] shadow-sm border border-blue-50 relative"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-blue-50" />
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6 italic">"{review.content}"</p>
              <div>
                <p className="font-bold text-blue-950">{review.name}</p>
                <p className="text-sm text-blue-600">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;