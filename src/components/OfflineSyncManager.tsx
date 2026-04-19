"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineSyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // When connection is restored, trigger "Offline Sync"
      performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncComplete(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const performSync = async () => {
    setIsSyncing(true);
    
    // Simulate background sync of offline actions (e.g., queuing analytics, saving crystals to remote database, refreshing AI cache)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    // Here logic would fire to dispatch any queued Workbox Background Sync tasks
    // if implemented strictly with Workbox background sync queue.
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((swRegistration) => {
        try {
           // Type cast to ignore TS error for non-standard SyncManager
          (swRegistration as any).sync?.register("lumiu-offline-sync");
        } catch (err) {
          console.error("Background Sync failed:", err);
        }
      });
    }

    setIsSyncing(false);
    setSyncComplete(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setSyncComplete(false);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 relative">
             <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-ping opacity-50" />
             <WifiOff size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">Offline Mode Active</span>
            <span className="text-[10px] text-rose-300/80 font-medium uppercase tracking-widest leading-tight">Actions will sync later</span>
          </div>
        </motion.div>
      )}

      {isOnline && isSyncing && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl"
        >
          <RefreshCw size={18} className="text-indigo-400 animate-spin" />
          <span className="text-sm font-bold text-white">Synchronizing offline data...</span>
        </motion.div>
      )}

      {isOnline && syncComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl"
        >
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">Offline sync complete</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
