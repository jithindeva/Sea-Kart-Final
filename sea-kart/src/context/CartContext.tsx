"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/data/products';
import { useUser } from './UserContext';
import { toast } from "sonner";

export interface CartItem extends Product {
  quantity: number;
  selectedUnit?: 'kg' | 'pieces';
  selectedQuantity?: number;
  unitLabel?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  timestamp: number;
  total: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  deliverySlot?: string;
}

import { getApiBase } from '../config/api';

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  wishlist: string[];
  addToCart: (product: Product, unitDetails?: { selectedUnit?: 'kg' | 'pieces'; selectedQuantity?: number; unitLabel?: string }) => void;
  reorderItems: (items: CartItem[]) => void;
  removeFromCart: (productId: string, unitLabel?: string) => void;
  clearCart: () => void;
  placeOrder: (method: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('seakart_user_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const { token, user, updateUser } = useUser();

  const wishlist = user?.wishlist || [];

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('seakart_user_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  useEffect(() => {
    if (token) {
      const fetchOrders = () => {
        fetch(`${getApiBase()}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(err => console.error(err));
      };
      
      // Fetch immediately
      fetchOrders();

      // Poll every 5 seconds for real-time updates (e.g. admin marking as delivered)
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
    }
  }, [token]);

  const addToCart = (
    product: Product, 
    unitDetails?: { selectedUnit?: 'kg' | 'pieces'; selectedQuantity?: number; unitLabel?: string }
  ) => {
    const selectedUnit = unitDetails?.selectedUnit || 'kg';
    const selectedQuantity = unitDetails?.selectedQuantity || 1;
    const unitLabel = unitDetails?.unitLabel || (selectedUnit === 'kg' ? (selectedQuantity < 1 ? `${selectedQuantity * 1000}g` : `${selectedQuantity} Kg`) : `${selectedQuantity} Pc${selectedQuantity > 1 ? 's' : ''}`);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedUnit === selectedUnit);
      if (existingIndex > -1) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newSelectedQuantity = (current.selectedQuantity || 1) + selectedQuantity;
        let newUnitLabel = '';
        if (selectedUnit === 'kg') {
          newUnitLabel = newSelectedQuantity < 1 ? `${newSelectedQuantity * 1000}g` : `${newSelectedQuantity} Kg`;
        } else {
          newUnitLabel = `${newSelectedQuantity} Pc${newSelectedQuantity > 1 ? 's' : ''}`;
        }

        updated[existingIndex] = {
          ...current,
          selectedQuantity: newSelectedQuantity,
          unitLabel: newUnitLabel,
          // keep quantity as is (usually 1) because the weight itself is consolidated
        };
        return updated;
      }
      return [
        ...prev, 
        { 
          ...product, 
          quantity: 1, 
          selectedUnit, 
          selectedQuantity, 
          unitLabel 
        }
      ];
    });
    toast.success(`${product.name} (${unitLabel}) added to cart!`);
  };

  const reorderItems = (items: CartItem[]) => {
    if (!items || items.length === 0) return;
    setCart(prev => {
      let updatedCart = [...prev];
      items.forEach(newItem => {
        const selectedUnit = newItem.selectedUnit || 'kg';
        // Account for old orders where quantity represented the multiplier
        const newItemSelectedQuantity = (newItem.selectedQuantity || 1) * (newItem.quantity || 1);
        
        const existingIdx = updatedCart.findIndex(item => item.id === newItem.id && item.selectedUnit === selectedUnit);
        
        if (existingIdx > -1) {
          const current = updatedCart[existingIdx];
          const newSelectedQuantity = (current.selectedQuantity || 1) + newItemSelectedQuantity;
          let newUnitLabel = '';
          if (selectedUnit === 'kg') {
            newUnitLabel = newSelectedQuantity < 1 ? `${newSelectedQuantity * 1000}g` : `${newSelectedQuantity} Kg`;
          } else {
            newUnitLabel = `${newSelectedQuantity} Pc${newSelectedQuantity > 1 ? 's' : ''}`;
          }

          updatedCart[existingIdx] = {
            ...current,
            selectedQuantity: newSelectedQuantity,
            unitLabel: newUnitLabel,
          };
        } else {
          updatedCart.push({
            ...newItem,
            quantity: 1, // Reset to 1 because weight is now consolidated
            unitLabel: selectedUnit === 'kg' ? (newItemSelectedQuantity < 1 ? `${newItemSelectedQuantity * 1000}g` : `${newItemSelectedQuantity} Kg`) : `${newItemSelectedQuantity} Pc${newItemSelectedQuantity > 1 ? 's' : ''}`,
            selectedUnit: selectedUnit,
            selectedQuantity: newItemSelectedQuantity
          });
        }
      });
      return updatedCart;
    });
    toast.success(`Items re-added to cart! Ready for checkout.`);
  };

  const removeFromCart = (productId: string, unitLabel?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && (!unitLabel || item.unitLabel === unitLabel))));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('seakart_user_cart');
    } catch (e) {
      console.error('Failed to clear cart storage:', e);
    }
  };

  const placeOrder = async (method: string) => {
    if (cart.length === 0) return;
    if (!token) {
      toast.error('Please login to place an order');
      return;
    }
    
    try {
      const total = "Market Price";
      const res = await fetch(`${getApiBase()}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart, total, paymentMethod: method })
      });
      
      const newOrder = await res.json();
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      toast.success("Order placed successfully! Check your dashboard.");
    } catch (err) {
      toast.error("Failed to place order.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${getApiBase()}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to cancel order");
        return;
      }
      const data = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error("An error occurred while cancelling the order.");
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!token) {
      toast.error('Please login to use wishlist');
      return;
    }
    
    try {
      const res = await fetch(`${getApiBase()}/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      updateUser({ wishlist: data.wishlist });
      if (wishlist.includes(productId)) {
        toast.info("Removed from wishlist");
      } else {
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist.");
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      orders, 
      wishlist, 
      addToCart, 
      reorderItems,
      removeFromCart, 
      clearCart, 
      placeOrder,
      cancelOrder,
      toggleWishlist,
      totalItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
