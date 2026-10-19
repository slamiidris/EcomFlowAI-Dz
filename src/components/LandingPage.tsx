import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Clapperboard, FolderOpen, Languages, LayoutTemplate, Megaphone, Menu, Palette, ShieldCheck, Wallet, X,
  type LucideIcon,
} from 'lucide-react';
import type { PlanId } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePricing } from '../lib/pricing';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { configApi } from '../services/api';
import { BrandLogo } from './BrandMark';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import HeroVisual from './home/HeroVisual';
import HomePricing from './home/HomePricing';
import { AdsVisual, BrandVisual, LandingVisual, LibraryVisual, MetaVisual, VideoVisual } from './home/StudioVisuals';
import '../i18n/home';

/** Is Meta publishing set up on this site? The page only talks about it then. */
function useMetaPublishing(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let alive = true;
    configApi.get().then((c) => alive && setEnabled(Boolean(c?.metaPublishing))).catch(() => {});
    return () => { alive = false; };
  }, []);
  return enabled;
}

function SiteHeader() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const links = [
    { href: '#workflow', label: t('homeNavHow', 'Comment ça marche') },
    { href: '#studios', label: t('homeNavStudios', 'Studios') },
    { href: '#pricing', label: t('homeNavPricing', 'Tarifs') },
    { href: '#faq', label: t('homeNavFaq', 'Questions fréquentes') },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="EcomFlow AI">
          <BrandLogo />
        </Link>
        <nav aria-label={t('homeNavLabel', 'Sections')} className="ms-6 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-[var(--radius-sm)] px-3 py-1.5 text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle className="hidden sm:grid" />
          <Link to="/login" className="hidden whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg sm:inline-flex">
            {t('lpNavLogin', 'Se connecter')}
          </Link>
          <Link to="/register" className="btn-dz-primary hidden !min-h-9 whitespace-nowrap !px-4 !py-1.5 !text-[13px] sm:inline-flex">
            {t('lpNavGetStarted', 'Créer un compte')}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="home-menu"
            aria-label={open ? t('homeMenuClose', 'Fermer le menu') : t('homeMenuOpen', 'Ouvrir le menu')}
            className="grid size-10 place-items-center rounded-[var(--radius-sm)] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="home-menu" aria-label={t('homeNavLabel', 'Sections')} className="border-t border-line bg-bg px-4 py-3 sm:px-6 lg:hidden">
          <ul className="mx-auto max-w-7xl">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-[15px] font-medium text-fg hover:bg-surface-2">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-2 flex max-w-7xl items-center gap-2 border-t border-line px-1 pt-3 sm:hidden">
            <Link to="/register" className="btn-dz-primary flex-1">{t('lpNavGetStarted', 'Créer un compte')}</Link>
            <Link to="/login" className="btn-dz-secondary flex-1">{t('lpNavLogin', 'Se connecter')}</Link>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}

function SectionIntro({ eyebrow, title, id, children }: { eyebrow: string; title: string; id: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="display-title mt-3 text-4xl text-fg sm:text-5xl">{title}</h2>
      {children}
    </div>
  );
}

function PointList({ points }: { points: string[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {points.map((p) => (
        <li key={p} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-fg">
          <Check size={16} className="mt-0.5 shrink-0 text-primary-ink" />
          {p}
        </li>
      ))}
    </ul>
  );
}

interface Studio { id: string; icon: LucideIcon; eyebrow: string; title: string; text: string; points: string[]; visual: ReactNode }

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  useDocumentMeta({ title: t('metaTitleHome', "EcomFlow AI — Marketing e-commerce propulsé par l'IA"), description: t('metaDescHome') });
  const pricing = usePricing();
  const metaPublishing = useMetaPublishing();

  const choosePlan = (plan: PlanId) => {
    // remembered across sign-up: the app opens the checkout for this plan after the first login
    try { sessionStorage.setItem('dz_plan_intent', plan); } catch { /* storage unavailable: the visitor picks the plan again later */ }
    navigate('/register');
  };

  const facts: { icon: LucideIcon; text: string }[] = [
    { icon: Wallet, text: t('homeFactLocal', 'Paiement local ({currency})', { currency: pricing.currencyCode }) },
    { icon: Languages, text: t('homeFactLangs', 'Arabe, français, anglais') },
    { icon: ShieldCheck, text: t('homeFactControl', 'Rien n’est publié sans ton accord') },
  ];
  const steps = [
    { title: t('homeStep1Title', 'Le brief'), text: t('homeStep1Text', 'Ajoute jusqu’à 8 photos. L’IA peut remplir le nom, les avantages, le public et le ton à partir de la première.') },
    { title: t('homeStep2Title', 'La génération'), text: t('homeStep2Text', 'Landing page, script vidéo et publicités partent du même brief et de ton identité de marque. Chacun peut être relancé seul.') },
    { title: t('homeStep3Title', 'La retouche'), text: t('homeStep3Text', 'Modifie les textes, réordonne les sections, change de format. Chaque génération est gardée comme une version.') },
    {
      title: t('homeStep4Title', 'L’export'),
      text: metaPublishing
        ? t('homeStep4TextMeta', 'Télécharge tout, ou crée la campagne sur Facebook et Instagram : elle reste en pause jusqu’à ta confirmation.')
        : t('homeStep4Text', 'Télécharge la page HTML, la vidéo, les visuels et les textes publicitaires en CSV.'),
    },
  ];
  const studios: Studio[] = [
    {
      id: 'landing',
      icon: LayoutTemplate,
      eyebrow: t('menuLanding', 'Landing pages'),
      title: t('homeLandingTitle', 'Une page de vente prête pour le paiement à la livraison'),
      text: t('homeLandingText', 'Des textes écrits pour ton produit et ton public, et un formulaire de commande avec les 58 wilayas. Les commandes arrivent sur ton WhatsApp ou sur ton propre webhook.'),
      points: [
        t('homeLandingPoint1', 'Arabe et darija, français ou anglais'),
        t('homeLandingPoint2', 'Sections à réécrire, réordonner ou retirer'),
        t('homeLandingPoint3', 'Une page HTML autonome, à héberger où tu veux'),
      ],
      visual: <LandingVisual />,
    },
    {
      id: 'video',
      icon: Clapperboard,
      eyebrow: t('menuVideo', 'Pubs vidéo'),
      title: t('homeVideoTitle', 'Un script scène par scène, puis la vidéo'),
      text: t('homeVideoText', 'L’IA écrit l’accroche, les scènes et le texte à l’écran. La vidéo est ensuite montée dans ton navigateur à partir de tes photos.'),
      points: [
        t('homeVideoPoint1', 'Formats 9:16, 4:5, 1:1 et 16:9'),
        t('homeVideoPoint2', 'Export MP4 (ou WebM selon le navigateur), sans bande son'),
        t('homeVideoPoint3', 'Plans vidéo générés par IA (Veo) en option, avec la facturation Google'),
      ],
      visual: <VideoVisual />,
    },
    {
      id: 'ads',
      icon: Megaphone,
      eyebrow: t('menuAds', 'Publicités'),
      title: t('homeAdsTitle', 'Des concepts publicitaires et leurs visuels'),
      text: t('homeAdsText', 'Plusieurs angles, chacun avec son texte principal, son titre, sa description et son bouton d’action. Les visuels sont composés avec tes photos et tes couleurs.'),
      points: [
        t('homeAdsPoint1', 'Carré, portrait et story, avec zone de sécurité'),
        t('homeAdsPoint2', 'Textes exportables en CSV'),
        t('homeAdsPoint3', 'Visuels enregistrés dans ta bibliothèque'),
      ],
      visual: <AdsVisual />,
    },
  ];
  const faqs = [
    { q: t('homeFaq1Q', 'Faut-il savoir designer ou écrire des pubs ?'), a: t('homeFaq1A', 'Non. Tu fournis les photos et quelques informations, puis tu relis et ajustes ce que l’IA propose.') },
    { q: t('homeFaq2Q', 'Quelle clé IA faut-il ?'), a: t('homeFaq2A', 'Une clé Gemini, créée gratuitement sur Google AI Studio. Elle est enregistrée chiffrée dans ton compte et n’est jamais réaffichée en entier.') },
    {
      q: t('homeFaq3Q', 'Mes publicités partent-elles toutes seules ?'),
      a: metaPublishing
        ? t('homeFaq3AMeta', 'Non. Tu télécharges tes contenus, ou tu crées la campagne depuis l’app : elle reste en pause tant que tu ne l’as pas activée.')
        : t('homeFaq3A', 'Non. Tu télécharges tes contenus et tu les publies toi-même, quand tu veux.'),
    },
    { q: t('homeFaq4Q', 'Comment se passe le paiement ?'), a: t('homeFaq4A', 'Tu choisis un plan, tu paies avec l’un des moyens indiqués, puis tu envoies le justificatif depuis l’app. Un admin le vérifie et active ton accès.') },
    { q: t('homeFaq5Q', 'Dans quelles langues ?'), a: t('homeFaq5A', 'L’interface et les contenus générés existent en arabe, en français et en anglais. Chaque campagne choisit sa propre langue.') },
    { q: t('homeFaq6Q', 'Mes données sont-elles séparées de celles des autres ?'), a: t('homeFaq6A', 'Oui. Chaque campagne, fichier et connexion appartient à ton compte, et le serveur vérifie le propriétaire à chaque requête.') },
  ];

  return (
    <div className="min-h-dvh overflow-x-clip bg-bg text-fg">
      <SiteHeader />

      <main>
        <section aria-labelledby="home-hero" className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_88%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)] rtl:bg-[radial-gradient(50%_60%_at_12%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-32 lg:pt-24">
            <div className="lg:col-span-5 lg:pt-8">
              <p className="eyebrow">{t('homeHeroEyebrow', 'Pour les vendeurs e-commerce en Algérie')}</p>
              <h1 id="home-hero" className="display-title mt-5 text-[clamp(2.75rem,1.9rem+3vw,4.25rem)] text-fg rtl:text-[clamp(2.4rem,1.6rem+2.4vw,3.6rem)]">
                {t('homeHeroTitleA', 'Une photo produit.')}
                <br />
                <em className="text-primary-ink rtl:not-italic">{t('homeHeroTitleB', 'Toute la campagne.')}</em>
              </h1>
              <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-fg-muted">
                {t('homeHeroLead', 'Dépose les photos de ton produit. EcomFlow AI écrit la landing page, le script vidéo et les publicités, aux couleurs de ta marque, en arabe, en français ou en anglais.')}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link to="/register" className="btn-dz-primary group !px-6">
                  {t('homeCtaStart', 'Créer mon compte')}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </Link>
                <a href="#workflow" className="text-sm font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline">
                  {t('homeCtaHow', 'Voir le parcours')}
                </a>
              </div>
              <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-[13px] text-fg-muted">
                {facts.map((f) => (
                  <li key={f.text} className="flex items-center gap-2">
                    <f.icon size={15} className="shrink-0 text-primary-ink" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <HeroVisual />
            </div>
          </div>
        </section>

        <section id="workflow" aria-labelledby="home-flow" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:py-32">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <SectionIntro eyebrow={t('homeFlowEyebrow', 'Le parcours')} title={t('homeFlowTitle', 'Du brief à la mise en ligne, au même endroit.')} id="home-flow">
                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-muted">
                    {t('homeFlowIntro', 'Chaque campagne garde ses photos, son brief et toutes les versions de ses contenus : tu peux régénérer, retoucher ou revenir en arrière à tout moment.')}
                  </p>
                </SectionIntro>
              </div>
            </div>
            <ol className="lg:col-span-7">
              {steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-5 border-t border-line py-8 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_minmax(0,1fr)]">
                  <span className="display-title text-5xl leading-none text-primary-ink" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-fg">{s.title}</h3>
                    <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-fg-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="studios" aria-labelledby="home-studios" className="scroll-mt-20 border-y border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <SectionIntro eyebrow={t('homeStudiosEyebrow', 'Les studios')} title={t('homeStudiosTitle', 'Trois studios, une seule marque.')} id="home-studios" />
            <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-32">
              {studios.map((s, i) => (
                <article key={s.id} aria-labelledby={`studio-${s.id}`} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className={i % 2 === 1 ? 'lg:order-2' : undefined}>
                    <p className="inline-flex items-center gap-2 text-[13px] font-medium text-primary-ink">
                      <s.icon size={15} /> {s.eyebrow}
                    </p>
                    <h3 id={`studio-${s.id}`} className="mt-3 text-balance text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{s.title}</h3>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">{s.text}</p>
                    <PointList points={s.points} />
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-line bg-bg p-6 sm:p-10">{s.visual}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-label={t('homeBrandTitle', 'Ton identité de marque, appliquée partout')} className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-12">
            <article className="ui-card grain overflow-hidden p-7 sm:p-9 lg:col-span-7">
              <Palette size={20} className="text-primary-ink" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-fg">{t('homeBrandTitle', 'Ton identité de marque, appliquée partout')}</h3>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-fg-muted">
                {t('homeBrandText', 'Logo, couleurs, polices, ton et public : l’IA les reprend dans chaque landing page, chaque script et chaque publicité.')}
              </p>
              <div className="mt-9"><BrandVisual /></div>
            </article>
            <article className="ui-card p-7 sm:p-9 lg:col-span-5">
              <FolderOpen size={20} className="text-primary-ink" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-fg">{t('homeLibraryTitle', 'Tous tes fichiers au même endroit')}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
                {t('homeLibraryText', 'Photos produit, logos et visuels générés, rangés par campagne et prêts à être réutilisés.')}
              </p>
              <div className="mt-8"><LibraryVisual /></div>
            </article>
          </div>
        </section>

        {metaPublishing && (
          <section aria-labelledby="home-meta" className="border-t border-line">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-32">
              <div>
                <SectionIntro eyebrow={t('homeMetaEyebrow', 'Publication Meta')} title={t('homeMetaTitle', 'Publie sur Facebook et Instagram sans perdre la main')} id="home-meta">
                  <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">
                    {t('homeMetaText', 'Connecte ton compte publicitaire avec la connexion officielle de Meta. La campagne et ses annonces sont créées en pause : tu vérifies le budget, les dates et le ciblage avant d’activer.')}
                  </p>
                </SectionIntro>
                <PointList
                  points={[
                    t('homeMetaPoint1', 'Connexion officielle, aucun mot de passe partagé'),
                    t('homeMetaPoint2', 'Activation seulement après ta confirmation'),
                    t('homeMetaPoint3', 'Statut et statistiques lus directement chez Meta'),
                  ]}
                />
              </div>
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface-2 p-6 sm:p-10"><MetaVisual /></div>
            </div>
          </section>
        )}

        <HomePricing onChoose={choosePlan} />

        <section id="faq" aria-labelledby="home-faq" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:py-32">
            <h2 id="home-faq" className="display-title text-4xl text-fg sm:text-5xl lg:col-span-4">{t('homeNavFaq', 'Questions fréquentes')}</h2>
            <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-8">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="text-[15px] font-semibold text-fg">{f.q}</dt>
                  <dd className="mt-2 text-[14px] leading-relaxed text-fg-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="home-final" className="px-4 pb-24 sm:px-6">
          <div className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface px-6 py-14 sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_100%_100%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)] rtl:bg-[radial-gradient(60%_90%_at_0%_100%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 id="home-final" className="display-title text-4xl text-fg sm:text-5xl">{t('homeFinalTitle', 'Ton prochain produit mérite une vraie campagne.')}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
                  {t('homeFinalText', 'Crée ton compte, ajoute ta clé Gemini et lance ta première campagne à partir d’une photo.')}
                </p>
              </div>
              <Link to="/register" className="btn-dz-primary group shrink-0 self-start !px-6 lg:self-auto">
                {t('homeCtaStart', 'Créer mon compte')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogo />
            <p className="mt-2 text-[13px] text-fg-muted">{t('homeFooterTagline', 'Campagnes e-commerce assistées par l’IA, pensées pour l’Algérie.')}</p>
          </div>
          <nav aria-label={t('legalFooterNav', 'Informations légales')} className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-fg-muted">
            <Link to="/terms" className="transition-colors hover:text-fg">{t('legalTermsTitle', "Conditions d'utilisation")}</Link>
            <Link to="/privacy" className="transition-colors hover:text-fg">{t('legalPrivacyTitle', 'Politique de confidentialité')}</Link>
            <Link to="/login" className="transition-colors hover:text-fg">{t('lpNavLogin', 'Se connecter')}</Link>
          </nav>
          <p className="text-xs text-fg-faint">© {new Date().getFullYear()} EcomFlow AI</p>
        </div>
      </footer>
    </div>
  );
}
