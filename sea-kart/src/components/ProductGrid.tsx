"use client";

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';

const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: products = [], isLoading, error } = useProducts();

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (isLoading) return <div className="text-center py-24 dark:text-slate-200">Loading freshly caught seafood...</div>;
  if (error) return <div className="text-center py-24 text-red-500">Failed to load products.</div>;

  const categories = ['All', 'Fish', 'Shellfish'];

  return (
    <section id="menu" className="py-24 bg-animated-mesh">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-950 dark:text-white mb-4">Today's Fresh Catch</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Handpicked, cleaned, and hygienically packed. We bring the best of the ocean directly to your kitchen.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-blue-900 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-100 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        <div className="mt-16 text-center">
          <p className="text-blue-900 dark:text-blue-200 font-medium italic">"Prices are negotiable for wholesale orders"</p>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;