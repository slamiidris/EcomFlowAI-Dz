import { Fragment, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ArrowLeft, Lock, LayoutTemplate, Clapperboard, Palette, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlanId } from '../context/AuthContext';
import { PLAN_EMOJI, buildPlans, usePricing } from '../lib/pricing';
import { useLanguage, Language } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '../lib/utils';
import ecomflowLogo from '../images/EcomFlow.png';
import exemple1 from '../images/exemple1.webp';
import exemple2 from '../images/exemple2.webp';

// Market-pulse ticker content — capability phrases, no made-up stats or products.
const TICKERS: Record<Language, string[]> = {
  en: [
    'AI Landing Pages — Built to convert',
    'Ad Creatives — Ready to launch',
    'Marketing Videos — From your product',
    'Product Analysis — Angles & audience',
    'Campaign Copy — Hooks that sell',
    'Launch-Ready Assets — In minutes',
  ],
  ar: [
    'صفحات هبوط بالذكاء الاصطناعي — مصممة للتحويل',
    'تصاميم إعلانية — جاهزة للإطلاق',
    'فيديوهات تسويقية — من منتجك',
    'تحليل المنتج — الزوايا والجمهور',
    'نصوص إعلانية — تجذب الزبون',
    'محتوى جاهز للإطلاق — في دقائق',
  ],
  fr: [
    'Landing Pages IA — Conçues pour convertir',
    'Créations publicitaires — Prêtes à lancer',
    'Vidéos marketing — À partir de ton produit',
    'Analyse produit — Angles & audience',
    'Textes publicitaires — Des hooks qui vendent',
    'Contenus prêts — En quelques minutes',
  ],
};

// Product → campaign pipeline shown inside the dashboard mockup.
const PIPELINE: Record<Language, string[]> = {
  en: ['Upload', 'Analyze', 'Landing', 'Creatives', 'Video', 'Launch'],
  ar: ['ارفع', 'حلّل', 'هبوط', 'إعلانات', 'فيديو', 'أطلق'],
  fr: ['Importer', 'Analyser', 'Landing', 'Créas', 'Vidéo', 'Lancer'],
};

const ACTIVITY: Record<Language, { type: string; title: string; time: string }[]> = {
  en: [
    { type: '⚡', title: 'Landing Page · Skincare Serum', time: '2h ago' },
    { type: '🎨', title: 'Ad Creative · Coffee Maker', time: 'yesterday' },
    { type: '🎬', title: 'Marketing Video · Sneakers', time: '3d ago' },
  ],
  ar: [
    { type: '⚡', title: 'صفحة هبوط · سيروم العناية', time: 'قبل ساعتين' },
    { type: '🎨', title: 'إعلان · آلة القهوة', time: 'أمس' },
    { type: '🎬', title: 'فيديو تسويقي · حذاء رياضي', time: 'قبل 3 أيام' },
  ],
  fr: [
    { type: '⚡', title: 'Landing Page · Sérum Visage', time: 'il y a 2h' },
    { type: '🎨', title: 'Créatif · Machine à Café', time: 'hier' },
    { type: '🎬', title: 'Vidéo Marketing · Sneakers', time: 'il y a 3j' },
  ],
};

const FEATURES = [
  { icon: LayoutTemplate, color: 'text-dz-gold', titleKey: 'lpFeat1Title', descKey: 'lpFeat1Desc' },
  { icon: Palette, color: 'text-dz-amber', titleKey: 'lpFeat2Title', descKey: 'lpFeat2Desc' },
  { icon: Clapperboard, color: 'text-dz-emerald', titleKey: 'lpFeat3Title', descKey: 'lpFeat3Desc' },
  { icon: Sparkles, color: 'text-dz-dinar', titleKey: 'lpFeat4Title', descKey: 'lpFeat4Desc' },
];

const STEPS = [
  { titleKey: 'lpStep1Title', descKey: 'lpStep1Desc' },
  { titleKey: 'lpStep2Title', descKey: 'lpStep2Desc' },
  { titleKey: 'lpStep3Title', descKey: 'lpStep3Desc' },
  { titleKey: 'lpStep4Title', descKey: 'lpStep4Desc' },
  { titleKey: 'lpStep5Title', descKey: 'lpStep5Desc' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();

  // Prices + currency come from the server (admin-editable PlatformConfig).
  const pricing = usePricing();
  const plans = useMemo(() => buildPlans(pricing), [pricing]);

  // Arabic typography: swap display/mono fonts for the Arabic typeface, drop latin tracking.
  const display = language === 'ar' ? 'font-arabic' : 'font-display';
  const label = language === 'ar' ? 'font-arabic tracking-normal' : 'font-mono';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleSubscribe = (plan: PlanId) => {
    // Remember the plan across the auth flow; the app opens the checkout after login.
    sessionStorage.setItem('dz_plan_intent', plan);
    navigate('/register');
  };

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const tickerItems = TICKERS[language];
  const pipelineSteps = PIPELINE[language];
  const activityItems = ACTIVITY[language];

  const showcaseItems = [
    { src: exemple2, titleKey: 'lpShowcaseCard1Title' as const },
    { src: exemple1, titleKey: 'lpShowcaseCard2Title' as const },
  ];
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  return (
    <div className={cn('min-h-screen bg-dz-green text-white overflow-x-hidden', language === 'ar' && 'font-arabic')}>
      {/* NAV — Linear/Vercel-inspired clean navbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-dz-green/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <img src={ecomflowLogo} alt="EcomFlow AI" className="w-9 h-9 rounded-full object-cover shadow-[0_0_12px_rgba(212,164,76,0.1)] group-hover:shadow-[0_0_20px_rgba(212,164,76,0.2)] transition-all duration-300" />
            <span className="font-display font-bold text-[15px] tracking-[-0.01em]">
              <span className="text-white">EcomFlow </span><span className="brand-shimmer">AI</span>
            </span>
          </a>

          {/* Center nav — desktop only */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: t('lpNavFeatures'), href: '#features' },
              { label: t('lpNavHow'), href: '#how-it-works' },
              { label: t('lpNavShowcase'), href: '#showcase' },
              { label: t('lpNavPricing'), href: '#pricing' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-[13px] text-white/40 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3 py-2 text-[13px] font-medium text-white/40 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              {t('lpNavLogin')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="ml-1 px-4 py-2 text-[13px] font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-lg text-white transition-all cursor-pointer"
            >
              {t('lpNavGetStarted')}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-dz-emerald/[0.06] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-dz-gold/[0.05] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-64 right-10 w-72 h-72 bg-dz-amber/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-white/50">
              <Zap size={11} /> {t('lpBadge')}
            </span>

            <h1 className={cn(
              'mt-8 text-5xl sm:text-7xl font-bold leading-[1.05]',
              language === 'ar' ? 'font-arabic' : 'font-display tracking-[-0.04em]'
            )}>
              {t('lpHeadline')}
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-dz-gold via-dz-emerald to-dz-dinar">
                {t('lpHeadlineHighlight')}
              </span>
            </h1>

            <p className="text-white/45 max-w-2xl mx-auto text-base sm:text-lg mt-6 leading-relaxed">
              {t('lpDesc').split('EcomFlow AI').map((part, i, arr) => (
                i < arr.length - 1
                  ? <Fragment key={i}>{part}<span className="font-semibold brand-shimmer">EcomFlow AI</span></Fragment>
                  : <Fragment key={i}>{part}</Fragment>
              ))}
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="btn-dz-primary group w-full sm:w-auto"
              >
                {t('lpCtaPrimary')}
                <ArrowIcon size={16} className={cn('opacity-60 transition-transform group-hover:translate-x-0.5', isRTL && 'group-hover:-translate-x-0.5')} />
              </button>
              <button
                type="button"
                onClick={() => scrollToId('how-it-works')}
                className="text-[13px] text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {t('lpCtaSecondary')}
              </button>
            </div>

            <p className={cn('flex items-center justify-center gap-1.5 text-[11px] text-white/25 mt-4', label)}>
              {t('lpTrust')}
            </p>

            {/* Brand identity callout */}
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-dz-emerald/[0.06] border border-dz-emerald/[0.12] backdrop-blur-sm">
              <Sparkles size={13} className="text-dz-gold" />
              <span className="text-[11px] text-white/40">Powered by</span>
              <span className="text-[13px] font-bold brand-shimmer">EcomFlow AI</span>
            </div>
          </motion.div>

          {/* HERO MOCKUP — Premium dashboard preview */}
          <div className="relative isolate mt-16 mx-auto max-w-5xl text-left">
            <div className="relative rounded-2xl border border-white/[0.08] bg-dz-card shadow-[0_25px_100px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Lock size={9} className="text-white/25" />
                    <span className="text-[10px] font-mono text-white/30">{t('lpMockUrl')}</span>
                  </div>
                </div>
              </div>

              {/* Dashboard body */}
              <div className="flex min-h-[320px] sm:min-h-[380px]">
                {/* Sidebar */}
                <div className="hidden sm:flex flex-col w-14 border-r border-white/[0.06] bg-white/[0.015] py-3 items-center gap-1.5">
                  {[
                    { active: true, icon: '📊' },
                    { active: false, icon: '📦' },
                    { active: false, icon: '🤖' },
                    { active: false, icon: '⚡' },
                    { active: false, icon: '🎨' },
                    { active: false, icon: '🎬' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all',
                        item.active
                          ? 'bg-dz-emerald/15 border border-dz-emerald/25'
                          : 'hover:bg-white/[0.04]'
                      )}
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 sm:p-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { labelKey: 'lpKpiProducts', value: '8', delta: '+2', icon: '📦' },
                      { labelKey: 'lpKpiAnalysis', value: '12', delta: '+4', icon: '🤖' },
                      { labelKey: 'lpKpiLanding', value: '6', delta: '+1', icon: '⚡' },
                      { labelKey: 'lpKpiCampaigns', value: '3', delta: '+1', icon: '🚀' },
                    ].map((kpi) => (
                      <div key={kpi.labelKey} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-xs">{kpi.icon}</span>
                          <span className={cn('text-[9px] uppercase tracking-wider text-white/30', label)}>{t(kpi.labelKey)}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-lg sm:text-xl font-bold text-white">{kpi.value}</span>
                          <span className="text-[9px] font-bold text-emerald-400">{kpi.delta}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pipeline visualization */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn('text-[9px] uppercase tracking-wider text-white/30', label)}>{t('lpPipelineLabel')}</span>
                      <div className="flex-1 h-px bg-white/[0.04]" />
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {pipelineSteps.map((step, i) => (
                        <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold',
                            i <= 2
                              ? 'bg-dz-emerald/20 text-dz-emerald border border-dz-emerald/30'
                              : 'bg-white/[0.04] text-white/30 border border-white/[0.06]'
                          )}>
                            {i + 1}
                          </div>
                          <span className={cn(
                            'text-[10px] truncate hidden sm:inline',
                            i <= 2 ? 'text-white/70' : 'text-white/25'
                          )}>
                            {step}
                          </span>
                          {i < 5 && <div className={cn('w-4 h-px shrink-0', i < 2 ? 'bg-dz-emerald/30' : 'bg-white/[0.06]')} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini chart + activity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Chart area */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <span className={cn('text-[9px] uppercase tracking-wider text-white/30', label)}>{t('lpChartLabel')}</span>
                      <div className="flex items-end gap-1.5 mt-2 h-12">
                        {[35, 50, 42, 65, 55, 78, 70, 85, 60, 92, 75, 88].map((h, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex-1 rounded-sm transition-all',
                              i >= 10 ? 'bg-dz-emerald/40' : 'bg-dz-emerald/15'
                            )}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <span className={cn('text-[9px] uppercase tracking-wider text-white/30', label)}>{t('lpActivityLabel')}</span>
                      <div className="space-y-2 mt-2">
                        {activityItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px]">{item.type}</span>
                            <span className="text-[10px] text-white/50 truncate flex-1">{item.title}</span>
                            <span className={cn('text-[8px] text-white/20', label)}>{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow behind mockup */}
            <div className="absolute inset-0 -z-10 mx-auto max-w-5xl h-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-dz-emerald/[0.03] blur-[100px] rounded-full" />
              <div className="absolute top-1/3 right-0 w-1/2 h-1/2 bg-dz-gold/[0.02] blur-[80px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES TICKER (signature) */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-3">
        <div className="dz-ticker">
          <div className="dz-ticker-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {tickerItems.map((item, i) => (
                  <span
                    key={`${dup}-${i}`}
                    className={cn('flex items-center gap-3 px-5 whitespace-nowrap text-[12px] text-white/30', label)}
                  >
                    <span className="text-dz-emerald">◈</span>
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="py-8 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-4 text-[13px] text-white/35">
          <span className="text-dz-emerald">◈</span>
          {t('lpStrip')}
          <span className="text-dz-emerald">◈</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className={cn('text-[10px] uppercase tracking-[0.3em] text-dz-emerald/70 mb-3', label)}>{t('lpFeatLabel')}</p>
          <h2 className={cn('text-3xl sm:text-4xl font-bold tracking-tight', display)}>
            {t('lpFeatTitleA')}<span className="text-dz-emerald">{t('lpFeatTitleB')}</span>
          </h2>
          <p className="mt-3 text-white/45 text-sm max-w-xl mx-auto leading-relaxed">{t('lpFeatDesc')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
              className="surface-card p-5 sm:p-6"
            >
              <div className={cn('w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4', f.color)}>
                <f.icon size={20} />
              </div>
              <h3 className={cn('font-semibold text-[15px] text-white mb-1', display)}>{t(f.titleKey)}</h3>
              <p className="text-[13px] text-white/45 leading-relaxed">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className={cn('text-[10px] uppercase tracking-[0.3em] text-dz-emerald/70 mb-3', label)}>{t('lpHowLabel')}</p>
          <h2 className={cn('text-3xl sm:text-4xl font-bold tracking-tight', display)}>{t('lpHowTitle')}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.titleKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 5) * 0.08 }}
              className="surface-card p-5 sm:p-6"
            >
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-dz-gold to-dz-emerald text-black font-black flex items-center justify-center text-sm mb-4 shadow-[0_4px_16px_rgba(212,164,76,0.25)]">
                {i + 1}
              </div>
              <h3 className={cn('font-semibold text-[15px] text-white mb-1', display)}>{t(s.titleKey)}</h3>
              <p className="text-[13px] text-white/45 leading-relaxed">{t(s.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SHOWCASE / EXAMPLES */}
      <section id="showcase" className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className={cn('text-[10px] uppercase tracking-[0.3em] text-dz-emerald/70 mb-3', label)}>
            {t('lpShowcaseLabel')}
          </p>
          <h2 className={cn('text-3xl sm:text-4xl font-bold tracking-tight', display)}>
            {t('lpShowcaseTitleA')}<span className="text-dz-emerald">{t('lpShowcaseTitleB')}</span>
          </h2>
          <p className="mt-3 text-white/45 text-sm max-w-xl mx-auto leading-relaxed">
            {t('lpShowcaseDesc')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {showcaseItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="surface-card p-3 overflow-hidden group cursor-pointer"
              onClick={() => setPreviewIdx(i)}
            >
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={item.src}
                  alt={t(item.titleKey)}
                  loading="lazy"
                  className="w-full h-[480px] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                <p className={cn('absolute bottom-3 left-4 right-4 text-[13px] font-semibold text-white drop-shadow-lg', display)}>
                  {t(item.titleKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SHOWCASE PREVIEW MODAL */}
      {previewIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewIdx(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-dz-card rounded-2xl border border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
              <p className={cn('text-sm font-semibold text-white', display)}>
                {t(showcaseItems[previewIdx].titleKey)}
              </p>
              <button
                onClick={() => setPreviewIdx(null)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <img
                src={showcaseItems[previewIdx].src}
                alt={t(showcaseItems[previewIdx].titleKey)}
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* PRICING */}
      <section id="pricing" className="py-24 sm:py-32 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className={cn('text-[10px] uppercase tracking-[0.3em] text-dz-dinar/80 mb-3', label)}>{t('lpPriceLabel')}</p>
          <h2 className={cn('text-3xl sm:text-4xl font-bold tracking-tight', display)}>
            {t('lpPriceTitleA')}<span className="text-dz-dinar">{t('lpPriceTitleB')}</span>
          </h2>
          <p className="mt-3 text-white/45 text-sm">{t('lpPriceSub')}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 items-stretch">
          {plans.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className={cn(
                'surface-card relative p-6 flex flex-col',
                p.popular && 'border-dz-emerald/60 ring-4 ring-dz-emerald/10 lg:-mt-4 lg:mb-4'
              )}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-linear-to-r from-dz-gold to-dz-emerald text-black px-3 py-1 rounded-full whitespace-nowrap">
                  ⭐ {t('lpPricePopular')}
                </span>
              )}

              <p className={cn('text-[10px] uppercase tracking-widest text-white/40', label)}>{p.tagline}</p>
              <h3 className={cn('text-xl font-bold mt-1.5 flex items-center gap-2', display)}>
                <span>{PLAN_EMOJI[p.id]}</span> {p.label}
              </h3>

              <div className="mt-4 mb-1">
                <span className="font-display font-bold text-3xl text-dz-dinar">{p.price}</span>
                <span className="ml-2 text-sm text-white/45 font-mono">{p.note}</span>
              </div>
              <p className="text-[12px] text-white/45 mb-5">{p.per}</p>

              <ul className="space-y-2 mb-7 text-[13px] text-white/45 flex-1">
                {[t('lpPriceFeature1'), t('lpPriceFeature2'), t('lpPriceFeature3')].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-dz-emerald mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscribe(p.id)}
                className={cn('w-full', p.popular ? 'btn-dz-primary' : 'btn-dz-secondary')}
              >
                {t('lpPriceCta')}
              </button>
            </motion.div>
          ))}
        </div>

        <p className={cn('text-center text-[11px] text-white/30 mt-8', label)}>
          {t('lpPriceNote')}
        </p>
      </section>

      {/* CTA BAND */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-dz-emerald/[0.04] blur-[100px]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={cn('text-3xl sm:text-4xl font-bold tracking-tight', display)}>
            {t('lpCtaTitle')}
          </h2>
          <p className="mt-4 text-white/45 text-base leading-relaxed">
            {t('lpCtaDesc')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="btn-dz-primary mx-auto mt-8"
          >
            {t('lpCtaButton')}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/30">
          <p className={label}>{t('lpFooter').split('EcomFlow AI').map((part, i, arr) => (
            i < arr.length - 1
              ? <Fragment key={i}>{part}<span className="font-bold brand-shimmer">EcomFlow AI</span></Fragment>
              : <Fragment key={i}>{part}</Fragment>
          ))}</p>
          <p className={cn('text-dz-emerald/70', label)}>{t('lpFooterMeta')}</p>
        </div>
      </footer>
    </div>
  );
}
