import { Lock, Sparkles, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { AI_TOOLS, type AiTool } from '../lib/tools';

const FALLBACK: AiTool = {
  id: 'tool',
  label: 'Outil pro',
  blurb: 'Cette fonctionnalité aide ton e-commerce à vendre plus.',
  icon: Sparkles,
  paid: true,
};

const labelKey = (tab: string) => `tab${tab.charAt(0).toUpperCase()}${tab.slice(1)}`;

export default function LockedTool({ tab, onSubscribe }: { tab: string; onSubscribe: () => void }) {
  const { t } = useLanguage();
  const info = AI_TOOLS.find(x => x.id === tab) || FALLBACK;
  const Icon: LucideIcon = info.icon;
  const label = t(labelKey(tab), info.label);

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-3xl bg-dz-dinar/10 border border-dz-dinar/30 flex items-center justify-center mb-5">
        <Icon size={30} className="text-dz-dinar" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-dz-dinar/30 bg-dz-dinar/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dz-dinar mb-4">
        <Lock size={11} /> Débloqué avec un plan
      </div>

      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">{label}</h2>
      <p className="max-w-md text-sm text-white/50 leading-relaxed mb-6">{info.blurb}</p>
      <p className="max-w-md text-[12px] text-white/30 mb-8">
        Cette fonctionnalité nécessite un plan actif. Abonne-toi pour débloquer l'accès aux 12 outils IA.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onSubscribe}
          className="btn-dz-primary !px-5 !py-2.5 !text-[12px] flex items-center gap-2"
        >
          <Sparkles size={14} /> Voir les plans
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'dashboard' }))}
          className={cn(
            'px-4 py-2.5 rounded-xl text-[12px] font-semibold',
            'border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer'
          )}
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  );
}
