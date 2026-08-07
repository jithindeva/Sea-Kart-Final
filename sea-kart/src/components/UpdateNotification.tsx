import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBtn) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-blue-400/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white animate-bounce" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Install SeaKart App</h4>
          <p className="text-xs text-blue-100">Add app shortcut to phone home screen</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowInstallBtn(false)} className="text-blue-200 text-xs px-2 py-1 hover:text-white">Close</button>
        <button onClick={handleInstall} className="bg-white hover:bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all">Install Now</button>
      </div>
    </div>
  );
};

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleRegistration = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        handleRegistration(reg);
        reg.update().catch(() => {});
        
        const intervalId = setInterval(() => {
          reg.update().catch(() => {});
        }, 10000);

        return () => clearInterval(intervalId);
      }
    });

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
    <>
      <PWAInstallPrompt />
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
    </>
  );
};

export default UpdateNotification;
