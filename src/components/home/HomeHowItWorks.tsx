import type { CSSProperties } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/utils';
import { reveal } from './useReveal';
import '../../i18n/home';

// The home page in three steps and six tools, each with a 3D picture from the Fluent Emoji set already used across
// the app (MIT licence, src/assets/sections/LICENSE.txt). Decorative: the text beside each picture says it all.

const FILES = import.meta.glob<string>('../../assets/sections/*.webp', { eager: true, query: '?no-inline', import: 'default' });
const picture = (name: string) => FILES[`../../assets/sections/${name}.webp`] ?? '';

/** A 3D picture floating over a soft halo of its colour. */
function Art3D({ name, glow, size = 'size-28', delay = 0, className }: { name: string; glow: string; size?: string; delay?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative grid place-items-center', className)}>
      <span className="absolute inset-0 rounded-full opacity-45 blur-2xl" style={{ background: glow }} />
      <img
        src={picture(name)}
        alt=""
        width={128}
        height={128}
        loading="lazy"
        decoding="async"
        className={cn('art-float relative drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)]', size)}
        style={{ '--float-delay': `${delay}s` } as CSSProperties}
      />
    </span>
  );
}

/** The small "made by AI" mark. */
function AiBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/12 px-2.5 py-1 text-[11px] font-semibold text-primary-ink">
      <Sparkles size={12} />
      {label}
    </span>
  );
}

export default function HomeHowItWorks({ titleClass }: { titleClass: string }) {
  const { t } = useLanguage();
  const ai = t('homeAiBadge', 'Fait par l’IA');

  const steps = [
    {
      art: <Art3D name="camera-with-flash" glow="#94a3b8" />,
      title: t('homeHowStep1Title', 'Ajoute la photo de ton produit'),
      text: t('homeHowStep1Text', 'Une seule photo suffit. L’IA lit le produit et remplit le brief pour toi.'),
      ai: false,
    },
    {
      art: (
        <span className="relative">
          <Art3D name="brain" glow="#f472b6" delay={-1.2} />
          <Art3D name="sparkles" glow="#fbbf24" size="size-12" delay={-2.4} className="absolute -end-6 -top-4" />
        </span>
      ),
      title: t('homeHowStep2Title', 'L’IA écrit et dessine'),
      text: t('homeHowStep2Text', 'Textes, script, visuels : tout est créé en quelques secondes, aux couleurs de ta marque.'),
      ai: true,
    },
    {
      art: (
        <span className="flex items-end gap-1">
          <Art3D name="shopping-bags" glow="#38bdf8" size="size-20" delay={-0.6} />
          <Art3D name="clapper-board" glow="#a78bfa" size="size-24" delay={-1.8} />
          <Art3D name="megaphone" glow="#f97316" size="size-20" delay={-3} />
        </span>
      ),
      title: t('homeHowStep3Title', 'Reçois ta campagne prête'),
      text: t('homeHowStep3Text', 'Landing page, vidéo et publicités, à relire, retoucher et publier.'),
      ai: false,
    },
  ];

  const tools = [
    { name: 'shopping-bags', glow: '#38bdf8', label: t('menuLanding', 'Landing pages'), ai: true },
    { name: 'clapper-board', glow: '#a78bfa', label: t('menuVideo', 'Pubs vidéo'), ai: true },
    { name: 'megaphone', glow: '#f97316', label: t('menuAds', 'Publicités'), ai: true },
    { name: 'camera-with-flash', glow: '#94a3b8', label: t('homeHowPhotoStudio', 'Studio photo produit'), ai: true },
    { name: 'artist-palette', glow: '#ec4899', label: t('menuBrand', 'Identité de marque'), ai: false },
    { name: 'money-bag', glow: '#eab308', label: t('menuCalculator', 'Calculateur COD'), ai: false },
  ];

  return (
    <section id="how" tabIndex={-1} aria-labelledby="home-how" className="scroll-mt-20 outline-none">
      <div className="mx-auto max-w-[1440px] px-5 py-28 sm:px-8 lg:py-40">
        <div className="text-center">
          <span {...reveal()} className="inline-block"><AiBadge label={t('homeHowKicker', 'Propulsé par l’IA')} /></span>
          <h2 id="home-how" className={`${titleClass} mx-auto mt-6 max-w-3xl`} {...reveal(60)}>
            {t('homeHowTitle', 'Trois étapes, et l’IA fait le reste.')}
          </h2>
        </div>

        <ol className="mt-20 grid gap-6 lg:grid-cols-3 lg:gap-10">
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center text-center" {...reveal(100 + i * 90)}>
              <div className="grid h-40 place-items-center">{s.art}</div>
              <span className="mt-6 grid size-8 place-items-center rounded-full border border-line text-[13px] font-semibold text-fg" dir="ltr">{i + 1}</span>
              <h3 className="mt-4 text-[22px] font-medium tracking-tight text-fg">{s.title}</h3>
              <p className="mt-3 max-w-xs text-[16px] leading-relaxed text-fg-muted">{s.text}</p>
              {s.ai && <span className="mt-4"><AiBadge label={ai} /></span>}
              {i < steps.length - 1 && (
                <ArrowLeft aria-hidden="true" size={26} className="absolute -end-8 top-20 hidden text-fg-faint lg:block ltr:rotate-180" />
              )}
            </li>
          ))}
        </ol>

        <div id="tools" className="mt-28 scroll-mt-20 rounded-[var(--radius-lg)] bg-surface px-5 py-12 sm:px-10" {...reveal()}>
          <h3 className="text-center text-[24px] font-light tracking-tight text-fg">{t('homeHowToolsTitle', 'Tous tes outils, propulsés par l’IA')}</h3>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {tools.map((tool, i) => (
              <li key={tool.name} className="flex flex-col items-center text-center">
                <Art3D name={tool.name} glow={tool.glow} size="size-16" delay={-i * 0.7} />
                <p className="mt-4 text-[15px] font-medium text-fg">{tool.label}</p>
                {tool.ai && <span className="mt-2"><AiBadge label={ai} /></span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
