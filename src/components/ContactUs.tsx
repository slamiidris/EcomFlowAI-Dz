import { useState, useEffect } from 'react';
import { MessageCircle, Send, Mail, Loader2, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { configApi, contactApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SUBJECTS = [
  'Demande générale',
  'Facturation / Paiement',
  'Problème technique',
  'Autre',
];

export default function ContactUs() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [config, setConfig] = useState<{ adminEmail: string; adminTelegram: string; whatsappNumber: string } | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    configApi.get().then(setConfig).catch(() => {});
  }, []);

  // Pre-fill from auth when user loads
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    if (message.trim().length < 10) {
      toast.error('Le message doit contenir au moins 10 caractères.');
      return;
    }
    setSending(true);
    try {
      await contactApi.send({ name: name.trim(), email: email.trim(), subject, message: message.trim() });
      setSent(true);
      toast.success('Message envoyé ! Nous te répondrons rapidement.');
      setTimeout(() => setSent(false), 3000);
      setMessage('');
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  const whatsappUrl = config?.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Bonjour, j\'ai une question concernant EcomFlow AI.')}`
    : null;
  const telegramUrl = config?.adminTelegram
    ? `https://t.me/${config.adminTelegram}`
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageCircle size={24} className="text-dz-emerald" />
          Contact & Support
        </h1>
        <p className="text-white/40 text-sm mt-1">Nous sommes là pour t'aider. Écris-nous ou contacte-nous directement.</p>
      </div>

      {/* Contact info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* WhatsApp */}
        <a
          href={whatsappUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`surface-card p-5 flex flex-col items-center gap-3 transition-all hover:border-[#25D366]/40 ${!whatsappUrl ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
            <MessageCircle size={22} className="text-[#25D366]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">WhatsApp</p>
            <p className="text-[11px] text-white/35 mt-0.5">
              {config?.whatsappNumber ? `+${config.whatsappNumber}` : 'Non configuré'}
            </p>
          </div>
          {whatsappUrl && <ExternalLink size={12} className="text-white/20" />}
        </a>

        {/* Telegram */}
        <a
          href={telegramUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`surface-card p-5 flex flex-col items-center gap-3 transition-all hover:border-[#0088CC]/40 ${!telegramUrl ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0088CC]/10 border border-[#0088CC]/20 flex items-center justify-center">
            <Send size={22} className="text-[#0088CC]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Telegram</p>
            <p className="text-[11px] text-white/35 mt-0.5">
              {config?.adminTelegram ? `@${config.adminTelegram}` : 'Non configuré'}
            </p>
          </div>
          {telegramUrl && <ExternalLink size={12} className="text-white/20" />}
        </a>

        {/* Email */}
        <div className="surface-card p-5 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-dz-gold/10 border border-dz-gold/20 flex items-center justify-center">
            <Mail size={22} className="text-dz-gold" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Email</p>
            <p className="text-[11px] text-white/35 mt-0.5 break-all">
              {config?.adminEmail || 'Non configuré'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="surface-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-1">Envoyer un message</h2>
        <p className="text-white/35 text-sm mb-6">Remplis le formulaire ci-dessous et nous te répondrons par email.</p>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">Nom</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ton nom"
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-dz-emerald/70 focus:ring-4 focus:ring-dz-emerald/10 transition-all"
                maxLength={120}
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-dz-emerald/70 focus:ring-4 focus:ring-dz-emerald/10 transition-all"
                maxLength={128}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">Sujet</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-dz-emerald/70 focus:ring-4 focus:ring-dz-emerald/10 transition-all"
            >
              {SUBJECTS.map(s => (
                <option key={s} value={s} className="bg-[#121411]">{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Décris ton problème ou ta question…"
              rows={5}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-dz-emerald/70 focus:ring-4 focus:ring-dz-emerald/10 transition-all resize-none"
              maxLength={5000}
            />
            <p className="text-[10px] text-white/20 mt-1 text-right">{message.length}/5000</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || sent}
            className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-dz-gold to-dz-emerald text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(201,164,92,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {sending ? (
              <><Loader2 size={16} className="animate-spin" /> Envoi…</>
            ) : sent ? (
              <><Check size={16} /> Envoyé !</>
            ) : (
              <><Send size={16} /> Envoyer le message</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
