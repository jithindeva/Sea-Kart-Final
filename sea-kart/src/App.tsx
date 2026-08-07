import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import TopBanner from "./components/TopBanner";
import UpdateNotification from "./components/UpdateNotification";

import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "DEMO_GOOGLE_CLIENT_ID";

// Helper component to reset to home page on fresh app open
const AppSessionManager = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const APP_VERSION = '2.0.3-gmail-passwordless';
    if (localStorage.getItem('sk_react_app_version') !== APP_VERSION) {
      localStorage.setItem('sk_react_app_version', APP_VERSION);
      if ('caches' in window) {
        caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
      }
      window.location.reload();
      return;
    }

    const isNewSession = !sessionStorage.getItem('seakart_active_session');
    if (isNewSession) {
      sessionStorage.setItem('seakart_active_session', 'true');
      if (location.pathname !== '/' && !location.pathname.startsWith('/admin')) {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return null;
};

const App = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <ThemeProvider defaultTheme="dark" storageKey="sea-kart-theme">
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-center" />
              <UpdateNotification />
              <BrowserRouter>
                <AppSessionManager />
                <TopBanner />
                <div className="pt-8 min-h-screen bg-animated-mesh">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/track-order/:orderId" element={<TrackOrder />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/*" element={<AdminPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);

export default App;