import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Section card used by every admin tab. */
export function AdminCard({ title, icon: Icon, action, children, className }: {
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('surface-card p-5 sm:p-6', className)}>
      {(title || action) && (
        <div className="flex items-center gap-2 mb-5">
          {Icon && <Icon size={18} className="text-dz-emerald" />}
          {title && <h2 className="font-display font-semibold text-lg text-white">{title}</h2>}
          {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Small label + value stat used in the overview. */
export function StatCard({ label, value, icon: Icon, color = 'text-dz-emerald' }: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Icon size={18} className={color} />
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase text-white/35">{label}</p>
          <p className="font-display text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

/** Pill toggle. */
export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
        checked ? 'bg-dz-emerald' : 'bg-white/10 border border-white/10'
      )}
      role="switch"
      aria-checked={checked}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
        checked ? 'left-[22px]' : 'left-0.5'
      )} />
    </button>
  );
}

/** Modal wrapper with the app's dark aesthetic. */
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-10 sm:pt-16 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 14 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 14 }}
            className={cn('w-full surface-card rounded-3xl p-6 relative mb-10', wide ? 'max-w-3xl' : 'max-w-lg')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-white">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Label + input helper. */
export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-[11px] text-white/25 mt-1 block">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-dz-emerald/70 focus:ring-4 focus:ring-dz-emerald/10 transition-all';

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="py-12 text-center">
      <Icon size={24} className="mx-auto text-white/20 mb-3" />
      <p className="text-sm text-white/40">{title}</p>
      {hint && <p className="text-[12px] text-white/25 mt-1">{hint}</p>}
    </div>
  );
}

export function LoadingBlock({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="py-14 text-center">
      <Loader2 size={24} className="mx-auto text-white/25 animate-spin mb-3" />
      <p className="text-[12px] text-white/30">{label}</p>
    </div>
  );
}

/** Badge colors for plan status. */
export function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    active: 'bg-dz-emerald/15 text-dz-emerald border-dz-emerald/30',
    pending: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
    expired: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };
  const label = status === 'active' ? 'Actif' : status === 'pending' ? 'En attente' : 'Aucun';
  return (
    <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full border', map[status || ''] || 'bg-white/[0.05] text-white/40 border-white/10')}>
      {label}
    </span>
  );
}
