import { useMemo } from 'react';
import { Check, KeyRound } from 'lucide-react';
import type { PlanId } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { buildPlans, usePricing } from '../../lib/pricing';
import { cn } from '../../lib/utils';
import '../../i18n/home';

/** Plans and prices as the admin set them on the server (PlatformConfig), never hard-coded here. */
export default function HomePricing({ onChoose }: { onChoose: (plan: PlanId) => void }) {
  const { t, tf, language } = useLanguage();
  const pricing = usePricing();
  // tf changes with the language, which is already a dependency
  const plans = useMemo(() => buildPlans(pricing, tf), [pricing, language]);
  const features = [
    t('homePriceFeat1', 'Landing pages, vidéos et publicités'),
    t('homePriceFeat2', 'Identité de marque et bibliothèque de fichiers'),
    t('homePriceFeat3', 'Calcul de marge COD et constructeur de page'),
  ];

  return (
    <section id="pricing" aria-labelledby="home-pricing" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('homeNavPricing', 'Tarifs')}</p>
          <h2 id="home-pricing" className="display-title mt-3 text-4xl text-fg sm:text-5xl">{t('homePriceTitle', 'Un abonnement, tous les studios.')}</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-fg-muted">{t('homePriceSub', 'Tu paies localement, tu envoies le justificatif depuis l’app, et un admin active ton accès.')}</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.id}
              className={cn(
                'flex flex-col rounded-[var(--radius-lg)] border p-6 sm:p-7',
                p.popular ? 'border-primary bg-primary/5 shadow-[var(--shadow-lg)]' : 'border-line bg-surface',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-fg">{p.label}</h3>
                {p.popular && <span className="rounded-[var(--radius-xs)] bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">{t('planRecommended', 'Recommandé')}</span>}
              </div>
              <p className="mt-1 text-[13px] text-fg-muted">{p.tagline}</p>
              <p className="mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-4xl font-semibold tabular-nums tracking-tight text-fg" dir="ltr">{p.price}</span>
                <span className="text-sm text-fg-muted">{p.note}</span>
              </p>
              <p className="mt-1.5 text-xs text-fg-faint">{p.per}</p>
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-5 text-[13px] text-fg-muted">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary-ink" />
                    {f}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => onChoose(p.id)} className={cn('mt-7 w-full', p.popular ? 'btn-dz-primary' : 'btn-dz-secondary')}>
                {t('homePriceSubscribe', 'Choisir ce plan')}
              </button>
            </article>
          ))}
        </div>

        <p className="mt-8 flex max-w-3xl items-start gap-2.5 text-[13px] leading-relaxed text-fg-muted">
          <KeyRound size={15} className="mt-0.5 shrink-0 text-primary-ink" />
          {t('homePriceKeyNote', 'La génération utilise ta propre clé Gemini (Google AI Studio). La clé gratuite suffit pour les textes ; les images et les clips vidéo IA demandent la facturation Google.')}
        </p>
      </div>
    </section>
  );
}
