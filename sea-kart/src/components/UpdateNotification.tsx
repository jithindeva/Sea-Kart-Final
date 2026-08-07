import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleRegistration = (reg: ServiceWorkerRegistration) => {
      // Check if there is already a waiting service worker
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowUpdate(true);
      }

      // Listen for new service worker installation
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowUpdate(true);
          }
        });
      });
    };

    // Check existing registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        handleRegistration(reg);
        // Periodically check for new updates on server every 60 seconds
        const intervalId = setInterval(() => {
          reg.update().catch(() => {});
        }, 60000);

        return () => clearInterval(intervalId);
      }
    });

    // Listen for controller changes (after update)
    let refreshing = false;
    const onControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-[9999] bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-2xl border border-blue-500/40 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 text-blue-400 animate-pulse">
                <Sparkles className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  New Version Available! 🚀
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  A new update with features & improvements is ready for SeaKart.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpdate(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <button
              onClick={() => setShowUpdate(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
