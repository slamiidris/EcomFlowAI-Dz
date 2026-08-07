import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
  };
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastHelpers = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers, toasts, removeToast }}>
      {children}
      
      {/* Portaled Container for Toasts (Top Right overlay) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 30, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto w-full"
            >
              <div className="flex items-start gap-3 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/60 dark:border-white/10 shadow-2xl rounded-2xl text-slate-900 dark:text-white transition-all duration-300">
                {/* Visual Icon based on Type */}
                <div className="shrink-0 mt-0.5">
                  {t.type === 'success' && (
                    <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  {t.type === 'info' && (
                    <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400">
                      <Info size={16} />
                    </div>
                  )}
                  {t.type === 'error' && (
                    <div className="p-1 rounded-lg bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>

                {/* Message text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-relaxed tracking-tight text-left">
                    {t.message}
                  </p>
                </div>

                {/* Dismiss X button */}
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
