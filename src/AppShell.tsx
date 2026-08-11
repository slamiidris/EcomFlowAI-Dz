/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './context/LanguageContext';
import { cn } from './lib/utils';
import { preferencesApi } from './services/api';
import { Loader2, Sun, Moon } from 'lucide-react';
import { useAuth, PlanId } from './context/AuthContext';
import PlanCheckout from './components/PlanCheckout';
import LockedTool from './components/LockedTool';
import { isToolPaid, hasActivePlan } from './lib/access';

// Lazy load components
const DashboardHome = lazy(() => import('./components/DashboardHome'));
const VideoAdGenerator = lazy(() => import('./components/VideoAdGenerator'));
const LandingPageGenerator = lazy(() => import('./components/LandingPageGenerator'));
const LandingAssembler = lazy(() => import('./components/LandingAssembler'));
const MarketTrends = lazy(() => import('./components/MarketTrends'));
const ProductImageGen = lazy(() => import('./components/ProductImageGen'));
const MarginCalculator = lazy(() => import('./components/MarginCalculator'));
const Settings = lazy(() => import('./components/Settings'));
const DarjaAdGenerator = lazy(() => import('./components/DarjaAdGenerator'));
const ProductAnalyzer = lazy(() => import('./components/ProductAnalyzer'));
const ProductCatalog = lazy(() => import('./components/ProductCatalog'));
const TelegramProductScout = lazy(() => import('./components/TelegramProductScout'));
const ContentCalendar = lazy(() => import('./components/ContentCalendar'));
const ContactUs = lazy(() => import('./components/ContactUs'));

type NavItem = 'dashboard' | 'video' | 'landing' | 'assembler' | 'trends' | 'images' | 'calculator' | 'settings' | 'darja' | 'analyzer' | 'catalog' | 'scout' | 'calendar' | 'contact';

export default function AppShell() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [visitedTabs, setVisitedTabs] = useState<Set<NavItem>>(new Set(['dashboard']));
  const mainRef = useRef<HTMLElement>(null);

  const { user, isMock } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const handleNavChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    const handleOpenCheckout = () => setCheckoutOpen(true);
    window.addEventListener('nav-change', handleNavChange);
    window.addEventListener('dz_open_checkout', handleOpenCheckout);
    return () => {
      window.removeEventListener('nav-change', handleNavChange);
      window.removeEventListener('dz_open_checkout', handleOpenCheckout);
    };
  }, []);

  // After login, resume a plan chosen on the landing page.
  useEffect(() => {
    if (user) {
      const intent = sessionStorage.getItem('dz_plan_intent') as PlanId | null;
      if (intent) {
        sessionStorage.removeItem('dz_plan_intent');
        setCheckoutPlan(intent);
        setCheckoutOpen(true);
      }
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    // Listen to theme changes from other components (like Settings.tsx)
    const handleStorageChange = () => {
      const storedTheme = localStorage.getItem('theme');
      setIsDark(storedTheme !== 'light');
    };
    window.addEventListener('storage', handleStorageChange);
    // Also support a custom event just in case
    const handleThemeToggleCustom = (e: any) => {
      if (e.detail !== undefined) {
        setIsDark(e.detail);
      }
    };
    window.addEventListener('dz_theme_changed', handleThemeToggleCustom);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dz_theme_changed', handleThemeToggleCustom);
    };
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    // Dispatch event to keep other mounts updated
    window.dispatchEvent(new CustomEvent('dz_theme_changed', { detail: checked }));
    // Dual-write: persist the theme to the server API (fire-and-forget)
    preferencesApi.update({ theme: checked ? 'dark' : 'light' }).catch(() => {});
  };

  useEffect(() => {
    setVisitedTabs(prev => new Set(prev).add(activeTab));
  }, [activeTab]);

  const components = useMemo<Record<NavItem, React.ReactNode>>(() => ({
    dashboard: <DashboardHome />,
    video: <VideoAdGenerator />,
    landing: <LandingPageGenerator />,
    assembler: <LandingAssembler />,
    images: <ProductImageGen />,
    calculator: <MarginCalculator />,
    trends: <MarketTrends />,
    settings: <Settings />,
    darja: <DarjaAdGenerator />,
    analyzer: <ProductAnalyzer />,
    catalog: <ProductCatalog />,
    scout: <TelegramProductScout />,
    calendar: <ContentCalendar />,
    contact: <ContactUs />,
  }), []);

  return (
    <div className="flex h-screen bg-[#0b0c0a] font-sans antialiased overflow-hidden relative">
      {/* Background decorative elements - Stationary & GPU friendly to eliminate repaints during scrolling */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }}>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-dz-emerald/[0.05] rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-dz-gold/[0.05] rounded-full blur-[130px]" />
        <div className="absolute top-[30%] right-[15%] w-[35%] h-[40%] bg-dz-gold/[0.04] rounded-full blur-[110px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-dz-amber/[0.03] rounded-full blur-[90px]" />

        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-grid-white bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto relative p-2 sm:p-4 md:p-8"
        >
          <div className="max-w-none mx-auto relative glass-main p-3 sm:p-6 md:p-10 min-h-[calc(100vh-4rem)]">
            {(!user.plan || user.planStatus !== 'active') && (
              <div className="mb-3 sm:mb-5 flex items-center justify-between gap-3 rounded-2xl border border-dz-dinar/30 bg-dz-dinar/[0.06] px-4 py-2.5">
                <p className="text-[11px] sm:text-xs text-white/70 flex items-center gap-2">
                  {user.planStatus === 'pending' ? (
                    <>⏳ Paiement <span className="text-dz-dinar font-semibold">en attente d'approbation</span> — un admin va vérifier ta preuve et activer ton accès.</>
                  ) : (
                    <>✨ Aucun plan actif — <span className="text-dz-dinar font-semibold">abonne-toi</span> pour débloquer les 12 outils IA.</>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => { setCheckoutPlan(null); setCheckoutOpen(true); }}
                  className="shrink-0 rounded-lg bg-dz-dinar/20 border border-dz-dinar/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-dz-dinar hover:bg-dz-dinar/30 transition-colors cursor-pointer"
                >
                  Voir les plans
                </button>
              </div>
            )}

            {/* Global Top Navigation / Header Bar */}
            <div className="flex flex-col gap-2 sm:gap-4 border-b border-white/10 pb-2 sm:pb-4 mb-3 sm:mb-6" id="app-global-topbar">
              {/* Row 1: Active Tab Title & Controls */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-[10px] sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5 sm:gap-2 font-arabic">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dz-emerald opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-dz-emerald"></span>
                    </span>
                    {activeTab === 'images' && t('tabImages', '📸 Studio Photos Produit E-Com')}
                    {activeTab === 'dashboard' && t('tabDashboard', '📊 Dashboard Ventes & KPI E-Commerce')}
                    {activeTab === 'video' && t('tabVideo', '🎬 Générateur de Créatifs Pubs Vidéo')}
                    {activeTab === 'landing' && t('tabLanding', '⚡ Tunnel de Vente & Copywriting LP')}
                    {activeTab === 'assembler' && t('tabAssembler', '🍱 Constructeur de Landing Page E-Com')}
                    {activeTab === 'calculator' && t('tabCalculator', '🧮 Calculateur de Marge COD & Profit')}
                    {activeTab === 'trends' && t('tabTrends', '📈 Détecteur de Produits Gagnants (Winning Products)')}
                    {activeTab === 'settings' && t('tabSettings', '⚙️ Configuration Boutique & Pixels')}
                    {activeTab === 'darja' && t('tabDarja', '📝 Générateur d\'Annonces Darja')}
                    {activeTab === 'analyzer' && t('tabAnalyzer', '🤖 Consultant Expert IA (Analyse Produit)')}
                    {activeTab === 'catalog' && t('tabCatalog', '📦 Catalogue & Gestion Produits')}
                    {activeTab === 'scout' && t('tabScout', '🔍 Scout de Produits Telegram')}
                    {activeTab === 'calendar' && t('tabCalendar', '🗓️ Calendrier de Contenu E-Com')}
                    {activeTab === 'contact' && t('tabContact', '💬 Contact & Support')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                  {/* Language Switcher Component */}
                  <LanguageSwitcher />

                  {/* Dev mode badge — visible when using the mock Google login */}
                  {isMock && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-mono font-bold uppercase tracking-widest select-none">
                      DEV
                    </span>
                  )}

                  {/* Sleek Dynamic Slide-Toggle for Dark/Light Mode */}
                  <div className="flex items-center gap-0.5 sm:gap-2 bg-black/30 p-0.5 sm:p-1.5 rounded-lg sm:rounded-2xl border border-white/5 select-none shrink-0" id="global-theme-toggle">
                    <button
                      type="button"
                      onClick={() => handleThemeToggle(false)}
                      className={cn(
                        "p-0.5 sm:p-2 px-1 sm:px-2.5 rounded sm:rounded-xl transition-all flex items-center gap-1 text-[8px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer",
                        !isDark
                          ? "bg-linear-to-r from-dz-amber to-dz-gold text-white shadow-md font-black shadow-dz-amber/20"
                          : "text-white/40 hover:text-white/80"
                      )}
                      title="Activer mode clair"
                    >
                      <Sun className="size-2.5 sm:size-3.5" />
                      <span>{t('lightMode', 'Clair')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeToggle(true)}
                      className={cn(
                        "p-0.5 sm:p-2 px-1 sm:px-2.5 rounded sm:rounded-xl transition-all flex items-center gap-1 text-[8px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer",
                        isDark
                          ? "bg-linear-to-r from-dz-gold to-dz-emerald text-white shadow-md font-black shadow-dz-emerald/20"
                          : "text-white/40 hover:text-white/80"
                      )}
                      title="Activer mode sombre"
                    >
                      <Moon className="size-2.5 sm:size-3.5" />
                      <span>{t('darkMode', 'Sombre')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-dz-emerald animate-spin" />
                <p className="text-white/40 text-sm font-black uppercase tracking-widest">Chargement de l'outil...</p>
              </div>
            }>
              {Object.entries(components).map(([key, component]) => {
                const isVisible = activeTab === key;
                const wasVisited = visitedTabs.has(key as NavItem);

                // Paid (AI) tool but no active plan: never mount the tool —
                // show the locked screen instead.
                if (isToolPaid(key) && !hasActivePlan(user)) {
                  return isVisible ? (
                    <div key={key} className="w-full">
                      <LockedTool
                        tab={key}
                        onSubscribe={() => { setCheckoutPlan(null); setCheckoutOpen(true); }}
                      />
                    </div>
                  ) : null;
                }

                if (!wasVisited && !isVisible) return null;

                return (
                  <div
                    key={key}
                    className={cn(
                      "w-full",
                      isVisible ? "block" : "hidden pointer-events-none"
                    )}
                  >
                    {component}
                  </div>
                );
              })}
            </Suspense>
          </div>
        </main>
      </div>

      <PlanCheckout open={checkoutOpen} initialPlan={checkoutPlan} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
