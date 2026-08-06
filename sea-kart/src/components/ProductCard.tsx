"use client";

import React, { useState } from 'react';
import { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Info, PhoneCall, Heart, Star, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import ReviewSection from './ReviewSection';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const { isLoggedIn } = useUser();
  const isWishlisted = wishlist.includes(product.id);
  const [showReviews, setShowReviews] = useState(false);

  // Unit and weight selection directly on card
  const [unitType, setUnitType] = useState<'kg' | 'pieces'>('kg');
  const [unitQty, setUnitQty] = useState<number>(1);

  // Fetch average rating for badge display
  const { data: reviewData } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: async () => {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || '') + `/api/reviews/${product.id}`
      );
      return res.json() as Promise<{ average: string | null; count: number }>;
    },
    staleTime: 60_000,
  });

  const getUnitLabel = () => {
    if (unitType === 'kg') {
      return unitQty === 0.5 ? '500g' : `${unitQty} Kg`;
    }
    return `${unitQty} Pc${unitQty > 1 ? 's' : ''}`;
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("Please login to this website to add items to your cart.");
      return;
    }
    addToCart(product, {
      selectedUnit: unitType,
      selectedQuantity: unitQty,
      unitLabel: getUnitLabel()
    });
  };

  const handleOrderNow = () => {
    const label = getUnitLabel();
    const message = `Hello Sea Kart! I would like to order ${product.name} (${product.localName || ''}) - Quantity: ${label}. Please let me know the availability and final price.`;
    window.open(`https://wa.me/919380382950?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWishlist = () => {
    if (!isLoggedIn) {
      toast.error("Please login to this website to use the wishlist.");
      return;
    }
    toggleWishlist(product.id);
  };

  const setUnitMode = (mode: 'kg' | 'pieces') => {
    setUnitType(mode);
    setUnitQty(1);
  };

  return (
    <>
      <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-blue-50 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-blue-900/20 transition-all duration-500">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-blue-600/90 backdrop-blur-sm text-white border-none px-3 py-1">
              {product.category}
            </Badge>
          </div>
          <button 
            onClick={handleWishlist}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/50 dark:bg-slate-900/50 text-blue-950 dark:text-white hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          {product.isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Badge className="bg-slate-900 text-white border-none text-sm md:text-base py-1.5 px-4 shadow-xl">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-blue-950 dark:text-white">{product.name}</h3>
              {product.localName && (
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">({product.localName})</p>
              )}
              {/* ── Star Rating Badge ── */}
              <button
                onClick={() => setShowReviews(true)}
                className="flex items-center gap-1 mt-1.5 group/stars"
              >
                {reviewData?.average ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {reviewData.average}
                    </span>
                    <span className="text-xs text-slate-400 group-hover/stars:text-blue-500 transition-colors">
                      ({reviewData.count} {reviewData.count === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 hover:text-blue-500 transition-colors">
                    No reviews yet · Be first!
                  </span>
                )}
              </button>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-900 dark:text-white">{product.priceRange}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Per KG</p>
            </div>
          </div>

          {/* ── Direct Unit & Quantity Selection ── */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Portion:</span>
              <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUnitMode('kg')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    unitType === 'kg' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                  }`}
                >
                  Kg
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('pieces')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    unitType === 'pieces' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                  }`}
                >
                  Pieces
                </button>
              </div>
            </div>

            {/* Presets & Stepper */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {unitType === 'kg' ? (
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[0.5, 1, 2, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setUnitQty(val)}
                      className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                        unitQty === val
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {val === 0.5 ? '500g' : `${val}kg`}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[1, 2, 5, 10].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setUnitQty(val)}
                      className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                        unitQty === val
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {val} pc{val > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-blue-900 dark:text-blue-300 font-medium px-1">
              <span>Selected: <strong className="text-blue-600 dark:text-blue-400 font-bold">{getUnitLabel()}</strong></span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUnitQty(prev => Math.max(unitType === 'kg' ? 0.5 : 1, prev - (unitType === 'kg' ? 0.5 : 1)))}
                  className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{unitQty}</span>
                <button
                  type="button"
                  onClick={() => setUnitQty(prev => prev + (unitType === 'kg' ? 0.5 : 1))}
                  className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleAddToCart}
                disabled={product.isOutOfStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-blue-500/20"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.isOutOfStock ? 'Sold Out' : `Add (${getUnitLabel()})`}
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="View Reviews"
                onClick={() => setShowReviews(true)}
                className="rounded-xl border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleOrderNow}
              variant="secondary"
              disabled={product.isOutOfStock}
              className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-100 dark:border-green-900/50 rounded-xl gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhoneCall className="w-4 h-4" />
              Order Now via WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* ── Reviews Modal ── */}
      {showReviews && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowReviews(false); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowReviews(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ReviewSection productId={product.id} productName={product.name} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;