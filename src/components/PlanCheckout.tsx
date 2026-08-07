import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Mail, Send, Loader2, BadgeCheck, Crown } from 'lucide-react';
import { useAuth, PlanId } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export interface PlanOption {
  id: PlanId;
  label: string;
  tagline: string;
  price: string;
  note: string;
  per: string;
  popular?: boolean;
  accent?: string;
}

export const PLANS: PlanOption[] = [
  { id: 'monthly', label: '1 Mois', tagline: 'Pour tester', price: '1 500', note: 'DA / mois', per: '30 jours d\'accès', accent: 'from-dz-emerald/25 to-transparent border-dz-emerald/40' },
  { id: 'quarterly', label: '3 Mois', tagline: 'Le plus choisi', price: '3 500', note: 'DA / 3 mois', per: '90 jours d\'accès', popular: true, accent: 'from-dz-gold/25 to-transparent border-dz-gold/50' },
  { id: 'lifetime', label: 'À Vie', tagline: 'Paiement unique', price: '15 000', note: 'DA une fois', per: 'Accès illimité à vie', accent: 'from-dz-dinar/25 to-transparent border-dz-dinar/50' },
];

const PLAN_EMOJI: Record<PlanId, string> = { monthly: '⚡', quarterly: '🔥', lifetime: '👑' };

interface PlanCheckoutProps {
  open: boolean;
  initialPlan?: PlanId | null;
  onClose: () => void;
}

export default function PlanCheckout({ open, initialPlan = null, onClose }: PlanCheckoutProps) {
  const toast = useToast();
  const { user, selectPlan, refresh } = useAuth();
  const [selected, setSelected] = useState<PlanId | null>(initialPlan);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@dzads.ai');
  const [adminTelegram, setAdminTelegram] = useState('DzAdsAdmin');

  useEffect(() => {
    if (open) {
      setSelected(initialPlan);
      setSent(false);
      fetch('/api/config')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            setAdminEmail(d.adminEmail);
            setAdminTelegram(d.adminTelegram);
          }
        })
        .catch(() => {});
    }
  }, [open, initialPlan]);

  const plan = PLANS.find((p) => p.id === selected) || null;

  const handleConfirmSent = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await selectPlan(selected);
      setSent(true);
      toast.success('Paiement enregistré — en attente de vérification par l\'admin. ✅');
    } catch (err: any) {
      toast.error(err?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoHref = plan
    ? `mailto:${adminEmail}?subject=${encodeURIComponent(`Facture paiement — Plan ${plan.label} (${plan.price} DA)`)}&body=${encodeURIComponent(
        `Bonjour,\n\nJe viens de régler le plan ${plan.label} (${plan.price} DA).\nVoici ma facture en pièce jointe.\n\nCompte : ${user?.email || ''}\nMerci de confirmer mon accès.`
      )}`
    : '#';

  const telegramHref = `https://t.me/${adminTelegram}`;

  // Active subscription — nothing to buy
  if (user?.planStatus === 'active' && user?.plan) {
    const active = PLANS.find((p) => p.id === user.plan);
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="w-full max-w-md glass-panel-heavy rounded-3xl p-8 text-center"
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fermer">
                <X size={18} />
              </button>
              <div className="mx-auto w-14 h-14 rounded-2xl bg-dz-emerald/15 border border-dz-emerald/40 flex items-center justify-center mb-4">
                <BadgeCheck size={28} className="text-dz-emerald" />
              </div>
              <h3 className="font-display text-xl font-bold mb-1">Plan actif</h3>
              <p className="text-white/50 text-sm mb-4">Votre abonnement est en cours.</p>
              <div className="glass-card p-4 border-dz-emerald/30">
                <div className="flex items-center justify-center gap-2 font-display font-bold text-lg">
                  <span>{PLAN_EMOJI[user.plan]}</span>
                  <span className="text-dz-emerald">{active?.label}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-mono">
                  {user.planExpiresAt
                    ? `Expire le ${new Date(user.planExpiresAt).toLocaleDateString('fr-FR')}`
                    : 'Accès à vie'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg my-8"
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-panel-heavy rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-2xl font-bold">
                  {sent ? 'En attente de vérification' : user?.planStatus === 'pending' ? 'Paiement en cours' : 'Choisir un plan'}
                </h3>
                <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>

              {/* Pending state */}
              {sent || user?.planStatus === 'pending' ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-dz-gold/15 border border-dz-gold/40 flex items-center justify-center mb-4">
                    <Crown size={26} className="text-dz-gold" />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Votre paiement est <span className="text-dz-gold font-semibold">en attente de vérification</span>.
                    Envoyez votre facture (PDF ou photo) à l'admin pour activer votre accès :
                  </p>
                  <div className="flex flex-col gap-2.5 mt-5">
                    <a
                      href={mailtoHref}
                      className="flex items-center justify-center gap-2 rounded-xl bg-dz-emerald/10 border border-dz-emerald/40 text-dz-emerald px-4 py-2.5 text-sm font-semibold hover:bg-dz-emerald/20 transition-colors"
                    >
                      <Mail size={16} /> Envoyer la facture par Email
                    </a>
                    <a
                      href={telegramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/15 text-white/80 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                      <Send size={16} /> Envoyer via Telegram
                    </a>
                  </div>
                  <p className="text-[10px] font-mono text-white/30 mt-4 uppercase tracking-widest">
                    {adminEmail} · t.me/{adminTelegram}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-white/50 text-sm mb-5">
                    Règlement en DZD par virement. Envoyez la facture à l'admin pour activer votre accès.
                  </p>

                  {/* Plan selector */}
                  <div className="grid gap-3 sm:grid-cols-3 mb-6">
                    {PLANS.map((p) => {
                      const isSel = selected === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelected(p.id)}
                          className={cn(
                            'relative rounded-2xl border p-4 text-left transition-all cursor-pointer',
                            'bg-linear-to-b hover:scale-[1.02] active:scale-[0.98]',
                            p.accent,
                            isSel
                              ? 'border-white/40 shadow-[0_0_24px_rgba(0,242,254,0.15)]'
                              : 'opacity-75 hover:opacity-100'
                          )}
                        >
                          {p.popular && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest bg-dz-gold text-white px-2 py-0.5 rounded-full">
                              Populaire
                            </span>
                          )}
                          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{p.tagline}</p>
                          <p className="font-display text-lg font-bold mt-1">{PLAN_EMOJI[p.id]} {p.label}</p>
                          <p className="font-display font-bold text-xl text-dz-dinar mt-1.5">
                            {p.price} <span className="text-[10px] text-white/40 font-sans">DA</span>
                          </p>
                          <p className="text-[10px] text-white/40">{p.note}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className={cn('w-3.5 h-3.5 rounded-full border flex items-center justify-center', isSel ? 'bg-dz-emerald border-dz-emerald' : 'border-white/30')}>
                              {isSel && <Check size={9} className="text-black" strokeWidth={4} />}
                            </span>
                            <span className="text-[10px] text-white/60">{p.per}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {plan ? (
                    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Montant à régler</span>
                        <span className="font-display font-bold text-2xl text-dz-dinar">{plan.price} DA</span>
                      </div>
                      <ol className="space-y-1.5 text-[12.5px] text-white/55 list-decimal list-inside">
                        <li>Effectuez le virement du montant ci-dessus (référence : votre email).</li>
                        <li>Envoyez la facture (PDF / photo) à l'admin via Email ou Telegram.</li>
                        <li>L'admin confirme manuellement — votre accès s'active.</li>
                      </ol>
                    </div>
                  ) : (
                    <p className="text-center text-white/40 text-xs mb-5">Sélectionnez un plan pour voir les instructions de paiement.</p>
                  )}

                  <button
                    type="button"
                    disabled={!plan || submitting}
                    onClick={handleConfirmSent}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all',
                      plan
                        ? 'bg-linear-to-r from-dz-emerald to-dz-gold text-black hover:opacity-90 active:scale-[0.99]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    )}
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    J'ai effectué le paiement & envoyé la preuve
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
