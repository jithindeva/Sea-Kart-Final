import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import TopBanner from "./components/TopBanner";

import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="sea-kart-theme">
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
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
);

export default App;