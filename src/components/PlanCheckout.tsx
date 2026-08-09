import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Mail, Send, Loader2, BadgeCheck, Crown, CreditCard, Building2, Upload, FileImage, FileText, ArrowRight, ArrowLeft, Copy, CheckCircle2, MessageCircle } from 'lucide-react';
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

type PaymentMethod = 'redotpay' | 'baridimob' | null;
type Step = 'plan' | 'method' | 'payment' | 'done';

interface PlanCheckoutProps {
  open: boolean;
  initialPlan?: PlanId | null;
  onClose: () => void;
}

// Baridimob bank info
const BARIDIMOB_INFO = {
  iban: 'DZ23 0079 9999 9091 2345 6789 01',
  bic: 'BARBDZDZ',
  bank: 'Barid Bank',
  name: 'DZAds AI SARL',
  idNumber: '1999999999999999',
};

export default function PlanCheckout({ open, initialPlan = null, onClose }: PlanCheckoutProps) {
  const toast = useToast();
  const { user, selectPlan } = useAuth();
  const [step, setStep] = useState<Step>('plan');
  const [selected, setSelected] = useState<PlanId | null>(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('admin@dzads.ai');
  const [adminTelegram, setAdminTelegram] = useState('DzAdsAdmin');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelected(initialPlan);
      setStep(initialPlan ? 'method' : 'plan');
      setPaymentMethod(null);
      setProofFile(null);
      setProofPreview(null);
      setCopied(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 Mo).');
      return;
    }
    setProofFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selected || !paymentMethod) return;
    setSubmitting(true);
    try {
      // Convert file to base64 if present
      let proofBase64: string | null = null;
      if (proofFile) {
        proofBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(proofFile);
        });
      }

      await selectPlan(selected);

      // Store payment proof via API
      await fetch('/api/user/payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: proofBase64, method: paymentMethod }),
      });

      setStep('done');
      toast.success('Paiement enregistré — en attente de vérification. ✅');
    } catch (err: any) {
      toast.error(err?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Active subscription
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
              className="w-full max-w-md surface-card rounded-3xl p-8 text-center"
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
              <div className="surface-card p-4 border-dz-emerald/30">
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
            <div className="surface-card rounded-3xl p-6 sm:p-8 relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fermer">
                <X size={18} />
              </button>

              {/* Step indicator */}
              {step !== 'done' && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {(['plan', 'method', 'payment'] as Step[]).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                        (step === 'plan' && i === 0) || (step === 'method' && i <= 1) || (step === 'payment' && i <= 2)
                          ? 'bg-dz-emerald text-black'
                          : i < ['plan', 'method', 'payment'].indexOf(step)
                            ? 'bg-dz-emerald/20 text-dz-emerald'
                            : 'bg-white/5 text-white/25 border border-white/10'
                      )}>
                        {i < ['plan', 'method', 'payment'].indexOf(step) ? '✓' : i + 1}
                      </div>
                      {i < 2 && <div className={cn('w-8 h-px', i < ['plan', 'method', 'payment'].indexOf(step) ? 'bg-dz-emerald/40' : 'bg-white/10')} />}
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* STEP 1: Select Plan */}
                {step === 'plan' && (
                  <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-display text-xl font-bold mb-1">Choisir un plan</h3>
                    <p className="text-white/45 text-sm mb-5">Sélectionne l'offre qui te convient.</p>

                    <div className="grid gap-3 sm:grid-cols-3 mb-5">
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
                              isSel ? 'border-white/40' : 'opacity-75 hover:opacity-100'
                            )}
                          >
                            {p.popular && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest bg-dz-gold text-black px-2 py-0.5 rounded-full">
                                Populaire
                              </span>
                            )}
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{p.tagline}</p>
                            <p className="font-display text-lg font-bold mt-1">{PLAN_EMOJI[p.id]} {p.label}</p>
                            <p className="font-display font-bold text-xl text-dz-dinar mt-1.5">
                              {p.price} <span className="text-[10px] text-white/40 font-sans">DA</span>
                            </p>
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

                    <button
                      type="button"
                      disabled={!selected}
                      onClick={() => setStep('method')}
                      className="btn-dz-primary w-full disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Continuer <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: Choose Payment Method */}
                {step === 'method' && (
                  <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setStep('plan')} className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer">
                        <ArrowLeft size={16} />
                      </button>
                      <h3 className="font-display text-xl font-bold">Mode de paiement</h3>
                    </div>
                    <p className="text-white/45 text-sm mb-5 ml-7">
                      Plan <span className="text-dz-dinar font-semibold">{plan?.label}</span> — {plan?.price} DA
                    </p>

                    <div className="space-y-3 mb-5">
                      {/* RedotPay */}
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('redotpay'); setStep('payment'); }}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left',
                          paymentMethod === 'redotpay'
                            ? 'bg-dz-emerald/5 border-dz-emerald/40'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl bg-dz-emerald/10 border border-dz-emerald/20 flex items-center justify-center shrink-0">
                          <CreditCard size={22} className="text-dz-emerald" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-semibold text-[15px] text-white">RedotPay</p>
                          <p className="text-[12px] text-white/40 mt-0.5">Paiement en ligne rapide et sécurisé</p>
                        </div>
                        <ArrowRight size={16} className="text-white/20" />
                      </button>

                      {/* Baridimob */}
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('baridimob'); setStep('payment'); }}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left',
                          paymentMethod === 'baridimob'
                            ? 'bg-dz-emerald/5 border-dz-emerald/40'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl bg-dz-gold/10 border border-dz-gold/20 flex items-center justify-center shrink-0">
                          <Building2 size={22} className="text-dz-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-semibold text-[15px] text-white">BaridiMob</p>
                          <p className="text-[12px] text-white/40 mt-0.5">Virement bancaire via BaridiMob / CCP</p>
                        </div>
                        <ArrowRight size={16} className="text-white/20" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Payment + Upload Proof */}
                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setStep('method')} className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer">
                        <ArrowLeft size={16} />
                      </button>
                      <h3 className="font-display text-xl font-bold">
                        {paymentMethod === 'redotpay' ? 'Paiement RedotPay' : 'Virement BaridiMob'}
                      </h3>
                    </div>
                    <p className="text-white/45 text-sm mb-5 ml-7">
                      Plan <span className="text-dz-dinar font-semibold">{plan?.label}</span> — <span className="text-dz-dinar font-bold">{plan?.price} DA</span>
                    </p>

                    {paymentMethod === 'redotpay' ? (
                      /* RedotPay Instructions */
                      <div className="space-y-4 mb-5">
                        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                          <p className="text-[11px] font-mono uppercase tracking-wider text-white/35 mb-3">Instructions de paiement</p>
                          <ol className="space-y-2 text-[13px] text-white/60 list-decimal list-inside">
                            <li>Ouvre l'application <span className="text-white font-semibold">RedotPay</span></li>
                            <li>Choisis <span className="text-white font-semibold">Envoyer</span> ou <span className="text-white font-semibold">Pay</span></li>
                            <li>Envoie <span className="text-dz-dinar font-bold">{plan?.price} DA</span> à :</li>
                          </ol>
                          <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
                            <span className="font-mono text-sm text-white">{adminEmail}</span>
                            <button onClick={() => handleCopy(adminEmail, 'email')} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                              {copied === 'email' ? <CheckCircle2 size={14} className="text-dz-emerald" /> : <Copy size={14} className="text-white/30" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-white/30 mt-2">En objet : <span className="text-white/50">Ton email + "Plan {plan?.label}"</span></p>
                        </div>
                      </div>
                    ) : (
                      /* Baridimob Instructions */
                      <div className="space-y-4 mb-5">
                        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                          <p className="text-[11px] font-mono uppercase tracking-wider text-white/35 mb-3">Informations bancaires</p>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                              <div>
                                <p className="text-[10px] text-white/30 uppercase">Bénéficiaire</p>
                                <p className="text-sm text-white font-semibold mt-0.5">{BARIDIMOB_INFO.name}</p>
                              </div>
                              <button onClick={() => handleCopy(BARIDIMOB_INFO.name, 'name')} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                {copied === 'name' ? <CheckCircle2 size={14} className="text-dz-emerald" /> : <Copy size={14} className="text-white/30" />}
                              </button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                              <div>
                                <p className="text-[10px] text-white/30 uppercase">IBAN</p>
                                <p className="text-sm text-white font-mono mt-0.5">{BARIDIMOB_INFO.iban}</p>
                              </div>
                              <button onClick={() => handleCopy(BARIDIMOB_INFO.iban, 'iban')} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                {copied === 'iban' ? <CheckCircle2 size={14} className="text-dz-emerald" /> : <Copy size={14} className="text-white/30" />}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <p className="text-[10px] text-white/30 uppercase">BIC/SWIFT</p>
                                <p className="text-sm text-white font-mono mt-0.5">{BARIDIMOB_INFO.bic}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <p className="text-[10px] text-white/30 uppercase">N° Identifiant</p>
                                <p className="text-sm text-white font-mono mt-0.5">{BARIDIMOB_INFO.idNumber}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                              <div>
                                <p className="text-[10px] text-white/30 uppercase">Montant</p>
                                <p className="text-lg text-dz-dinar font-bold font-display mt-0.5">{plan?.price} DA</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-white/30 mt-3">
                            <span className="text-white/50">Référence :</span> Envoie ton email dans le motif du virement.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Upload Proof */}
                    <div className="mb-5">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-white/35 mb-3">Preuve de paiement</p>

                      {proofFile ? (
                        <div className="rounded-2xl bg-white/[0.03] border border-dz-emerald/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-dz-emerald/10 flex items-center justify-center shrink-0">
                              {proofFile.type.startsWith('image/') ? (
                                <FileImage size={18} className="text-dz-emerald" />
                              ) : (
                                <FileText size={18} className="text-dz-emerald" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-white font-medium truncate">{proofFile.name}</p>
                              <p className="text-[11px] text-white/35">{(proofFile.size / 1024).toFixed(0)} Ko</p>
                            </div>
                            <button
                              onClick={() => { setProofFile(null); setProofPreview(null); }}
                              className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {proofPreview && (
                            <img src={proofPreview} alt="Aperçu" className="mt-3 rounded-xl max-h-40 w-full object-cover border border-white/[0.06]" />
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-dz-emerald/30 p-6 flex flex-col items-center gap-2 transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:border-dz-emerald/30 transition-colors">
                            <Upload size={18} className="text-white/30 group-hover:text-dz-emerald transition-colors" />
                          </div>
                          <p className="text-[13px] text-white/45 group-hover:text-white/60 transition-colors">
                            Clique pour uploader ta preuve
                          </p>
                          <p className="text-[11px] text-white/25">PDF ou image · max 10 Mo</p>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitPayment}
                      className="btn-dz-primary w-full disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {submitting ? 'Envoi en cours...' : "J'ai effectué le paiement"}
                    </button>
                  </motion.div>
                )}

                {/* STEP 4: Done — Send proof via WhatsApp / Gmail / Telegram */}
                {step === 'done' && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-dz-gold/15 border border-dz-gold/40 flex items-center justify-center mb-4">
                      <Crown size={26} className="text-dz-gold" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">Merci ! 🎉</h3>
                    <p className="text-white/55 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                      Ton paiement est <span className="text-dz-gold font-semibold">en attente de vérification</span>.
                      Envoie ta preuve via l'un de ces canaux :
                    </p>

                    {/* 3 channels to send proof */}
                    <div className="space-y-2.5">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/213555000000?text=${encodeURIComponent(`Bonjour, je viens de payer le plan ${plan?.label} (${plan?.price} DA) via ${paymentMethod === 'redotpay' ? 'RedotPay' : 'BaridiMob'}.\n\nMon compte : ${user?.email || ''}\nMerci de confirmer mon accès.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 px-4 py-3 text-left hover:bg-[#25D366]/20 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0">
                          <MessageCircle size={18} className="text-[#25D366]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-white">WhatsApp</p>
                          <p className="text-[11px] text-white/40">Envoie la preuve directement</p>
                        </div>
                        <ArrowRight size={14} className="text-white/20" />
                      </a>

                      {/* Gmail */}
                      <a
                        href={`mailto:${adminEmail}?subject=${encodeURIComponent(`Preuve paiement — Plan ${plan?.label}`)}&body=${encodeURIComponent(`Bonjour,\n\nJe viens de payer le plan ${plan?.label} (${plan?.price} DA) via ${paymentMethod === 'redotpay' ? 'RedotPay' : 'BaridiMob'}.\n\nMon compte : ${user?.email || ''}\nMerci de confirmer mon accès.`)}`}
                        className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-left hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#EA4335]/10 flex items-center justify-center shrink-0">
                          <Mail size={18} className="text-[#EA4335]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-white">Gmail</p>
                          <p className="text-[11px] text-white/40">{adminEmail}</p>
                        </div>
                        <ArrowRight size={14} className="text-white/20" />
                      </a>

                      {/* Telegram */}
                      <a
                        href={`https://t.me/${adminTelegram}?text=${encodeURIComponent(`Bonjour, je viens de payer le plan ${plan?.label} (${plan?.price} DA) via ${paymentMethod === 'redotpay' ? 'RedotPay' : 'BaridiMob'}.\n\nMon compte : ${user?.email || ''}\nMerci de confirmer mon accès.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl bg-[#0088CC]/10 border border-[#0088CC]/30 px-4 py-3 text-left hover:bg-[#0088CC]/20 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#0088CC]/15 flex items-center justify-center shrink-0">
                          <Send size={18} className="text-[#0088CC]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-white">Telegram</p>
                          <p className="text-[11px] text-white/40">@{adminTelegram}</p>
                        </div>
                        <ArrowRight size={14} className="text-white/20" />
                      </a>
                    </div>

                    <p className="text-[10px] text-white/25 mt-4 font-mono">
                      Joins la preuve de paiement (photo / PDF) dans ton message.
                    </p>

                    <button onClick={onClose} className="mt-4 text-[12px] text-white/30 hover:text-white/50 transition-colors cursor-pointer">
                      Fermer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
