import { motion } from 'framer-motion';
import { Clapperboard, LayoutTemplate, Camera, MessageSquareText, Radar, Calculator, Zap, Lock, ArrowRight } from 'lucide-react';
import { useAuth, PlanId } from '../context/AuthContext';
import { PLANS } from './PlanCheckout';
import { cn } from '../lib/utils';

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const TICKER_ITEMS = [
  '🔥 Hachoir Manuel 3 Lames — +340% sur Telegram',
  '👗 Abaya Dubai Luxe — Top vente Hamiz',
  '⌚ Smart Watch Ultra 2 — Livraison 58 wilayas',
  '☕ Machine à Café Expresso — Marge 62%',
  '💡 Pack Éclairage Solaire — Saison en hausse',
  '👟 Sneakers Jordan DZ — Volumes COD actifs',
  '🚿 Aspirateur de Voiture — CPA bas',
  '🧅 Mixeur Plongeant DZ — Retours < 2%',
];

const FEATURES = [
  { icon: Radar, title: 'Scout Telegram', desc: 'Produits en train de monter détectés en direct sur les canaux DZ.', color: 'text-dz-emerald' },
  { icon: Clapperboard, title: 'Pubs Vidéo & TikTok', desc: 'Scripts, storyboards et hooks IA prêts à shooter pour ta niche.', color: 'text-dz-amber' },
  { icon: LayoutTemplate, title: 'Tunnels de Vente', desc: 'Landing pages COD optimisées conversion, visuels générés inclus.', color: 'text-dz-gold' },
  { icon: Camera, title: 'Studio Photo IA', desc: 'Visuels HD professionnels pour tes produits, sans studio.', color: 'text-dz-dinar' },
  { icon: MessageSquareText, title: 'Annonces Darja', desc: 'Hooks et copies qui parlent vraiment au marché algérien.', color: 'text-dz-emerald' },
  { icon: Calculator, title: 'Marge COD', desc: 'Profit, ROAS et CPA cible calculés en secondes, en DZD.', color: 'text-dz-amber' },
];

const PLAN_EMOJI: Record<PlanId, string> = { monthly: '⚡', quarterly: '🔥', lifetime: '👑' };

export default function LandingPage() {
  const { login } = useAuth();

  const handleSubscribe = (plan: PlanId) => {
    // Remember intent across the Google redirect; App opens the checkout after login.
    sessionStorage.setItem('dz_plan_intent', plan);
    login();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-dz-emerald to-dz-gold flex items-center justify-center text-base">🛍️</div>
            <div className="leading-none">
              <p className="font-display font-bold text-sm tracking-tight">DZ-Commerce <span className="text-dz-emerald">OS</span></p>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35">E-Com AI Platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={login}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:border-dz-emerald/50 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <GoogleG size={16} />
            Se connecter
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-dz-emerald/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-dz-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-64 right-10 w-72 h-72 bg-dz-amber/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-dz-emerald/30 bg-dz-emerald/5 px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-dz-emerald">
              <Zap size={11} /> Arsenal IA pour vendeurs algériens
            </span>

            <h1 className="mt-6 font-display text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
              Détecte le produit gagnant.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-dz-emerald via-dz-gold to-dz-dinar">
                Domine le COD en Algérie.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-white/55 text-base sm:text-lg leading-relaxed">
              DzAds AI scanne Telegram, génère tes pubs vidéo, landing pages et visuels — et calcule ta marge.
              Tout pensé pour le marché algérien, en Darija.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={login}
                className="group flex items-center gap-3 rounded-2xl bg-white text-[#0f172a] px-7 py-3.5 text-[15px] font-bold shadow-[0_8px_40px_rgba(0,242,254,0.25)] hover:shadow-[0_8px_50px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <GoogleG size={20} />
                Continuer avec Google
                <ArrowRight size={16} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="flex items-center gap-1.5 text-[11px] text-white/35 font-mono">
                <Lock size={11} /> Connexion sécurisée · sans mot de passe · 3 plans en DZD
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARKET-PULSE TICKER (signature) */}
      <section className="border-y border-white/5 bg-white/[0.015] py-3">
        <div className="dz-ticker">
          <div className="dz-ticker-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {TICKER_ITEMS.map((item, i) => (
                  <span
                    key={`${dup}-${i}`}
                    className="dz-ticker-item flex items-center gap-3 px-5 whitespace-nowrap font-mono text-[12px] text-white/45"
                    style={{ animationDelay: `${(i * 0.5) % 4}s` }}
                  >
                    <span className="dz-ticker-diamond text-dz-emerald">◈</span>
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-dz-emerald/70 mb-3">12 outils · 1 commandement</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Tout ce qu'il faut pour vendre, <span className="text-dz-emerald">réuni</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="glass-card glass-card-hover p-5"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 mb-4', f.color)}>
                <f.icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-[15px] mb-1">{f.title}</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="relative py-20 sm:py-24">
        <div className="absolute inset-0 bg-grid-white opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-dz-dinar/80 mb-3">Paiement en DZD · confirmation manuelle</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Des plans simples, <span className="text-dz-dinar">en dinars</span>
            </h2>
            <p className="mt-3 text-white/50 text-sm">1 mois pour tester · 3 mois pour lancer · à vie pour dominer.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 items-stretch">
            {PLANS.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
                className={cn(
                  'relative rounded-3xl border p-6 flex flex-col bg-linear-to-b',
                  p.accent,
                  p.popular ? 'md:-mt-3 md:-mb-3 shadow-[0_20px_60px_rgba(139,92,246,0.25)]' : ''
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-linear-to-r from-dz-gold to-dz-emerald text-black px-3 py-1 rounded-full">
                    ⭐ Le plus choisi
                  </span>
                )}
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{p.tagline}</p>
                <h3 className="font-display text-xl font-bold mt-1.5 flex items-center gap-2">
                  <span>{PLAN_EMOJI[p.id]}</span> {p.label}
                </h3>
                <div className="mt-4 mb-1">
                  <span className="font-display font-bold text-4xl text-dz-dinar">{p.price}</span>
                  <span className="ml-2 text-sm text-white/45 font-mono">{p.note}</span>
                </div>
                <p className="text-[12px] text-white/45 mb-5">{p.per}</p>

                <ul className="space-y-2 mb-7 text-[13px] text-white/60 flex-1">
                  {['Accès à tous les 12 outils IA', 'Mises à jour incluses', 'Support admin via Telegram'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-dz-emerald mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSubscribe(p.id)}
                  className={cn(
                    'w-full rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] cursor-pointer',
                    p.popular
                      ? 'bg-linear-to-r from-dz-emerald to-dz-gold text-black hover:shadow-[0_4px_25px_rgba(242,254,0,0.25)] shadow-lg'
                      : 'bg-linear-to-r from-white/5 to-white/[0.02] border border-white/15 hover:bg-white/10 hover:border-dz-emerald/40 hover:shadow-[0_4px_20px_rgba(0,242,254,0.12)]'
                  )}
                >
                  S'abonner
                </button>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[11px] text-white/30 font-mono mt-8">
            Après paiement, envoie la facture (PDF / photo) à l'admin — accès activé manuellement en 24h.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/30 font-mono">
          <p>© 2026 DzAds AI — DZ-Commerce OS · Conçu pour le marché algérien</p>
          <p className="flex items-center gap-3">
            <span className="text-dz-emerald/70">v2.4.0</span>
            <span>COD · 58 wilayas · DZD</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
