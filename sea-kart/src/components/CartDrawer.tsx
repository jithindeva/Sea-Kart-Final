"use client";

import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, Smartphone, MapPin, Banknote } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import DeliveryScheduler from "./DeliveryScheduler";

import { getApiBase } from "@/config/api";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { cart, removeFromCart, totalItems, clearCart } = useCart();
  const [processingState, setProcessingState] = useState<'IDLE' | 'PROCESSING'>('IDLE');
  const [selectedSlot, setSelectedSlot] = useState('');

  const { token, user } = useUser();
  const [deliveryAddress, setDeliveryAddress] = useState('');

  React.useEffect(() => {
    if (user?.address && !deliveryAddress) {
      setDeliveryAddress(user.address);
    }
    // Preload Razorpay script in parallel so payment modal opens instantly
    loadRazorpayScript();
  }, [user]);

  const extractPrice = (priceStr: string) => {
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0]) : 500;
  };

  const calculateTotal = () =>
    cart.reduce((sum, item) => sum + extractPrice(item.priceRange) * (item.selectedQuantity || 1) * item.quantity, 0);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const isSlotValid = (): boolean => {
    if (!selectedSlot) return false;
    try {
      const parts = selectedSlot.split(' at ');
      if (parts.length < 2) return false;
      const datePart = parts[0];
      const timePart = parts[1];
      const parsed = new Date(`${datePart} ${timePart}`);
      return !isNaN(parsed.getTime()) && parsed.getTime() >= Date.now() + 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const handlePayment = async () => {
    if (!token) {
      toast.error('Please login to place an order');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select a delivery date and time.');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address.');
      return;
    }
    if (!isSlotValid()) {
      toast.error('Delivery time must be at least 1 hour from now. Please choose a later time.');
      return;
    }

    setProcessingState('PROCESSING');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not connect to payment gateway. Try Cash on Delivery or check internet.');
        setProcessingState('IDLE');
        return;
      }

      const amount = calculateTotal();

      const res = await fetch(`${getApiBase()}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error('Failed to create payment order');
      const order = await res.json();
      if (!order.id) throw new Error('Failed to create order');

      const options = {
        key: order.key || 'rzp_test_TIDWCx3F9hY5RS',
        amount: order.amount,
        currency: order.currency,
        name: 'Sea Kart',
        description: 'Fresh Seafood Delivery',
        order_id: order.id,
        modal: {
          ondismiss: () => {
            setProcessingState('IDLE');
            onOpenChange(true);
            toast.info('Payment window closed.');
          },
        },
        handler: async (response: any) => {
          try {
            setProcessingState('PROCESSING');
            const verifyRes = await fetch(
              `${getApiBase()}/api/payment/verify`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...response,
                  items: cart,
                  total: `₹${amount}`,
                  paymentMethod: 'Razorpay Online',
                  deliverySlot: selectedSlot,
                  address: deliveryAddress.trim(),
                }),
              }
            );
            if (!verifyRes.ok) throw new Error('Verification failed');
            const verifyData = await verifyRes.json();
            const createdOrder = verifyData.order;

            toast.success('Payment successful & order placed!');

            try {
              const itemsList = cart.map(i => `• ${i.name} (${i.unitLabel || '1 Kg'}) × ${i.quantity}`).join('\n');
              const waMsg = `📦 *NEW ORDER CONFIRMED - SEA KART*\n\n` +
                `*Order ID:* ${createdOrder?.id || '#SK-NEW'}\n` +
                `*Customer:* ${user?.name || 'Customer'} (${user?.phone || 'N/A'})\n` +
                `*Delivery Slot:* ${selectedSlot}\n` +
                `*Delivery Address:* ${deliveryAddress.trim()}\n\n` +
                `*Ordered Items:*\n${itemsList}\n\n` +
                `*Total Amount:* ₹${amount}\n` +
                `*Payment:* Razorpay Prepaid\n\n` +
                `Track Order: ${window.location.origin}/track-order/${createdOrder?.id || ''}`;

              window.open(`https://api.whatsapp.com/send?phone=919380382950&text=${encodeURIComponent(waMsg)}`, '_blank');
            } catch (e) {
              console.error('WhatsApp auto-send error:', e);
            }

            clearCart();
            setSelectedSlot('');
            window.location.href = createdOrder?.id ? `/track-order/${createdOrder.id}` : '/dashboard';
          } catch {
            toast.error('Payment verification failed.');
            setProcessingState('IDLE');
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: user?.phone || '9999999999',
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast.error(response.error?.description || 'Payment failed. Please try again.');
        setProcessingState('IDLE');
        onOpenChange(true);
      });

      onOpenChange(false);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
      setProcessingState('IDLE');
    }
  };

  const handleCodPayment = async () => {
    if (!token) {
      toast.error('Please login to place an order');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select a delivery date and time.');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address.');
      return;
    }
    if (!isSlotValid()) {
      toast.error('Delivery time must be at least 1 hour from now. Please choose a later time.');
      return;
    }

    setProcessingState('PROCESSING');
    try {
      const amount = calculateTotal();
      const res = await fetch(`${getApiBase()}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          total: `₹${amount}`,
          paymentMethod: 'Cash / UPI on Delivery',
          deliverySlot: selectedSlot,
          address: deliveryAddress.trim(),
        }),
      });

      if (!res.ok) throw new Error('Order creation failed');
      const createdOrder = await res.json();
      toast.success('Order placed successfully! Pay on delivery.');

      try {
        const itemsList = cart.map(i => `• ${i.name} (${i.unitLabel || '1 Kg'}) × ${i.quantity}`).join('\n');
        const waMsg = `📦 *NEW ORDER CONFIRMED - SEA KART*\n\n` +
          `*Order ID:* ${createdOrder?.id || '#SK-NEW'}\n` +
          `*Customer:* ${user?.name || 'Customer'} (${user?.phone || 'N/A'})\n` +
          `*Delivery Slot:* ${selectedSlot}\n` +
          `*Delivery Address:* ${deliveryAddress.trim()}\n\n` +
          `*Ordered Items:*\n${itemsList}\n\n` +
          `*Total Amount:* ₹${amount}\n` +
          `*Payment:* Cash / UPI on Delivery\n\n` +
          `Track Order: ${window.location.origin}/track-order/${createdOrder?.id || ''}`;

        window.open(`https://api.whatsapp.com/send?phone=919380382950&text=${encodeURIComponent(waMsg)}`, '_blank');
      } catch (e) {
        console.error('WhatsApp error:', e);
      }

      clearCart();
      setSelectedSlot('');
      window.location.href = createdOrder?.id ? `/track-order/${createdOrder.id}` : '/dashboard';
    } catch {
      toast.error('Failed to place Cash on Delivery order.');
      setProcessingState('IDLE');
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && processingState !== 'IDLE') return;
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {processingState === 'IDLE' ? (
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-8">
                <ShoppingBag className="w-14 h-14 opacity-20" />
                <p className="font-medium">Your cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* ── Cart Items ── */}
                <div className="px-6 py-4 space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.unitLabel}`} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-950 dark:text-white">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                            {item.unitLabel || '1 Kg'}
                          </span>
                          <span className="text-sm text-slate-500 font-medium">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id, item.unitLabel)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* ── Delivery Scheduler ── */}
                <div className="px-6 pb-4">
                  <h3 className="font-bold text-blue-950 dark:text-white mb-3 flex items-center gap-1.5">
                    🗓️ Choose Delivery Date & Time
                    <span className="text-red-500">*</span>
                  </h3>
                  <DeliveryScheduler
                    onSlotChange={setSelectedSlot}
                    selectedSlot={selectedSlot}
                  />
                </div>

                {/* ── Delivery Address ── */}
                <div className="px-6 pb-4">
                  <h3 className="font-bold text-blue-950 dark:text-white mb-3 flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Delivery Address
                    <span className="text-red-500">*</span>
                  </h3>
                  <Textarea 
                    placeholder="Enter your full delivery address..."
                    className="min-h-[80px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                {/* ── Slot Preview ── */}
                {selectedSlot && (
                  <div className="mx-6 mb-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center gap-3 border border-blue-100 dark:border-blue-800">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">Delivery Scheduled</p>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{selectedSlot}</p>
                    </div>
                  </div>
                )}

                {/* ── Payment options ── */}
                <div className="px-6 pb-6 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Button
                    onClick={handlePayment}
                    disabled={!selectedSlot}
                    className="w-full h-13 rounded-xl flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Smartphone className="w-5 h-5" />
                    Pay Online (Razorpay / UPI)
                  </Button>
                  <Button
                    onClick={handleCodPayment}
                    disabled={!selectedSlot}
                    variant="outline"
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-3 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    Cash / UPI on Delivery
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="w-full text-slate-500 hover:text-red-500"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <Smartphone className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-950 dark:text-white mb-2">Processing Order...</h3>
              <p className="text-slate-500">Please complete the payment or wait a moment.</p>
              {selectedSlot && (
                <p className="text-sm text-blue-600 font-medium mt-2">📦 Delivery: {selectedSlot}</p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
