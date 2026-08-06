"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STEPS = [
  {
    id: 'Placed',
    label: 'Order Placed',
    description: 'We received your order and sent confirmation.',
    icon: CheckCircle,
  },
  {
    id: 'Processing',
    label: 'Processing & Fresh Packing',
    description: 'Seafood is cleaned, portioned, and ice-packed.',
    icon: Package,
  },
  {
    id: 'Out for Delivery',
    label: 'Out for Delivery',
    description: 'Order is on the way with our cold-chain delivery agent.',
    icon: Truck,
  },
  {
    id: 'Delivered',
    label: 'Delivered',
    description: 'Successfully delivered to your doorstep.',
    icon: ShieldCheck,
  },
];

const TrackOrder = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const { orders } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(orderId || '');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [viewTab, setViewTab] = useState<'map' | 'timeline'>('map');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const targetId = orderId || searchInput;
    if (targetId && orders.length > 0) {
      const match = orders.find(
        o => o.id.toLowerCase() === targetId.trim().toLowerCase()
      );
      if (match) {
        setCurrentOrder(match);
      } else {
        // Fallback or default to first order if provided in URL
        const first = orders.find(o => o.id);
        if (first && orderId) setCurrentOrder(first);
      }
    } else if (orders.length > 0) {
      setCurrentOrder(orders[0]);
    }
  }, [orderId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = orders.find(
      o => o.id.toLowerCase() === searchInput.trim().toLowerCase()
    );
    if (found) {
      setCurrentOrder(found);
      navigate(`/track-order/${found.id}`, { replace: true });
    } else {
      toast.error(`Order "${searchInput}" not found. Please check Order ID.`);
    }
  };

  // Determine current active step index (0: Placed, 1: Processing, 2: Out for Delivery, 3: Delivered)
  const getStepIndex = (statusStr?: string, timestamp?: number): number => {
    if (!statusStr) {
      if (!timestamp) return 0;
      const hours = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (hours < 0.5) return 0; // Placed
      if (hours < 4) return 1;   // Processing
      if (hours < 12) return 2;  // Out for Delivery
      return 3;                  // Delivered
    }

    const s = statusStr.toLowerCase();
    if (s === 'placed') return 0;
    if (s === 'processing') return 1;
    if (s.includes('out') || s.includes('delivery')) return 2;
    if (s === 'delivered') return 3;
    if (s === 'cancelled') return -1;
    return 1;
  };

  const activeStepIdx = currentOrder ? getStepIndex(currentOrder.status, currentOrder.timestamp) : 1;

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const openWhatsAppSupport = () => {
    if (!currentOrder) return;
    const msg = `Hi Sea Kart Support! I need an update on my Order ID ${currentOrder.id}.`;
    window.open(`https://wa.me/919380382950?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="pt-28 pb-20 container mx-auto px-4 max-w-5xl">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="rounded-2xl gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                type="text"
                placeholder="Enter Order ID (e.g. #SK-001)"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              Track
            </Button>
          </form>
        </div>

        {/* Page Main Content */}
        {!currentOrder ? (
          <Card className="border-none shadow-sm rounded-3xl p-12 text-center bg-white dark:bg-slate-900">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Order Selected</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Enter your Order ID above or pick an order from your dashboard history to view live delivery status.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white rounded-xl">
              Go to My Orders
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Header Card */}
            <Card className="border-none shadow-md rounded-[32px] overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-extrabold tracking-tight">Order {currentOrder.id}</h1>
                      <Badge className="bg-blue-500/30 backdrop-blur-md text-blue-100 border border-blue-400/40 text-xs px-3 py-1">
                        {currentOrder.status || (activeStepIdx === 3 ? 'Delivered' : 'In Progress')}
                      </Badge>
                    </div>
                    <p className="text-blue-200 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Placed on {new Date(currentOrder.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={openWhatsAppSupport}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-2xl gap-2 font-bold shadow-lg shadow-green-500/20"
                    >
                      <MessageSquare className="w-4 h-4" /> WhatsApp Live Updates
                    </Button>
                  </div>
                </div>

                {/* Delivery details sub-grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-sm">
                  <div>
                    <span className="text-blue-300 block text-xs uppercase font-bold tracking-wider mb-1">Delivery Slot</span>
                    <span className="font-semibold text-white">{currentOrder.deliverySlot || 'Standard Express (Within 2 Hours)'}</span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-xs uppercase font-bold tracking-wider mb-1">Delivery Address</span>
                    <span className="font-semibold text-white line-clamp-2">{currentOrder.address || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-xs uppercase font-bold tracking-wider mb-1">Payment Method</span>
                    <span className="font-semibold text-white">{currentOrder.paymentMethod || 'Razorpay Prepaid'}</span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-xs uppercase font-bold tracking-wider mb-1">Total Amount</span>
                    <span className="font-extrabold text-amber-300 text-lg">{currentOrder.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Visual 4-Step Progress Bar ── */}
            <Card className="border-none shadow-sm rounded-[32px] bg-white dark:bg-slate-900 p-8">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xl font-bold text-blue-950 dark:text-white flex items-center gap-2">
                  <Truck className="w-6 h-6 text-blue-600" /> Real-time Delivery Status
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {activeStepIdx === -1 ? (
                  <div className="p-6 bg-red-50 dark:bg-red-950/40 rounded-2xl text-center text-red-600 font-bold border border-red-200 dark:border-red-900">
                    This order was cancelled. Payment will be refunded to original source.
                  </div>
                ) : (
                <div>
                  {/* Desktop Step Bar */}
                  <div className="hidden md:block relative mb-12">
                    <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-1.5 bg-slate-200 dark:bg-slate-800 z-0 rounded-full" />
                    <div 
                      className="absolute top-1/2 left-10 -translate-y-1/2 h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500 z-0 rounded-full transition-all duration-700"
                      style={{ width: `${(activeStepIdx / (STEPS.length - 1)) * 80 + 5}%` }}
                    />

                    <div className="relative z-10 grid grid-cols-4 gap-4 text-center">
                      {STEPS.map((step, idx) => {
                        const isDone = idx < activeStepIdx;
                        const isCurrent = idx === activeStepIdx;
                        const Icon = step.icon;

                        return (
                          <div key={step.id} className="flex flex-col items-center group">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : isCurrent
                                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40 ring-4 ring-blue-100 dark:ring-blue-900/50 animate-pulse'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Icon className="w-7 h-7" />
                            </div>
                            <h4 className={`mt-4 font-bold text-sm ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {step.label}
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[160px] mt-1">
                              {step.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Vertical Step Bar */}
                  <div className="md:hidden space-y-6 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                    {STEPS.map((step, idx) => {
                      const isDone = idx < activeStepIdx;
                      const isCurrent = idx === activeStepIdx;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="relative flex items-start gap-4">
                          <div
                            className={`absolute -left-[35px] w-9 h-9 rounded-full flex items-center justify-center ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="pl-2">
                            <h4 className={`font-bold text-base ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                              {step.label}
                            </h4>
                            <p className="text-xs text-slate-400">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

            {/* Order Items & Customer Address Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items Breakdown */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm rounded-[32px] bg-white dark:bg-slate-900 p-8">
                  <h3 className="text-xl font-bold text-blue-950 dark:text-white mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" /> Items in Order
                  </h3>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                        {item.image && (
                          <div 
                            onClick={() => setPreviewImage({ url: item.image, title: item.name })}
                            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer group hover:scale-115 hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all duration-300 relative"
                            title="Click to view full size image"
                          >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-950 dark:text-white text-base">{item.name}</h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                            Portion: <Badge variant="outline" className="ml-1 border-blue-200">{item.unitLabel || '1 Kg'}</Badge>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            Qty: {item.quantity || 1}
                          </p>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {item.priceRange || 'Market Price'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Delivery Address & Customer Info */}
              <div className="space-y-6">
                <Card className="border-none shadow-sm rounded-[32px] bg-white dark:bg-slate-900 p-6">
                  <h4 className="font-bold text-blue-950 dark:text-white text-base mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Delivery Address
                  </h4>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-blue-950 dark:text-white">{currentOrder.user?.name || user?.name || 'Valued Customer'}</p>
                    <p>{currentOrder.address || user?.address || 'Standard Coastal Address, Mangalore'}</p>
                    <p className="text-slate-400 flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-blue-600" /> {currentOrder.user?.phone || user?.phone || '+91 93803 82950'}
                    </p>
                  </div>
                </Card>

                <Card className="border-none shadow-sm rounded-[32px] bg-blue-50 dark:bg-slate-800/80 p-6 border border-blue-100 dark:border-slate-700">
                  <h4 className="font-bold text-blue-950 dark:text-white text-sm mb-2">Sea Kart Fresh Guarantee</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    All seafood is caught fresh daily, cleaned under hygienic conditions, and packed with sub-zero gel packs for pristine delivery.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl scale-100 transition-all duration-300 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
              title="Close"
            >
              ✕
            </button>
            <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 mb-4 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="w-full h-full object-cover rounded-2xl shadow-inner hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg font-bold text-blue-950 dark:text-white text-center">{previewImage.title}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sea Kart Fresh Seafood</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TrackOrder;
