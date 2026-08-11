import { useEffect, useState } from 'react';
import { Megaphone, Flame, ExternalLink, MessageCircle, PlaySquare } from 'lucide-react';
import { contentApi, type Announcement, type HotDeal, type Guide } from '../services/admin';
import { configApi } from '../services/api';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const KIND_STYLES: Record<string, string> = {
  info: 'border-sky-400/25',
  warning: 'border-amber-400/25',
  success: 'border-emerald-400/25',
  promo: 'border-dz-gold/30',
};

const KIND_DOT: Record<string, string> = {
  info: 'bg-sky-400',
  warning: 'bg-amber-400',
  success: 'bg-emerald-400',
  promo: 'bg-dz-gold',
};

/** Default announcement fallback for 7 days free trial. */
const DEFAULT_FREE_TRIAL_ANNOUNCEMENT: Announcement = {
  id: 'default-free-7-days',
  title: "🎁 Offre Spéciale : 7 Jours d'Essai Gratuit !",
  message: "Profitez de 7 jours d'accès gratuit et illimité à tous nos outils IA e-commerce pour tester et booster vos ventes dès aujourd'hui. Pour en profiter, contactez-nous sur WhatsApp !",
  emoji: '🎁',
  kind: 'promo',
  active: true,
  startsAt: null,
  expiresAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Announcements widget — renders announcements or default free 7 days announcement. */
export function AnnouncementsWidget() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Announcement[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    contentApi
      .announcements()
      .then(d => {
        if (!cancelled) {
          setItems(d);
        }
      })
      .catch(() => {});

    configApi
      .get()
      .then(cfg => {
        if (!cancelled && cfg?.whatsappNumber) {
          setWhatsappNumber(cfg.whatsappNumber);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  // Always show the free 7-day announcement first, then any admin announcements below it.
  const freeTrialItem: Announcement = {
    ...DEFAULT_FREE_TRIAL_ANNOUNCEMENT,
    title: t('freeTrialAnnouncementTitle', DEFAULT_FREE_TRIAL_ANNOUNCEMENT.title),
    message: t('freeTrialAnnouncementMessage', DEFAULT_FREE_TRIAL_ANNOUNCEMENT.message),
  };
  const displayItems = [freeTrialItem, ...items];

  return (
    <section className="surface-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone size={15} className="text-dz-emerald" />
        <h3 className="font-display font-semibold text-[15px] text-white">{t('dashWidgetAnnouncements', 'Annonces')}</h3>
      </div>
      <div className="space-y-2.5">
        {displayItems.map(a => {
          const isWhatsAppAnnouncement = a.message.toLowerCase().includes('whatsapp') || a.id.includes('free-7-days');
          const waUrl = whatsappNumber
            ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Bonjour, je souhaite réclamer mon offre de 7 jours d'essai gratuit.")}`
            : '#';

          return (
            <div key={a.id} className={cn('rounded-xl border bg-white/[0.02] p-3.5', KIND_STYLES[a.kind] || KIND_STYLES.info)}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', KIND_DOT[a.kind] || KIND_DOT.info)} />
                <p className="text-[13px] font-semibold text-white">{a.emoji} {a.title}</p>
              </div>
              <p className="text-[12px] text-white/50 leading-relaxed">{a.message}</p>

              {isWhatsAppAnnouncement && (
                <a
                  href={waUrl}
                  {...(whatsappNumber ? { target: '_blank', rel: 'noopener noreferrer' } : { onClick: (e) => { if (!whatsappNumber) { e.preventDefault(); window.dispatchEvent(new CustomEvent('nav-change', { detail: 'contact' })); } } })}
                  className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-[12px] font-semibold hover:bg-[#25D366]/20 transition-colors cursor-pointer"
                >
                  <MessageCircle size={14} />
                  {t('contactUsOnWhatsApp', 'Contactez-nous sur WhatsApp')}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Hot deals widget — renders nothing when there's nothing to show. */
export function HotDealsWidget() {
  const { t } = useLanguage();
  const [items, setItems] = useState<HotDeal[]>([]);

  useEffect(() => {
    let cancelled = false;
    contentApi
      .hotDeals()
      .then(d => { if (!cancelled) setItems(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="surface-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={15} className="text-orange-400" />
        <h3 className="font-display font-semibold text-[15px] text-white">{t('dashWidgetHotDeals', 'Offres chaudes')}</h3>
      </div>
      <div className="space-y-2.5">
        {items.map(d => {
          const Wrapper = d.link ? 'a' : 'div';
          return (
            <Wrapper
              key={d.id}
              {...(d.link ? { href: d.link, target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-2xl leading-none shrink-0">{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-white">{d.title}</p>
                  {d.badge && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25">
                      {d.badge}
                    </span>
                  )}
                </div>
                {d.description && <p className="text-[11px] text-white/45 leading-relaxed mt-0.5">{d.description}</p>}
                <div className="flex items-center gap-1.5 mt-1">
                  {d.price && <span className="text-[12px] font-mono text-dz-dinar font-semibold">{d.price}</span>}
                  {d.link && <ExternalLink size={10} className="text-white/25 ml-auto" />}
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}

function parseYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

/** Video Guides widget — renders video tutorials uploaded by admin. */
export function GuidesWidget() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Guide[]>([]);

  useEffect(() => {
    let cancelled = false;
    contentApi
      .guides()
      .then(d => { if (!cancelled) setItems(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-red-500/20 rounded-lg shrink-0">
          <PlaySquare className="text-red-400 size-4" />
        </div>
        <h2 className="font-display font-semibold text-[15px] text-white">{t('dashGuidesTitle', 'Guides & Tutoriels Vidéo')}</h2>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] font-mono text-white/25">{items.length} {t('guidesCountLabel', 'tutoriels')}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(g => {
          const embedUrl = parseYouTubeEmbedUrl(g.youtubeUrl);
          return (
            <div key={g.id} className="surface-card rounded-2xl overflow-hidden border border-white/10 flex flex-col">
              <div className="aspect-video bg-black/60 relative overflow-hidden border-b border-white/[0.08]">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={g.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <a
                    href={g.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
                  >
                    <PlaySquare size={32} className="text-red-500" />
                    <span className="text-xs font-semibold">{t('watchOnYouTube', 'Regarder la vidéo')}</span>
                  </a>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-white mb-1.5 leading-snug">{g.title}</h3>
                  {g.description && (
                    <p className="text-[12px] text-white/50 leading-relaxed line-clamp-2">{g.description}</p>
                  )}
                </div>
                {g.youtubeUrl && (
                  <a
                    href={g.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-dz-gold hover:underline mt-3 pt-2 border-t border-white/[0.06]"
                  >
                    <ExternalLink size={12} />
                    {t('openYouTubeLink', 'Ouvrir dans YouTube')}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
