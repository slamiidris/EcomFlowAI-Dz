import { ChevronRight, Clapperboard, LayoutTemplate, Megaphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { keepNumbersTogether } from '../../lib/numberSpacing';
import { BrandMark } from '../BrandMark';
import { Chip, OutputTile, ProductPhoto, TextLines } from './HomeArt';
import '../../i18n/home';

/** The hero illustration: one campaign, its brief on one side and the three outputs it produces on the other. */
export default function HeroVisual() {
  const { t } = useLanguage();
  const headline = t('homeDemoHeadline', 'Une lumière douce pour chaque soir');

  return (
    <figure>
      <div aria-hidden="true" className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex h-11 items-center gap-2 border-b border-line px-4">
          <BrandMark className="size-5" />
          <span className="text-xs text-fg-faint">{t('menuProjects', 'Campagnes')}</span>
          <ChevronRight size={12} className="shrink-0 text-fg-faint rtl:rotate-180" />
          <span className="truncate text-xs font-medium text-fg">{t('homeDemoProduct', 'Lampe de chevet LED')}</span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="space-y-3">
            <ProductPhoto className="aspect-[4/3] rounded-[var(--radius-md)] sm:aspect-[4/5]" />
            <div className="flex flex-wrap gap-1.5">
              <Chip>{t('homeDemoObjective', 'Objectif : ventes')}</Chip>
              <Chip>Facebook · Instagram</Chip>
              <Chip><span dir="ltr">{keepNumbersTogether('2 900 DA')}</span></Chip>
            </div>
          </div>

          <div className="space-y-3">
            <OutputTile icon={LayoutTemplate} label={t('homeDemoLanding', 'Landing page')} status={t('homeDemoReady', 'Prête')}>
              <div className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-bg">
                <div className="flex items-center gap-3 bg-primary/8 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="display-title text-[15px] leading-tight text-fg">{headline}</p>
                    <TextLines widths={['w-4/5', 'w-3/5']} />
                    <span className="mt-2.5 inline-flex rounded-[var(--radius-xs)] bg-primary px-2 py-1 text-[10px] font-semibold text-white">
                      {t('homeDemoOrder', 'Commander')}
                    </span>
                  </div>
                  <ProductPhoto className="size-16 shrink-0 rounded-[var(--radius-xs)]" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-2">
                  {['a', 'b', 'c'].map((k) => <span key={k} className="h-6 rounded-[var(--radius-xs)] bg-surface-2" />)}
                </div>
              </div>
            </OutputTile>

            <div className="grid grid-cols-2 gap-3">
              <OutputTile icon={Clapperboard} label={t('homeDemoVideo', 'Vidéo')}>
                <div className="relative mx-auto aspect-[9/16] w-full max-w-[92px] overflow-hidden rounded-[var(--radius-sm)]">
                  <ProductPhoto className="absolute inset-0" artClassName="scale-125" />
                  <span className="absolute inset-x-1.5 top-2 rounded-[3px] bg-black/60 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
                    {t('homeDemoScene1', 'Accroche')}
                  </span>
                  <span className="absolute inset-x-1.5 bottom-1.5 flex gap-0.5" dir="ltr">
                    <span className="h-0.5 flex-1 rounded-full bg-white" />
                    <span className="h-0.5 flex-1 rounded-full bg-white/40" />
                    <span className="h-0.5 flex-1 rounded-full bg-white/40" />
                  </span>
                </div>
              </OutputTile>

              <OutputTile icon={Megaphone} label={t('homeDemoAds', 'Publicités')}>
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)]">
                  <ProductPhoto className="absolute inset-0" artClassName="-translate-y-[8%]" />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 pt-6">
                    <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white">{headline}</p>
                    <span className="mt-1 inline-flex rounded-[3px] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#17161a]">
                      {t('homeDemoShop', 'Acheter')}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-center text-[10px] tabular-nums text-fg-faint" dir="ltr">1:1 · 4:5 · 9:16</p>
              </OutputTile>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-fg-faint">{t('homeDemoCaption', 'Illustration : les vrais contenus sont générés à partir de tes photos et de ton brief.')}</figcaption>
    </figure>
  );
}
