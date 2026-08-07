"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/hooks/useProducts';
import { 
  Package, 
  Settings, 
  Heart, 
  LogOut, 
  Clock, 
  ShoppingBag, 
  X, 
  RotateCcw, 
  Truck,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductCard from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

const Dashboard = () => {
  const { orders = [], wishlist = [], clearCart, cancelOrder, reorderItems } = useCart();
  const { user, updateUser, logout } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeUserOrders = Array.isArray(orders) ? orders : [];

  const handleReorder = (order: any) => {
    if (order && Array.isArray(order.items)) {
      reorderItems(order.items);
    }
  };

  // Update time ticker every second to accurately expire the 5-minute cancel button
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getOrderStatus = (order: any) => {
    let status = order?.status;
    if (!status) {
      const hours = (Date.now() - (order?.timestamp || Date.now())) / (1000 * 60 * 60);
      status = hours < 24 ? 'Processing' : 'Delivered';
    }
    if (String(status).toUpperCase() === 'PROCESSING') return 'Processing';
    if (String(status).toUpperCase() === 'DELIVERED') return 'Delivered';
    if (String(status).toUpperCase() === 'CANCELLED') return 'CANCELLED';
    return status;
  };

  const safeDateLabel = (timestamp: any) => {
    try {
      if (!timestamp) return 'Recently';
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recently';
    }
  };

  const getItemImage = (item: any) => {
    if (item?.image && typeof item.image === 'string' && item.image.trim() !== '') {
      return item.image;
    }
    const found = products.find(p => String(p.id) === String(item?.id) || p.name.toLowerCase() === (item?.name || '').toLowerCase());
    if (found && found.image) return found.image;
    return 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=300';
  };

  const currentUser = user || {
    name: 'Customer Account',
    email: 'user@seakart.com',
    phone: '+91 93803 82950',
    address: 'Coastal Beach Road, Mangalore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isAdmin: false
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    address: currentUser.address
  });

  useEffect(() => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      address: currentUser.address
    });
  }, [user]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Please select an image smaller than 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          updateUser({ avatar: compressedBase64 });
        } else {
          updateUser({ avatar: event.target?.result as string });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    clearCart();
    navigate('/');
  };

  const { data: products = [] } = useProducts();
  const wishlistedProducts = (Array.isArray(products) ? products : []).filter(p => Array.isArray(wishlist) && wishlist.includes(p.id));

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-28 pb-20 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-blue-950 dark:text-white flex items-center gap-2">
                👤 User Dashboard
              </h1>
              <p className="text-xs text-slate-500">Manage your past orders, saved wishlist items, and account settings.</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Top Navigation Tabs */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-3 mb-6 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              My Orders ({safeUserOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'wishlist' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Wishlist ({wishlistedProducts.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Desktop Sidebar / Mobile Profile Summary */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 self-start">
              <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white dark:bg-slate-900">
                <CardContent className="p-5 sm:p-6 text-center">
                  {/* Clickable Profile Avatar to Upload from Gallery */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 mx-auto mb-3 cursor-pointer group"
                    title="Click to choose profile picture from gallery"
                  >
                    <Avatar className="w-20 h-20 border-4 border-blue-50 dark:border-slate-800 shadow-md transition-all group-hover:opacity-85">
                      <AvatarImage src={currentUser.avatar} className="object-cover" />
                      <AvatarFallback>{currentUser.name ? currentUser.name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      onChange={handleAvatarFileChange} 
                      className="hidden" 
                    />
                  </div>

                  <h2 className="text-lg font-bold text-blue-950 dark:text-white">{currentUser.name}</h2>
                  <p className="text-xs text-slate-500 mb-2 truncate max-w-[200px] mx-auto">{currentUser.email}</p>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center justify-center gap-1 mx-auto"
                  >
                    <Camera className="w-3 h-3" /> Change Photo from Gallery
                  </button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full rounded-xl border-blue-100 text-blue-600 text-xs font-bold"
                    onClick={() => setActiveTab('settings')}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Desktop Only Sidebar Navigation */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-[32px] p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                <nav className="space-y-2 text-xs">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${
                      activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    My Orders ({safeUserOrders.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${
                      activeTab === 'wishlist' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist ({wishlistedProducts.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${
                      activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-950 dark:text-white">Order History</h2>
                  {safeUserOrders.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-[32px] text-center p-8 sm:p-12 bg-white dark:bg-slate-900">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                      <h3 className="text-lg font-bold text-blue-950 dark:text-white mb-2">No orders placed yet</h3>
                      <p className="text-slate-500 mb-6 text-sm">Explore our menu and place your first fresh seafood order.</p>
                      <Button onClick={() => navigate('/#menu')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        Browse Menu
                      </Button>
                    </Card>
                  ) : (
                    safeUserOrders.map((order: any) => {
                      const displayStatus = getOrderStatus(order);
                      const isDeliveredOrCancelled = displayStatus === 'Delivered' || displayStatus === 'CANCELLED';
                      
                      // Cancel window rule: strictly within 5 minutes (300,000 ms) and not delivered/cancelled
                      const isCancelable = !isDeliveredOrCancelled && ((currentTime - (order?.timestamp || currentTime)) < (5 * 60 * 1000));

                      return (
                        <Card key={order.id} className="border-none shadow-sm rounded-[24px] sm:rounded-[32px] overflow-hidden mb-6 bg-white dark:bg-slate-900">
                          <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-50 dark:border-slate-800">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                <CardTitle className="text-base sm:text-lg font-bold text-blue-950 dark:text-white">{order.id}</CardTitle>
                                <Badge 
                                  variant="secondary"
                                  className={
                                    displayStatus === 'Delivered' 
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] sm:text-xs' 
                                      : displayStatus === 'CANCELLED'
                                      ? 'bg-red-100 text-red-800 border-red-200 text-[10px] sm:text-xs'
                                      : 'bg-blue-100 text-blue-800 border-blue-200 text-[10px] sm:text-xs'
                                  }
                                >
                                  {displayStatus}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                Placed on {safeDateLabel(order?.timestamp)}
                              </p>
                              {order.deliverySlot && (
                                <p className="text-xs font-semibold text-blue-600 mt-1">
                                  📦 Slot: {order.deliverySlot}
                                </p>
                              )}
                              {order.address && (
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 line-clamp-1" title={order.address}>
                                  📍 To: {order.address}
                                </p>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700">
                              <span className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-400">{order.total}</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReorder(order)}
                                  className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-1.5 text-xs font-bold px-3 py-1.5 h-8"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Reorder
                                </Button>

                                {/* Track Order button is hidden for Delivered or Cancelled orders */}
                                {!isDeliveredOrCancelled && (
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/track-order/${order.id}`)}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs font-bold px-3 py-1.5 h-8"
                                  >
                                    <Truck className="w-3.5 h-3.5" /> Track Order
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-6">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {(order.items || []).map((item: any, idx: number) => (
                                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                  <div className="flex items-center gap-3">
                                     <div 
                                       onClick={() => setPreviewImage({ url: getItemImage(item), title: item.name })}
                                       className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer group hover:scale-115 hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all duration-300 relative"
                                       title="Click to view full size image"
                                     >
                                       <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                     </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-blue-950 dark:text-white">{item.name}</h4>
                                      <p className="text-xs text-slate-500">
                                        Qty: {item.quantity} × {item.price}
                                        {item.unitLabel && <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">{item.unitLabel}</span>}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Cancel Order button is ONLY shown within 5 minutes of placement and if NOT delivered/cancelled */}
                            {isCancelable && (
                              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 flex-shrink-0" /> Order can be cancelled within 5 minutes of placement.
                                </p>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => cancelOrder(order.id)}
                                  className="rounded-xl font-bold text-xs shadow-sm w-full sm:w-auto"
                                >
                                  Cancel Order
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-950 dark:text-white">My Saved Seafood Wishlist</h2>
                  {wishlistedProducts.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-[32px] text-center p-12 bg-white dark:bg-slate-900">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-pink-200" />
                      <h3 className="text-lg font-bold text-blue-950 dark:text-white mb-2">Your wishlist is empty</h3>
                      <p className="text-slate-500 mb-6">Save your favorite fresh catch items to order them quickly anytime.</p>
                      <Button onClick={() => navigate('/#menu')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        Explore Seafood
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlistedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <Card className="border-none shadow-sm rounded-[32px] bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold text-blue-950 dark:text-white">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="rounded-xl" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Login Email / Gmail</Label>
                          <Input 
                            id="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="rounded-xl" 
                          />
                          <p className="text-xs text-slate-500">Provide a valid Gmail so the admin can easily identify and contact you.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="rounded-xl" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Default Delivery Area</Label>
                          <Input 
                            id="location" 
                            value={formData.address} 
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="rounded-xl" 
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
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
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Logout Confirmation"
        message="Do you want to logout?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;