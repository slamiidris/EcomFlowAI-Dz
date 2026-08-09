/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './context/LanguageContext';
import { cn } from './lib/utils';
import { preferencesApi } from './services/api';
import { Loader2, Sun, Moon, HelpCircle, X, Sparkles, BookOpen, Percent, Compass } from 'lucide-react';
import { useAuth, PlanId } from './context/AuthContext';
import PlanCheckout from './components/PlanCheckout';

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

type NavItem = 'dashboard' | 'video' | 'landing' | 'assembler' | 'trends' | 'images' | 'calculator' | 'settings' | 'darja' | 'analyzer' | 'catalog' | 'scout' | 'calendar';

export default function AppShell() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [visitedTabs, setVisitedTabs] = useState<Set<NavItem>>(new Set(['dashboard']));
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
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
    window.addEventListener('nav-change', handleNavChange);
    return () => window.removeEventListener('nav-change', handleNavChange);
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
                    <>⏳ Paiement <span className="text-dz-dinar font-semibold">en attente de vérification</span> — envoie ta facture à l'admin pour activer l'accès.</>
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

      {/* Floating Smart Guide Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setGuideStep(0);
            setShowGuide(true);
          }}
          className="flex items-center gap-2 px-5 py-3.5 bg-linear-to-r from-dz-gold to-dz-emerald text-black rounded-2xl font-black text-xs uppercase tracking-wider shadow-[0_2px_14px_rgba(201,164,92,0.2)] hover:shadow-[0_8px_30px_rgba(201,164,92,0.28)] active:scale-95 transition-all cursor-pointer select-none group border border-white/20"
        >
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <BookOpen size={14} className="group-hover:rotate-12 transition-transform" />
          <span className="font-arabic font-bold tracking-normal">دليل الاستخدام السريع 💡</span>
        </button>
      </div>

      {/* Interactive Quick Guide Drawer */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-[#121410] border border-white/10 rounded-[2.5rem] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden relative"
            >
              {/* Decorative glows */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-dz-gold/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-dz-emerald/10 rounded-full blur-3xl pointer-events-none" />

              <div className="p-6 md:p-8 relative z-10 flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <button
                    onClick={() => setShowGuide(false)}
                    className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-dz-gold to-dz-emerald">
                      EcomFlow AI Helper
                    </span>
                    <HelpCircle size={16} className="text-dz-emerald" />
                  </div>
                </div>

                {/* Steps Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <AnimatePresence mode="wait">
                    {guideStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6 text-right"
                        dir="rtl"
                      >
                        <div className="flex items-center gap-3 justify-start">
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-dz-gold to-dz-emerald flex items-center justify-center font-bold text-xl shadow-lg border border-white/10">
                            🚀
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white font-arabic">مرحباً بك في EcomFlow AI!</h3>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-0.5">AI-Powered Ecommerce Marketing Platform</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                          هذه المنصة صممت خصيصاً لمساعدتك على بيع وإطلاق منتجاتك في السوق الجزائري (e-Commerce COD) بأسهل وأسرع طريقة ممكنة. لقد جهزنا لك أدوات متكاملة تعمل بالذكاء الاصطناعي لرفع مبيعاتك وتسهيل عملك.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1.5 hover:border-dz-emerald/30 transition-colors">
                            <div className="flex items-center gap-2 text-dz-emerald">
                              <Sparkles size={16} />
                              <h4 className="font-bold text-xs font-arabic text-white">صور منتجات فخمة وبدون كاميرا</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 font-arabic leading-relaxed">
                              اصنع خلفيات استوديو إعلانية رائعة لمنتجك بضغطة زر واحدة.
                            </p>
                          </div>

                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1.5 hover:border-dz-gold/30 transition-colors">
                            <div className="flex items-center gap-2 text-dz-gold">
                              <BookOpen size={16} />
                              <h4 className="font-bold text-xs font-arabic text-white">صفحات هبوط مقنعة بالكامل</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 font-arabic leading-relaxed">
                              اكتب نصوص صفحات هبوط بالدارجة الجزائرية والفرنسية تزيد من رغبة الزبون في الشراء.
                            </p>
                          </div>

                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1.5 hover:border-dz-amber/30 transition-colors">
                            <div className="flex items-center gap-2 text-dz-amber">
                              <Percent size={16} />
                              <h4 className="font-bold text-xs font-arabic text-white">حاسبة أرباح دقيقة</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 font-arabic leading-relaxed">
                              احسب الفائدة والربح الصافي مع إدراج تكاليف التوصيل والإعلانات لتفادي الخسارة.
                            </p>
                          </div>

                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1.5 hover:border-purple-400 transition-colors">
                            <div className="flex items-center gap-2 text-purple-400">
                              <Compass size={16} />
                              <h4 className="font-bold text-xs font-arabic text-white">سكريبتات فيديو إعلانية</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 font-arabic leading-relaxed">
                              ولد سيناريو فيديو ترويجي بالدارجة الجزائرية لجذب المشاهدين على تيك توك وفيسبوك.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {guideStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5 text-right"
                        dir="rtl"
                      >
                        <div className="flex items-center gap-3 justify-start">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold border border-purple-500/20">
                            1
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white font-arabic">📸 صور إعلانية تسرق الأنظار!</h3>
                            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Studio Photo AI</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                          الزبائن يشترون بأعينهم أولاً! للبدء في توليد صور إعلانية ممتازة لمنتجك:
                        </p>

                        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-3.5">
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">أ</span>
                            <p className="text-xs text-slate-300 font-arabic">اذهب لقسم <b>Photos Produit AI</b> في القائمة الجانبية.</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">ب</span>
                            <p className="text-xs text-slate-300 font-arabic">اكتب اسم منتجك بالتفصيل (مثل: <i>شاحن سيارة لاسلكي ذكي</i>).</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">ج</span>
                            <p className="text-xs text-slate-300 font-arabic">اختر المظهر المرغوب فيه (مثل <b>Minimalist</b> أو <b>Lifestyle</b>) ثم انقر على زر التوليد السحري!</p>
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <button
                            onClick={() => {
                              setActiveTab('images');
                              setShowGuide(false);
                            }}
                            className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500 hover:text-white rounded-xl text-xs font-bold font-arabic cursor-pointer transition-all"
                          >
                            اذهب لاستوديو الصور الآن ➔
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {guideStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5 text-right"
                        dir="rtl"
                      >
                        <div className="flex items-center gap-3 justify-start">
                          <div className="w-10 h-10 rounded-xl bg-dz-emerald/10 text-dz-emerald flex items-center justify-center font-bold border border-dz-emerald/20">
                            2
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white font-arabic">📝 إنشاء صفحات هبوط مخصصة للجزائر</h3>
                            <p className="text-[10px] text-dz-emerald uppercase tracking-widest font-bold">Landing Pages Creator</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                          صفحة الهبوط هي عصب المبيعات! لم تعد بحاجة لكتابة النصوص أو التفكير في المميزات بنفسك:
                        </p>

                        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-3.5">
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-dz-emerald/20 text-dz-emerald text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">أ</span>
                            <p className="text-xs text-slate-300 font-arabic">افتح قسم <b>Landing Pages AI</b>.</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-dz-emerald/20 text-dz-emerald text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">ب</span>
                            <p className="text-xs text-slate-300 font-arabic"><b>ارفع صورة منتجك</b> في مربع السحب والإفلات. سيقوم الذكاء الاصطناعي تلقائياً بفهم خصائص المنتج وملء الحقول بالكامل!</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-dz-emerald/20 text-dz-emerald text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">ج</span>
                            <p className="text-xs text-slate-300 font-arabic">اختر <b>"زاوية التسويق"</b> المناسبة لمنتجك (مثل عائلي، حل مشكلة، أو ترويج) ثم اضغط توليد لتشاهد هيكل صفحة الهبوط فوراً!</p>
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <button
                            onClick={() => {
                              setActiveTab('landing');
                              setShowGuide(false);
                            }}
                            className="px-4 py-2 bg-dz-emerald/20 text-dz-emerald border border-dz-emerald/30 hover:bg-dz-emerald hover:text-white rounded-xl text-xs font-bold font-arabic cursor-pointer transition-all"
                          >
                            اذهب لمنشئ صفحات الهبوط ➔
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {guideStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-5 text-right"
                        dir="rtl"
                      >
                        <div className="flex items-center gap-3 justify-start">
                          <div className="w-10 h-10 rounded-xl bg-dz-amber/10 text-dz-amber flex items-center justify-center font-bold border border-dz-amber/20">
                            3
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white font-arabic">🎬 الفيديو التسويقي وحساب الربح الصافي</h3>
                            <p className="text-[10px] text-dz-amber uppercase tracking-widest font-bold">Video Script & Calculator</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                          أكمل حملتك بقوة واضمن ألا تخسر سنتيماً واحداً في إعلاناتك:
                        </p>

                        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-3.5">
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-dz-amber/20 text-dz-amber text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">أ</span>
                            <p className="text-xs text-slate-300 font-arabic">استخدم <b>Video Ads AI</b> لصياغة سكريبتات فيديو ترويجية بالعامية الجزائرية (الدارجة) لتلقين المذيع أو مصور الـ UGC بدقة.</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-dz-amber/20 text-dz-amber text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">ب</span>
                            <p className="text-xs text-slate-300 font-arabic">استعن بـ <b>Calculateur de Marge</b> لتسجيل ثمن شراء المنتج، نسبة استلام الطلبات (COD Delivery Rate)، وتكلفة الإعلانات لمعرفة ربحك الصافي المتوقع بدقة تامة.</p>
                          </div>
                        </div>

                        <div className="flex justify-start gap-2">
                          <button
                            onClick={() => {
                              setActiveTab('video');
                              setShowGuide(false);
                            }}
                            className="px-4 py-2 bg-dz-amber/20 text-dz-amber border border-dz-amber/30 hover:bg-dz-amber hover:text-white rounded-xl text-xs font-bold font-arabic cursor-pointer transition-all"
                          >
                            منشئ الفيديو 🎬
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('calculator');
                              setShowGuide(false);
                            }}
                            className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs font-bold font-arabic cursor-pointer transition-all"
                          >
                            حاسبة الأرباح 📊
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
                  {guideStep > 0 ? (
                    <button
                      onClick={() => setGuideStep(p => p - 1)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold font-arabic cursor-pointer transition-all"
                    >
                      السابق ➔
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map(step => (
                      <button
                        key={step}
                        onClick={() => setGuideStep(step)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${guideStep === step ? 'bg-dz-emerald w-5' : 'bg-white/10 hover:bg-white/30'}`}
                      />
                    ))}
                  </div>

                  {guideStep < 3 ? (
                    <button
                      onClick={() => setGuideStep(p => p + 1)}
                      className="px-5 py-2.5 bg-linear-to-r from-dz-gold to-dz-emerald hover:scale-105 active:scale-95 text-white rounded-xl text-xs font-black font-arabic cursor-pointer transition-all"
                    >
                      التالي ➔
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowGuide(false)}
                      className="px-5 py-2.5 bg-linear-to-r from-dz-amber to-dz-gold hover:scale-105 active:scale-95 text-white rounded-xl text-xs font-black font-arabic cursor-pointer transition-all shadow-lg"
                    >
                      فهمت، لنبدأ العمل! 🎉
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PlanCheckout open={checkoutOpen} initialPlan={checkoutPlan} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
