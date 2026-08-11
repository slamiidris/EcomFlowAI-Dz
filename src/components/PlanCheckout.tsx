import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Send, Loader2, BadgeCheck, CreditCard, Upload, FileImage, FileText, ArrowRight, ArrowLeft, Copy, CheckCircle2, MessageCircle, Hourglass } from 'lucide-react';
import { useAuth, PlanId } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useCountdown } from '../lib/countdown';
import { useToast } from '../context/ToastContext';
import { contentApi, type PaymentMethod } from '../services/admin';
import { PLAN_EMOJI, buildPlans, usePricing } from '../lib/pricing';

type Step = 'plan' | 'method' | 'payment' | 'done';

interface PlanCheckoutProps {
  open: boolean;
  initialPlan?: PlanId | null;
  onClose: () => void;
}

export default function PlanCheckout({ open, initialPlan = null, onClose }: PlanCheckoutProps) {
  const toast = useToast();
  const { user, selectPlan } = useAuth();
  // Live countdown for an active subscription (ticks every second).
  const planCountdown = useCountdown(user?.planExpiresAt ? new Date(user.planExpiresAt).getTime() : null);
  const [step, setStep] = useState<Step>('plan');
  const [selected, setSelected] = useState<PlanId | null>(initialPlan);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('admin@dzads.ai');
  const [adminTelegram, setAdminTelegram] = useState('DzAdsAdmin');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prices + currency come from the server (admin-editable PlatformConfig).
  const pricing = usePricing();
  const plans = useMemo(() => buildPlans(pricing), [pricing]);

  useEffect(() => {
    if (open) {
      setSelected(initialPlan);
      setStep(initialPlan ? 'method' : 'plan');
      setSelectedMethod(null);
      setProofFile(null);
      setProofPreview(null);
      setCopied(null);
      // Load admin contacts
      fetch('/api/config')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            setAdminEmail(d.adminEmail);
            setAdminTelegram(d.adminTelegram);
            setWhatsappNumber(d.whatsappNumber || '');
          }
        })
        .catch(() => {});
      // Load DB-backed payment methods
      setMethodsLoading(true);
      contentApi
        .paymentMethods()
        .then((ms) => setPaymentMethods(ms))
        .catch(() => setPaymentMethods([]))
        .finally(() => setMethodsLoading(false));
    }
  }, [open, initialPlan]);

  const plan = plans.find((p) => p.id === selected) || null;
  const methodName = selectedMethod?.name || 'Paiement';
  const methodTarget = selectedMethod?.details?.target || adminEmail;

  const fillInstructions = (stepText: string) =>
    stepText
      .replace('{amount}', plan?.price || '')
      .replace('{target}', methodTarget)
      .replace('{plan}', plan?.label || '');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5 Mo).');
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
    if (!selected || !selectedMethod) return;
    // Proof is mandatory — without it the admin has nothing to verify.
    if (!proofFile) {
      toast.error('Veuillez joindre une preuve de paiement.');
      return;
    }
    setSubmitting(true);
    try {
      const proofBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(proofFile);
      });

      await selectPlan(selected);

      // Store payment proof via API — surface any failure so the user can retry.
      const res = await fetch('/api/user/payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: proofBase64, method: selectedMethod.code }),
      });
      if (!res.ok) {
        let message = "Impossible d'envoyer la preuve. Réessaie.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch { /* ignore */ }
        throw new Error(message);
      }

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
    const active = plans.find((p) => p.id === user.plan);
    // Admin-granted custom plans aren't in the static plans list — label them from planDays.
    const planLabel = active?.label || (user.planDays ? `${user.planDays} jours` : 'Plan personnalisé');
    const planEmoji = active ? PLAN_EMOJI[user.plan] : '🎟️';
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
                  <span>{planEmoji}</span>
                  <span className="text-dz-emerald">{planLabel}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-mono">
                  {user.planExpiresAt
                    ? `Expire le ${new Date(user.planExpiresAt).toLocaleDateString('fr-FR')}`
                    : 'Accès à vie'}
                </p>
                {user.planExpiresAt && !planCountdown.expired && (
                  <p className="font-mono text-lg font-bold text-dz-emerald tabular-nums mt-2">
                    {planCountdown.days}j {String(planCountdown.hours).padStart(2, '0')}h {String(planCountdown.minutes).padStart(2, '0')}min {String(planCountdown.seconds).padStart(2, '0')}s
                  </p>
                )}
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
                      {plans.map((p) => {
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
                              {p.price}
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
                      Plan <span className="text-dz-dinar font-semibold">{plan?.label}</span> — {plan?.price}
                    </p>

                    {methodsLoading ? (
                      <div className="py-10 text-center"><Loader2 size={22} className="mx-auto text-white/25 animate-spin" /></div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="py-10 text-center">
                        <CreditCard size={22} className="mx-auto text-white/20 mb-2" />
                        <p className="text-[13px] text-white/40">Aucune méthode de paiement disponible pour le moment.</p>
                        <p className="text-[11px] text-white/25 mt-1">Contacte-nous sur {adminEmail} pour finaliser.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-5">
                        {paymentMethods.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => { setSelectedMethod(m); setStep('payment'); }}
                            className={cn(
                              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left',
                              selectedMethod?.id === m.id
                                ? 'bg-dz-emerald/5 border-dz-emerald/40'
                                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                            )}
                          >
                            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-2xl shrink-0">
                              {m.emoji || '💳'}
                            </div>
                            <div className="flex-1">
                              <p className="font-display font-semibold text-[15px] text-white">{m.name}</p>
                              <p className="text-[12px] text-white/40 mt-0.5">{m.description}</p>
                            </div>
                            <ArrowRight size={16} className="text-white/20" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Payment + Upload Proof */}
                {step === 'payment' && selectedMethod && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setStep('method')} className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer">
                        <ArrowLeft size={16} />
                      </button>
                      <h3 className="font-display text-xl font-bold">
                        {selectedMethod.emoji} {methodName}
                      </h3>
                    </div>
                    <p className="text-white/45 text-sm mb-5 ml-7">
                      Plan <span className="text-dz-dinar font-semibold">{plan?.label}</span> — <span className="text-dz-dinar font-bold">{plan?.price}</span>
                    </p>

                    {/* Generic instructions */}
                    {selectedMethod.instructions?.length > 0 && (
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-white/35 mb-3">Instructions de paiement</p>
                        <ol className="space-y-2 text-[13px] text-white/60 list-decimal list-inside">
                          {selectedMethod.instructions.map((s, i) => (
                            <li key={i}>{fillInstructions(s)}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Bank details block */}
                    {selectedMethod.type === 'bank' && (
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-white/35 mb-3">Informations bancaires</p>
                        <div className="space-y-3">
                          {[
                            { label: 'Bénéficiaire', value: selectedMethod.details?.beneficiary, key: 'beneficiary' },
                            { label: 'IBAN', value: selectedMethod.details?.iban, key: 'iban' },
                            { label: 'BIC/SWIFT', value: selectedMethod.details?.bic, key: 'bic' },
                            { label: 'N° Identifiant', value: selectedMethod.details?.idNumber, key: 'idNumber' },
                          ].filter(r => r.value).map(r => (
                            <div key={r.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                              <div>
                                <p className="text-[10px] text-white/30 uppercase">{r.label}</p>
                                <p className={cn('text-sm text-white mt-0.5', r.key === 'iban' && 'font-mono')}>{r.value}</p>
                              </div>
                              <button onClick={() => handleCopy(r.value, r.key)} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                {copied === r.key ? <CheckCircle2 size={14} className="text-dz-emerald" /> : <Copy size={14} className="text-white/30" />}
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                            <div>
                              <p className="text-[10px] text-white/30 uppercase">Montant</p>
                              <p className="text-lg text-dz-dinar font-bold font-display mt-0.5">{plan?.price}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/30 mt-3">
                          <span className="text-white/50">Référence :</span> Envoie ton email dans le motif du virement.
                        </p>
                      </div>
                    )}

                    {/* Email target block */}
                    {selectedMethod.type === 'email' && (
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-white/35 mb-3">Envoie le montant à :</p>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
                          <span className="font-mono text-sm text-white">{methodTarget}</span>
                          <button onClick={() => handleCopy(methodTarget, 'target')} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                            {copied === 'target' ? <CheckCircle2 size={14} className="text-dz-emerald" /> : <Copy size={14} className="text-white/30" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-white/30 mt-2">En objet : <span className="text-white/50">Ton email + "Plan {plan?.label}"</span></p>
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
                          <p className="text-[11px] text-white/25">PDF ou image · max 5 Mo</p>
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

                {/* STEP 4: Done — payment recorded, waiting for admin approval */}
                {step === 'done' && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-dz-gold/15 border border-dz-gold/40 flex items-center justify-center mb-4">
                      <Hourglass size={26} className="text-dz-gold" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">En attente d'approbation ⏳</h3>
                    <p className="text-white/55 text-sm leading-relaxed max-w-sm mx-auto mb-3">
                      Ta preuve de paiement a bien été reçue. Un{' '}
                      <span className="text-dz-gold font-semibold">administrateur</span> va vérifier ton
                      paiement puis activer ton plan.
                    </p>
                    <p className="text-white/35 text-[12px] leading-relaxed max-w-xs mx-auto mb-6">
                      Ton accès sera débloqué automatiquement dès l'approbation. Merci de patienter.
                    </p>

                    {/* Contact admin if needed */}
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
                      Une question ?
                    </p>
                    <div className="flex items-center justify-center gap-2.5">
                      {whatsappNumber && (
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour, je viens de payer le plan ${plan?.label} (${plan?.price}) via ${methodName}.\n\nMon compte : ${user?.email || ''}\nJ'attends la vérification de mon paiement.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 px-3 py-1.5 text-[11px] font-semibold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      )}
                      <a
                        href={`https://t.me/${adminTelegram}?text=${encodeURIComponent(`Bonjour, je viens de payer le plan ${plan?.label} (${plan?.price}) via ${methodName}.\n\nMon compte : ${user?.email || ''}\nJ'attends la vérification de mon paiement.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0088CC]/10 border border-[#0088CC]/30 px-3 py-1.5 text-[11px] font-semibold text-[#0088CC] hover:bg-[#0088CC]/20 transition-colors"
                      >
                        <Send size={12} /> Telegram
                      </a>
                    </div>

                    <button onClick={onClose} className="mt-5 text-[12px] text-white/30 hover:text-white/50 transition-colors cursor-pointer">
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
