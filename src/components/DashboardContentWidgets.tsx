import { useEffect, useState } from 'react';
import { Megaphone, Flame, ExternalLink } from 'lucide-react';
import { contentApi, type Announcement, type HotDeal } from '../services/admin';
import { cn } from '../lib/utils';

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

/** Announcements widget — renders nothing when there's nothing to show. */
export function AnnouncementsWidget() {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    let cancelled = false;
    contentApi
      .announcements()
      .then(d => { if (!cancelled) setItems(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="surface-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone size={15} className="text-dz-emerald" />
        <h3 className="font-display font-semibold text-[15px] text-white">Annonces</h3>
      </div>
      <div className="space-y-2.5">
        {items.map(a => (
          <div key={a.id} className={cn('rounded-xl border bg-white/[0.02] p-3.5', KIND_STYLES[a.kind] || KIND_STYLES.info)}>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', KIND_DOT[a.kind] || KIND_DOT.info)} />
              <p className="text-[13px] font-semibold text-white">{a.emoji} {a.title}</p>
            </div>
            <p className="text-[12px] text-white/50 leading-relaxed">{a.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Hot deals widget — renders nothing when there's nothing to show. */
export function HotDealsWidget() {
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
        <h3 className="font-display font-semibold text-[15px] text-white">Offres chaudes</h3>
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
