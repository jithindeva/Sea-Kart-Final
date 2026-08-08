"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Phone, Menu, X, User, LogIn, LogOut, RefreshCw, Download, ChevronDown, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import CartDrawer from './CartDrawer';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const forceAppUpdate = () => {
    if ('caches' in window) {
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const [activeNav, setActiveNav] = useState<'home' | 'menu' | 'about' | 'contact' | 'dashboard'>(() => {
    const p = location.pathname;
    return (p === '/dashboard' || p.startsWith('/track-order')) ? 'dashboard' : 'home';
  });

  const { totalItems } = useCart();
  const { isLoggedIn, logout, user } = useUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const p = location.pathname;
    if (p === '/dashboard' || p.startsWith('/track-order')) {
      setActiveNav('dashboard');
    } else if (p === '/' && activeNav === 'dashboard') {
      setActiveNav('home');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleOpenLogin = () => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsAuthOpen(true);
    };
    window.addEventListener('open-login', handleOpenLogin);
    return () => window.removeEventListener('open-login', handleOpenLogin);
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/');
  };

  const handleLoginClick = () => {
    // Use 'auto' instead of 'smooth' to instantly jump to top before AuthModal locks the scroll
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIsOpen(false);
    setIsAuthOpen(true);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setActiveNav('home');
    if (location.pathname !== '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string, navKey: 'menu' | 'about' | 'contact') => {
    e.preventDefault();
    setIsOpen(false);
    setActiveNav(navKey);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getNavClass = (key: 'home' | 'menu' | 'about' | 'contact' | 'dashboard') => {
    const isSelected = activeNav === key;
    return isSelected
      ? "bg-blue-600 text-white dark:bg-[#111c2e] dark:text-[#60a5fa] font-extrabold px-5 py-2 rounded-full border border-blue-600 dark:border-blue-500/30 shadow-md shadow-blue-500/25 dark:shadow-blue-900/40 transition-all scale-105"
      : "text-slate-700 dark:text-slate-200 font-semibold px-5 py-2 rounded-full hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-slate-800 transition-all";
  };

  return (
    <>
      <nav className="fixed top-8 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-blue-100 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SEA KART</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="/" 
              onClick={handleHomeClick} 
              className={getNavClass('home')}
            >
              Home
            </a>
            <a 
              href="#menu" 
              onClick={(e) => handleScroll(e, '#menu', 'menu')} 
              className={getNavClass('menu')}
            >
              Our Menu
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleScroll(e, '#about', 'about')} 
              className={getNavClass('about')}
            >
              About Us
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleScroll(e, '#contact', 'contact')} 
              className={getNavClass('contact')}
            >
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden border-2 border-blue-400">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user?.name || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user?.name || 'Account'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[99999] animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Profile Header */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-blue-400 shadow-md">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(user?.name || 'U')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        onClick={() => { setIsDropdownOpen(false); setActiveNav('dashboard'); }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        My Dashboard
                      </Link>

                      <button
                        onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-bold mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="ghost" 
                onClick={handleLoginClick}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 gap-2 font-bold rounded-full px-5"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={forceAppUpdate}
              title="Force Refresh App Update"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>

            <ThemeToggle />

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6 text-slate-800 dark:text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-red-500/40 border-2 border-white dark:border-slate-900">
                  {totalItems}
                </span>
              )}
            </Button>
            
            <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-full px-6 shadow-md shadow-blue-500/20 font-bold" asChild>
              <a href="tel:9380382950">
                <Phone className="w-4 h-4" />
                93803 82950
              </a>
            </Button>
            <button className="md:hidden dark:text-white p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 p-4 space-y-3">
            <a href="/" onClick={handleHomeClick} className={`block text-center ${getNavClass('home')}`}>Home</a>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={`block text-center ${getNavClass('dashboard')}`} onClick={() => { setActiveNav('dashboard'); setIsOpen(false); }}>Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-center py-2 text-red-500 font-bold">Logout</button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="w-full text-center py-2 text-blue-600 font-bold"
              >
                Login
              </button>
            )}
            <a href="#menu" onClick={(e) => handleScroll(e, '#menu', 'menu')} className={`block text-center ${getNavClass('menu')}`}>Our Menu</a>
            <a href="#about" onClick={(e) => handleScroll(e, '#about', 'about')} className={`block text-center ${getNavClass('about')}`}>About Us</a>
            <a href="#contact" onClick={(e) => handleScroll(e, '#contact', 'contact')} className={`block text-center ${getNavClass('contact')}`}>Contact</a>
            
            {typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard') && !window.matchMedia('(display-mode: standalone)').matches && localStorage.getItem('sk_pwa_installed') !== 'true' && (
              <Button 
                onClick={() => {
                  const promptEvent = (window as any).deferredPwaPrompt;
                  if (promptEvent) {
                    promptEvent.prompt();
                  } else {
                    alert('📲 To Install SeaKart App:\n\n• Android (Chrome): Tap 3 dots ⋮ at top right → Tap "Add to Home screen" or "Install App".\n• iPhone (Safari): Tap Share button → Tap "Add to Home Screen".');
                  }
                }} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-full font-bold flex items-center justify-center shadow-md shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                📲 Install SeaKart App
              </Button>
            )}

            <Button 
              onClick={forceAppUpdate} 
              variant="outline" 
              className="w-full text-blue-600 border-blue-200 gap-2 rounded-full font-bold flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              ⚡ Force Refresh App Update
            </Button>

            <Button className="w-full bg-blue-600 text-white gap-2 rounded-full font-bold mt-2" asChild>
              <a href="tel:9380382950">
                <Phone className="w-4 h-4" />
                93803 82950
              </a>
            </Button>
          </div>
        )}
      </nav>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Logout Confirmation"
        message="Do you want to logout?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Navbar;