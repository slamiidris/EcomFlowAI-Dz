import { useEffect, useState } from 'react';
import { Sparkles, Lock, ArrowRight, Clapperboard, Wand2, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { hasActivePlan } from '../lib/access';
import { useLanguage } from '../context/LanguageContext';
import { dashboardApi, type AiUsageSummary } from '../services/api';
import { CORE_TOOLS, type AiTool } from '../lib/tools';

const openCheckout = () => window.dispatchEvent(new CustomEvent('dz_open_checkout'));
const openTool = (id: string) => window.dispatchEvent(new CustomEvent('nav-change', { detail: id }));

function ToolCard({ tool, locked }: { tool: AiTool; locked: boolean }) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={() => {
        if (locked) openCheckout();
        else openTool(tool.id);
      }}
      className={cn(
        "relative group text-left glass-card p-5 rounded-3xl border transition-all overflow-hidden cursor-pointer",
        locked
          ? "border-white/10 hover:border-dz-dinar/40"
          : "border-white/10 hover:border-dz-emerald/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-dz-emerald/10"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          locked ? "bg-linear-to-br from-dz-dinar/[0.06]" : "bg-linear-to-br from-dz-emerald/[0.07]"
        )}
      />

      <div className="flex items-start justify-between gap-3 mb-4 relative">
        <div
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0",
            locked
              ? "bg-white/[0.04] border-white/10 text-white/30"
              : "bg-linear-to-br from-dz-emerald/25 to-dz-emerald/5 border-dz-emerald/30 text-dz-emerald"
          )}
        >
          <Icon size={20} />
        </div>
        {locked ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-dz-dinar/10 border border-dz-dinar/30 text-[9px] font-black uppercase tracking-widest text-dz-dinar shrink-0">
            <Lock size={10} /> Pro
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full bg-dz-emerald/10 border border-dz-emerald/30 text-[9px] font-black uppercase tracking-widest text-dz-emerald shrink-0">
            Disponible
          </span>
        )}
      </div>

      <h3 className={cn("font-display font-bold text-sm mb-1 relative", locked ? "text-white/60" : "text-white")}>
        {tool.label}
      </h3>
      <p className="text-[11px] text-white/40 leading-relaxed mb-4 relative">{tool.blurb}</p>

      <div
        className={cn(
          "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest relative",
          locked ? "text-dz-dinar/70" : "text-dz-emerald group-hover:text-dz-gold"
        )}
      >
        {locked ? 'Débloquer' : 'Ouvrir'}
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const hasPlan = hasActivePlan(user);
  const [aiUsage, setAiUsage] = useState<AiUsageSummary | null>(null);

  // Load real AI-tool usage counts (one KPI per sidebar tool) on mount.
  useEffect(() => {
    dashboardApi.aiUsage().then(setAiUsage).catch(() => {});
  }, []);

  const kpis = aiUsage ? [
    {
      label: t('dashKpiVideoScripts', 'Scripts vidéo'),
      value: String(aiUsage.videoScripts),
      sub: t('dashKpiVideoSub', 'Pubs vidéo générées'),
      icon: Clapperboard,
    },
    {
      label: t('dashKpiLandingPages', 'Landing pages'),
      value: String(aiUsage.landingPages),
      sub: t('dashKpiLandingSub', 'Tunnels de vente créés'),
      icon: Wand2,
    },
    {
      label: t('dashKpiLpBuilt', 'LP assemblées'),
      value: String(aiUsage.lpSessions),
      sub: t('dashKpiLpSub', 'Constructeur de LP'),
      icon: Layers,
    },
    {
      label: t('dashKpiTotalGen', 'Générations IA'),
      value: String(aiUsage.totalGenerations),
      sub: t('dashKpiTotalSub', 'Total des créations'),
      icon: Sparkles,
    },
  ] : [
    { label: t('dashKpiVideoScripts', 'Scripts vidéo'), value: '—', sub: '…', icon: Clapperboard },
    { label: t('dashKpiLandingPages', 'Landing pages'), value: '—', sub: '…', icon: Wand2 },
    { label: t('dashKpiLpBuilt', 'LP assemblées'), value: '—', sub: '…', icon: Layers },
    { label: t('dashKpiTotalGen', 'Générations IA'), value: '—', sub: '…', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em]">
            {t('dashGreeting', 'Salam,')} {user?.name?.split(' ')[0] || 'Ahmed'} 👋
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            {t('dashSubtitle', "Ton business de dropshipping en un coup d'œil")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-[11px] font-mono text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-dz-emerald animate-pulse" />
            {t('dashMarketLive', 'Marché DZ : Live')}
          </span>
        </div>
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="glass-card p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono text-white/35 uppercase">{kpi.label}</p>
              <div className="w-8 h-8 rounded-lg bg-dz-emerald/10 border border-dz-emerald/30 flex items-center justify-center shrink-0">
                <kpi.icon size={14} className="text-dz-emerald" />
              </div>
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5 truncate">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Upgrade banner — only when the paid tools are locked */}
      {!hasPlan && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-dz-dinar/30 bg-dz-dinar/[0.06] px-4 py-2.5">
          <p className="text-[11px] sm:text-xs text-white/70 flex items-center gap-2">
            <Sparkles size={14} className="text-dz-dinar shrink-0" />
            Débloque les outils IA avec un abonnement.
          </p>
          <button
            type="button"
            onClick={openCheckout}
            className="shrink-0 rounded-lg bg-dz-dinar/20 border border-dz-dinar/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-dz-dinar hover:bg-dz-dinar/30 transition-colors cursor-pointer"
          >
            Voir les plans
          </button>
        </div>
      )}

      {/* Tools launcher — mirrors the sidebar's 4 tools */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg shrink-0">
            <Sparkles className="text-emerald-400 size-4" />
          </div>
          <h2 className="font-display font-semibold text-[15px] text-white">{t('dashToolsTitle', 'Tes outils IA')}</h2>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] font-mono text-white/25">{CORE_TOOLS.length} outils</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} locked={tool.paid && !hasPlan} />
          ))}
        </div>
      </section>
    </div>
  );
}
