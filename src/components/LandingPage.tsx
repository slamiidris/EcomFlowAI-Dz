import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { PlanId } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { configApi } from '../services/api';
import HomeHeader from './home/HomeHeader';
import HomeHero from './home/HomeHero';
import HomeHowItWorks from './home/HomeHowItWorks';
import HomePricing from './home/HomePricing';
import { reveal, useReveal } from './home/useReveal';
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

/** The home page is always dark: paint the area outside it too (overscroll), whatever the app's theme. */
function useDarkCanvas() {
  useEffect(() => {
    const body = document.body.style;
    const previous = body.backgroundColor;
    body.backgroundColor = '#0b0b0c';
    return () => { body.backgroundColor = previous; };
  }, []);
}

/** Section headings: one size for the whole page, a little smaller on a phone so they keep to two lines. */
const SECTION_TITLE = 'home-display text-[clamp(2.25rem,1.5rem+2.6vw,4.25rem)] text-fg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  useDocumentMeta({ title: t('metaTitleHome', "EcomFlow AI — Marketing e-commerce propulsé par l'IA"), description: t('metaDescHome') });
  useDarkCanvas();
  useReveal();
  const metaPublishing = useMetaPublishing();

  const choosePlan = (plan: PlanId) => {
    // remembered across sign-up: the app opens the checkout for this plan after the first login
    try { sessionStorage.setItem('dz_plan_intent', plan); } catch { /* storage unavailable: the visitor picks the plan again later */ }
    navigate('/register');
  };

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
    <div className="theme-dark home-site min-h-dvh overflow-x-clip bg-bg text-fg [color-scheme:dark]">
      <HomeHeader />

      <main>
        <HomeHero />

        <HomeHowItWorks titleClass={SECTION_TITLE} />

        <HomePricing onChoose={choosePlan} titleClass={SECTION_TITLE} />

        <section id="faq" tabIndex={-1} aria-labelledby="home-faq" className="scroll-mt-20 outline-none">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:py-44">
            <h2 id="home-faq" className={`${SECTION_TITLE} lg:col-span-4`} {...reveal()}>{t('homeNavFaq', 'Questions fréquentes')}</h2>
            <dl className="grid gap-x-14 gap-y-12 sm:grid-cols-2 lg:col-span-8">
              {faqs.map((f, i) => (
                <div key={f.q} {...reveal(60 + (i % 2) * 70)}>
                  <dt className="text-[17px] font-medium text-fg">{f.q}</dt>
                  <dd className="mt-3 text-[16px] leading-relaxed text-fg-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="home-final" className="px-5 pb-28 sm:px-8">
          <div className="mx-auto max-w-[1440px] rounded-[var(--radius-lg)] bg-surface px-5 py-16 sm:px-14 sm:py-24" {...reveal()}>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 id="home-final" className={SECTION_TITLE}>{t('homeFinalTitle', 'Ton prochain produit mérite une vraie campagne.')}</h2>
                <p className="mt-5 text-[16px] leading-relaxed text-fg-muted">
                  {t('homeFinalText', 'Crée ton compte, ajoute ta clé Gemini et lance ta première campagne à partir d’une photo.')}
                </p>
              </div>
              <Link to="/register" className="pill-cta shrink-0 self-start lg:self-auto">
                {t('homeCtaStart', 'Créer mon compte')}
                <span className="pill-cta-dot"><ArrowUpRight size={18} className="rtl:-scale-x-100" /></span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <p aria-hidden="true" dir="ltr" className="home-display select-none whitespace-nowrap text-[clamp(2.6rem,16.2vw,16.5rem)] leading-[0.85] text-fg/90" {...reveal()}>
            EcomFlow AI
          </p>
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-[13px] text-fg-muted">{t('homeFooterTagline', 'Campagnes e-commerce assistées par l’IA, pensées pour l’Algérie.')}</p>
            <nav aria-label={t('legalFooterNav', 'Informations légales')} className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-fg-muted">
              <Link to="/terms" className="transition-colors hover:text-fg">{t('legalTermsTitle', "Conditions d'utilisation")}</Link>
              <Link to="/privacy" className="transition-colors hover:text-fg">{t('legalPrivacyTitle', 'Politique de confidentialité')}</Link>
              <Link to="/login" className="transition-colors hover:text-fg">{t('lpNavLogin', 'Se connecter')}</Link>
            </nav>
            <p className="text-[13px] text-fg-faint">© {new Date().getFullYear()} EcomFlow AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
