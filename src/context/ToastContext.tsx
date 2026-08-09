import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
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

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    accent: 'bg-dz-emerald',
    iconBg: 'bg-dz-emerald/10',
    iconColor: 'text-dz-emerald',
    progressColor: 'bg-dz-emerald',
  },
  info: {
    icon: Info,
    accent: 'bg-sky-500',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
    progressColor: 'bg-sky-500',
  },
  error: {
    icon: AlertCircle,
    accent: 'bg-rose-500',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    progressColor: 'bg-rose-500',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;
  const [isHovered, setIsHovered] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0]);
  const startTime = useRef(Date.now());
  const remainingRef = useRef(toast.duration);

  // Pause on hover, resume on leave
  useEffect(() => {
    if (isHovered) {
      remainingRef.current -= Date.now() - startTime.current;
      return;
    }
    startTime.current = Date.now();
    const remaining = remainingRef.current;
    if (remaining <= 0) return;

    const timer = setTimeout(() => onRemove(toast.id), remaining);
    return () => clearTimeout(timer);
  }, [isHovered, toast.id, onRemove]);

  // Progress bar animation
  useEffect(() => {
    if (isHovered || toast.duration <= 0) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime.current);
    }, 50);
    return () => clearInterval(interval);
  }, [isHovered, toast.duration]);

  const progress = toast.duration > 0
    ? Math.max(0, 1 - elapsed / remainingRef.current)
    : 1;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 500) {
      onRemove(toast.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 120 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="pointer-events-auto w-full cursor-grab active:cursor-grabbing"
    >
      <div className={cn(
        'relative flex items-start gap-3 p-4 pr-3 rounded-2xl border overflow-hidden',
        'bg-white dark:bg-[#141418] dark:border-white/[0.08]',
        'shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
        'backdrop-blur-xl'
      )}>
        {/* Left accent bar */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl', config.accent)} />

        {/* Icon */}
        <div className={cn('shrink-0 w-8 h-8 rounded-xl flex items-center justify-center', config.iconBg)}>
          <Icon size={16} className={config.iconColor} />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[13px] font-medium text-white/90 dark:text-white/90 leading-snug">
            {toast.message}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
        >
          <X size={12} />
        </button>

        {/* Progress bar */}
        {toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
            <motion.div
              className={cn('h-full rounded-full', config.progressColor)}
              initial={{ width: '100%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
              style={{ opacity: 0.6 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type, duration, createdAt: Date.now() };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const toastHelpers = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers, toasts, removeToast }}>
      {children}

      {/* Toast container — top right, max 3 visible */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-full max-w-[380px] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.slice(-3).map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
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
