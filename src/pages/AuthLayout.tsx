import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import ecomflowLogo from '../images/EcomFlow.png';

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_1.05fr] bg-dz-green font-sans antialiased">
      {/* LEFT: brand panel (hidden on mobile, always dark) */}
      <aside className="auth-brand relative hidden lg:flex flex-col justify-between overflow-hidden px-10 xl:px-16 py-10">
        {/* Top: logo */}
        <Link to="/" className="flex items-center gap-3 w-fit">
          <img src={ecomflowLogo} alt="EcomFlow AI" className="w-14 h-14 rounded-full object-cover shadow-[0_0_20px_rgba(212,164,76,0.15)]" />
          <div className="leading-none">
            <p className="font-display font-bold text-sm text-white">EcomFlow <span className="text-dz-emerald">AI</span></p>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">{t('authBrandSubtitle')}</p>
          </div>
        </Link>

        {/* Center: value proposition */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
            {t('authBrandBadge')}
          </span>
          <h1 className="mt-6 font-display text-4xl xl:text-5xl font-bold tracking-[-0.03em] leading-[1.1] text-white">
            {t('authBrandHeadlineA')}
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-dz-gold to-dz-emerald">
              {t('authBrandHeadlineB')}
            </span>
          </h1>
          <p className="text-white/45 max-w-md mt-5 leading-relaxed">
            {t('authBrandDesc')}
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/50">
              {t('authBrandFeature1')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/50">
              {t('authBrandFeature2')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/50">
              {t('authBrandFeature3')}
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-white/20">{t('authBrandFooter')}</p>
          <LanguageSwitcher />
        </div>
      </aside>

      {/* RIGHT: form panel (follows dark/light theme) */}
      <main className="relative flex min-h-screen flex-col">
        {/* Mobile header (visible only on < lg) */}
        <header className="flex items-center justify-between px-5 sm:px-8 py-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={ecomflowLogo} alt="EcomFlow AI" className="w-10 h-10 rounded-full object-cover shadow-[0_0_12px_rgba(212,164,76,0.1)]" />
            <span className="font-display font-bold text-sm text-white">
              EcomFlow <span className="text-dz-emerald">AI</span>
            </span>
          </Link>
          <LanguageSwitcher />
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex justify-end px-8 py-5">
          <LanguageSwitcher />
        </header>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-4 sm:px-8 py-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {showBack && (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-white transition-colors mb-6 cursor-pointer"
              >
                <ArrowLeft size={13} /> {t('authBack', "Retour à l'accueil")}
              </Link>
            )}

            <div className="surface-card rounded-3xl p-6 sm:p-10">
              <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-[-0.02em] text-white">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-white/45 leading-relaxed">{subtitle}</p>}

              <div className="mt-7">{children}</div>

              {footer && (
                <div className="mt-7 pt-6 border-t border-white/[0.06] text-[13px] text-white/45 text-center">
                  {footer}
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 flex items-center justify-center gap-1.5">
              <ShieldCheck size={11} className="text-dz-emerald" />
              {t('authSecure', 'Connexion sécurisée · code à 6 chiffres')}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
